// src/types/domSelection.ts

/** Represents a node in the DOM element tree structure */
export interface ElementTreeNode {
  /** HTML start tag of the element */
  startTag: string;
  /** Child nodes in the element tree */
  children: ElementTreeNode[];
  /** Array of indices representing the path from root to this element */
  path: number[];
}

/** Information about a selected DOM element */
export interface ElementInfo {
  /** HTML start tag of the selected element */
  startTag: string;
  /** Array of indices representing the path from root to selected element */
  path: number[];
  /** Chiled nodes in the element tree **/
  children: ElementTreeNode;
}

/** Payload for element selection events */
export interface SelectElementPayload {
  /** Information about the element being selected */
  elementInfo: ElementInfo;
}

/** Payload for selection mode toggle events */
export interface SelectionModePayload {
  /** Whether selection mode is being enabled or disabled */
  enabled: boolean;
}

/** Constants for DOM selection related events */
export const DOM_SELECTION_EVENTS = {
  /** Trigger element selection */
  SELECT_ELEMENT: "SELECT_ELEMENT",
  /** Element has been selected */
  ELEMENT_SELECTED: "ELEMENT_SELECTED",
  /** Element has been unselected */
  ELEMENT_UNSELECTED: "ELEMENT_UNSELECTED",
  /** Clear current selection */
  CLEAR_SELECTION: "CLEAR_SELECTION",
  /** Toggle selection mode on/off */
  TOGGLE_SELECTION_MODE: "TOGGLE_SELECTION_MODE",
} as const;

/** Constants for UI related events */
export const UI_EVENTS = {
  /** Side panel has been closed */
  SIDE_PANEL_CLOSED: "SIDE_PANEL_CLOSED",
} as const;

/** Type for DOM selection event names */
export type DOMSelectionEvent =
  (typeof DOM_SELECTION_EVENTS)[keyof typeof DOM_SELECTION_EVENTS];

/** Type for UI event names */
export type UIEvent = (typeof UI_EVENTS)[keyof typeof UI_EVENTS];

/** Generic message type for DOM selection events */
export interface Message<T = unknown> {
  /** Event type identifier */
  type: DOMSelectionEvent;
  /** Event payload data */
  payload: T;
}