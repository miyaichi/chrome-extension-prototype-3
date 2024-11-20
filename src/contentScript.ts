import { ConnectionManager, Message, useConnectionManager } from './lib/connectionManager';
import {
  DOM_SELECTION_EVENTS,
  SelectElementPayload,
  SelectionModePayload,
} from './types/domSelection';
import { createElementInfo, getElementByPath } from './utils/domSelection';

type StyleProperty = 'backgroundColor' | 'outline' | 'border';

interface ElementStyle {
  originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>>;
  element: HTMLElement;
}

const styleMap = new Map<number, ElementStyle>();
let currentTabId: number;
let selectionModeEnabled = false;

const { sendMessage, subscribe } = useConnectionManager();
const manager = ConnectionManager.getInstance();
manager.setContext('content');

// Utils
const updateCursorStyle = (enabled: boolean) => {
  document.body.style.cursor = enabled ? 'crosshair' : '';
};

const saveElementStyle = (element: HTMLElement): void => {
  if (styleMap.has(currentTabId)) {
    restoreElementStyle();
  }

  const originalStyles: Partial<Pick<CSSStyleDeclaration, StyleProperty>> = {};
  const styleProperties: StyleProperty[] = ['backgroundColor', 'outline', 'border'];

  styleProperties.forEach((prop) => {
    originalStyles[prop] = element.style[prop];
  });

  styleMap.set(currentTabId, {
    originalStyles,
    element,
  });
};

const applyHighlightStyle = (element: HTMLElement): void => {
  element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
  element.style.outline = '2px solid #ffd700';
  element.style.border = '1px solid #ffd700';
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

// Event handlers
const handleElementClick = (event: MouseEvent): void => {
  if (!selectionModeEnabled) return;

  const element = event.target as HTMLElement;
  if (!element || element === document.body) return;

  event.preventDefault();
  event.stopPropagation();

  const elementInfo = createElementInfo(element);

  saveElementStyle(element);
  applyHighlightStyle(element);

  sendMessage('ELEMENT_SELECTED', { elementInfo });
};

// Cleanup
const cleanup = () => {
  restoreElementStyle();
  document.removeEventListener('click', handleElementClick, true);
};

// Cleanup on disconnect
chrome.runtime.onConnect.addListener((port) => {
  port.onDisconnect.addListener(cleanup);
});

// Message subscription
subscribe('TOGGLE_SELECTION_MODE', (message: Message<SelectionModePayload>) => {
  selectionModeEnabled = message.payload.enabled;
  updateCursorStyle(selectionModeEnabled);

  if (!selectionModeEnabled) {
    restoreElementStyle();
  }
});

subscribe<SelectElementPayload>(
  DOM_SELECTION_EVENTS.SELECT_ELEMENT,
  (message: Message<SelectElementPayload>) => {
    const element = getElementByPath(message.payload.path);
    if (!element) {
      console.warn('Failed to find element with path:', message.payload.path);
      return;
    }

    const elementInfo = createElementInfo(element);

    saveElementStyle(element);
    applyHighlightStyle(element);

    sendMessage('ELEMENT_SELECTED', { elementInfo });
  }
);

subscribe('CLEAR_SELECTION', () => {
  restoreElementStyle();
  sendMessage('ELEMENT_UNSELECTED', { timestamp: Date.now() });
});

// Initialize
chrome.runtime.sendMessage({ type: 'GET_CURRENT_TAB' }, (response) => {
  currentTabId = response.tabId;
});

document.addEventListener('click', handleElementClick, true);
