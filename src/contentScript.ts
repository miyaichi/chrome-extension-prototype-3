// src/contentScript.ts
import {
  ConnectionManager,
  Message,
  useConnectionManager,
} from "./lib/connectionManager";
import {
  ElementInfo,
  SelectElementPayload,
  SelectionModePayload,
} from "./types/domSelection";

// Define specific CSS properties we'll work with
type StyleProperty = "backgroundColor" | "outline" | "border";

interface ElementStyle {
  originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>>;
  element: HTMLElement;
}

// Maintain styles per tab
const styleMap = new Map<number, ElementStyle>();
let currentTabId: number;
let selectionModeEnabled = false;

const { sendMessage, subscribe } = useConnectionManager();
const manager = ConnectionManager.getInstance();
manager.setContext("content");

// Get current tab ID
chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB" }, (response) => {
  currentTabId = response.tabId;
});

// Selection mode cursor style
const updateCursorStyle = (enabled: boolean) => {
  document.body.style.cursor = enabled ? "crosshair" : "";
};

// Helper function to get element path
const getElementPath = (element: HTMLElement): number[] => {
  const path: number[] = [];
  let current = element;

  while (current.parentElement) {
    const parent = current.parentElement;
    const children = Array.from(parent.children);
    const index = children.indexOf(current);
    path.unshift(index);
    current = parent;
  }

  return path;
};

// Helper function to get element by path
const getElementByPath = (path: number[]): HTMLElement | null => {
  let current: HTMLElement = document.body;

  for (const index of path) {
    const children = Array.from(current.children) as HTMLElement[];
    if (index >= children.length) return null;
    current = children[index];
  }

  return current;
};

// Helper function to get element start tag
const getElementStartTag = (element: HTMLElement): string => {
  const clone = element.cloneNode(false) as HTMLElement;
  return clone.outerHTML.split(">")[0] + ">";
};

// Style management functions
const saveElementStyle = (element: HTMLElement): void => {
  if (styleMap.has(currentTabId)) {
    // Restore previous element's style before saving new one
    restoreElementStyle();
  }

  const originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>> = {};
  const styleProperties: StyleProperty[] = [
    "backgroundColor",
    "outline",
    "border",
  ];

  styleProperties.forEach((prop) => {
    originalStyles[prop] = element.style[prop];
  });

  styleMap.set(currentTabId, {
    originalStyles,
    element,
  });
};

const applyHighlightStyle = (element: HTMLElement): void => {
  element.style.backgroundColor = "rgba(255, 255, 0, 0.3)";
  element.style.outline = "2px solid #ffd700";
  element.style.border = "1px solid #ffd700";
};

const restoreElementStyle = (): void => {
  const storedStyle = styleMap.get(currentTabId);
  if (!storedStyle) return;

  const { element, originalStyles } = storedStyle;
  Object.entries(originalStyles).forEach(([prop, value]) => {
    if (value !== undefined && prop in element.style) {
      element.style[prop as StyleProperty] = value;
    }
  });

  styleMap.delete(currentTabId);
};

// Click handler
const handleElementClick = (event: MouseEvent): void => {
  // If selection mode is disabled, do nothing
  if (!selectionModeEnabled) return;

  const element = event.target as HTMLElement;
  if (!element || element === document.body) return;

  event.preventDefault();
  event.stopPropagation();

  // Save element info
  const elementInfo: ElementInfo = {
    startTag: getElementStartTag(element),
    path: getElementPath(element),
  };

  // Save element style and apply highlight
  saveElementStyle(element);
  applyHighlightStyle(element);

  sendMessage("ELEMENT_SELECTED", { elementInfo });
};

// Subscribe to selection mode toggle
subscribe("TOGGLE_SELECTION_MODE", (message: Message<SelectionModePayload>) => {
  selectionModeEnabled = message.payload.enabled;
  updateCursorStyle(selectionModeEnabled);

  if (!selectionModeEnabled) {
    restoreElementStyle(); // Clear any selected elements when disabling
  }
});

// Subscribe to element selection messages from other components
subscribe("SELECT_ELEMENT", (message: Message<SelectElementPayload>) => {
  const element = getElementByPath(message.payload.elementInfo.path);
  if (!element) return;

  saveElementStyle(element);
  applyHighlightStyle(element);
});

// Subscribe to clear selection messages
subscribe("CLEAR_SELECTION", () => {
  restoreElementStyle();
  sendMessage("ELEMENT_UNSELECTED", { timestamp: Date.now() });
});

// Initialize event listeners
document.addEventListener("click", handleElementClick, true);

// Cleanup on unload
window.addEventListener("unload", () => {
  restoreElementStyle();
  document.removeEventListener("click", handleElementClick, true);
});

// Send content ready message
sendMessage("CONTENT_READY", { url: window.location.href });
