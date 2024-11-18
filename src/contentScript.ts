import {
  ConnectionManager,
  Message,
  useConnectionManager,
} from "./lib/connectionManager";
import {
  SelectElementPayload,
  SelectionModePayload,
} from "./types/domSelection";
import { createElementInfo, getElementByPath } from "./utils/domSelection";

type StyleProperty = "backgroundColor" | "outline" | "border";

interface ElementStyle {
  originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>>;
  element: HTMLElement;
}

const styleMap = new Map<number, ElementStyle>();
let currentTabId: number;
let selectionModeEnabled = false;

const { sendMessage, subscribe } = useConnectionManager();
const manager = ConnectionManager.getInstance();
manager.setContext("content");

chrome.runtime.sendMessage({ type: "GET_CURRENT_TAB" }, (response) => {
  currentTabId = response.tabId;
});

const updateCursorStyle = (enabled: boolean) => {
  document.body.style.cursor = enabled ? "crosshair" : "";
};

const saveElementStyle = (element: HTMLElement): void => {
  if (styleMap.has(currentTabId)) {
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

const handleElementClick = (event: MouseEvent): void => {
  if (!selectionModeEnabled) return;

  const element = event.target as HTMLElement;
  if (!element || element === document.body) return;

  event.preventDefault();
  event.stopPropagation();

  const elementInfo = createElementInfo(element);

  saveElementStyle(element);
  applyHighlightStyle(element);

  sendMessage("ELEMENT_SELECTED", { elementInfo });
};

subscribe("TOGGLE_SELECTION_MODE", (message: Message<SelectionModePayload>) => {
  selectionModeEnabled = message.payload.enabled;
  updateCursorStyle(selectionModeEnabled);

  if (!selectionModeEnabled) {
    restoreElementStyle();
  }
});

subscribe("SELECT_ELEMENT", (message: Message<SelectElementPayload>) => {
  const element = getElementByPath(message.payload.elementInfo.path);
  if (!element) return;

  saveElementStyle(element);
  applyHighlightStyle(element);
});

subscribe("CLEAR_SELECTION", () => {
  restoreElementStyle();
  sendMessage("ELEMENT_UNSELECTED", { timestamp: Date.now() });
});

document.addEventListener("click", handleElementClick, true);

window.addEventListener("unload", () => {
  restoreElementStyle();
  document.removeEventListener("click", handleElementClick, true);
});

sendMessage("CONTENT_READY", { url: window.location.href });
