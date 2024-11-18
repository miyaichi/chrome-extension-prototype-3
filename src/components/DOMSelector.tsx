import React, { useEffect, useState } from "react";
import { useConnectionManager } from "../lib/connectionManager";
import "../styles/common.css";
import { DOM_SELECTION_EVENTS, ElementInfo } from "../types/domSelection";
import "./DOMSelector.css";

export const DOMSelector: React.FC = () => {
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(
    null,
  );
  const { subscribe } = useConnectionManager();

  useEffect(() => {
    // Subscribe to element selection
    const unsubscribeSelection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        const elementInfo = message.payload.elementInfo;
        setSelectedElement(elementInfo);
      },
    );

    // Subscribe to clear selection
    const unsubscribeUnselection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED,
      () => {
        setSelectedElement(null);
      },
    );

    // Cleanup both subscriptions
    return () => {
      unsubscribeSelection();
      unsubscribeUnselection();
    };
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">DOM Selector</h2>
      </div>
      <div className="card-content">
        {selectedElement && (
          <div className="selected-element-info">
            <h3>Selected Element:</h3>
            <div>Start Tag: {selectedElement.startTag}</div>
            <div>Path: {selectedElement.path.join(" > ")}</div>
          </div>
        )}
      </div>
    </div>
  );
};
