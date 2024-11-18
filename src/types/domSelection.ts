// src/types/domSelection.ts
export interface ElementInfo {
  startTag: string;
  path: number[];
}

export interface SelectElementPayload {
  elementInfo: ElementInfo;
}

export interface SelectionModePayload {
  enabled: boolean;
}

export const DOM_SELECTION_EVENTS = {
  SELECT_ELEMENT: "SELECT_ELEMENT",
  ELEMENT_SELECTED: "ELEMENT_SELECTED",
  ELEMENT_UNSELECTED: "ELEMENT_UNSELECTED",
  CLEAR_SELECTION: "CLEAR_SELECTION",
  TOGGLE_SELECTION_MODE: "TOGGLE_SELECTION_MODE",
} as const;

export const UI_EVENTS = {
  SIDE_PANEL_CLOSED: "SIDE_PANEL_CLOSED",
} as const;

// Event type definitions for better type safety
export type DOMSelectionEvent =
  (typeof DOM_SELECTION_EVENTS)[keyof typeof DOM_SELECTION_EVENTS];
export type UIEvent = (typeof UI_EVENTS)[keyof typeof UI_EVENTS];
export interface Message<T = unknown> {
  type: DOMSelectionEvent;
  payload: T;
}
