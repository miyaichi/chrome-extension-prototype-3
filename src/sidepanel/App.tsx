import { Camera, Power, Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DOMSelector } from "../components/DOMSelector";
import { SettingsPanel } from "../components/SettingsPanel";
import { ShareCapture } from "../components/ShareCapture";
import { TagInjection } from "../components/TagInjection";
import { useConnectionManager } from "../lib/connectionManager";
import "../styles/common.css";
import {
  DOM_SELECTION_EVENTS,
  ElementInfo,
  UI_EVENTS,
} from "../types/domSelection";
import "./App.css";

export const App = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShareCapture, setShowShareCapture] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(
    null,
  );
  const { sendMessage, subscribe } = useConnectionManager();

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handlePanelClose();
      }
    };

    const handleUnload = () => {
      handlePanelClose();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("unload", handleUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("unload", handleUnload);
    };
  }, []);

  useEffect(() => {
    const unsubscribe = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_SELECTED,
      (message: { payload: { elementInfo: ElementInfo } }) => {
        setSelectedElement(message.payload.elementInfo);
      },
    );

    const unsubscribeUnselection = subscribe(
      DOM_SELECTION_EVENTS.ELEMENT_UNSELECTED,
      () => {
        setSelectedElement(null);
      },
    );

    return () => {
      unsubscribe();
      unsubscribeUnselection();
    };
  }, [subscribe]);

  const handlePanelClose = () => {
    if (isSelectionMode) {
      setIsSelectionMode(false);
      sendMessage(DOM_SELECTION_EVENTS.TOGGLE_SELECTION_MODE, {
        enabled: false,
      });
      sendMessage(DOM_SELECTION_EVENTS.CLEAR_SELECTION, {
        timestamp: Date.now(),
      });
    }

    if (showSettings) {
      setShowSettings(false);
    }

    sendMessage(UI_EVENTS.SIDE_PANEL_CLOSED, { timestamp: Date.now() });
  };

  const handleCapture = () => {
    setShowShareCapture(true);
    sendMessage(UI_EVENTS.CAPTURE_TAB, { timestamp: Date.now() });
  };

  const handleShareClose = () => {
    setShowShareCapture(false);
  };

  const handleShare = (
    imageData: string,
    comment: string,
    url: string,
    startTag: string,
  ) => {
    console.log(`Sharing: ${comment} ${url} ${startTag}`);
    // TODO: Implement share functionality

    setShowShareCapture(false);
  };

  const toggleSelectionMode = () => {
    const newMode = !isSelectionMode;
    if (!newMode) {
      sendMessage(DOM_SELECTION_EVENTS.CLEAR_SELECTION, {
        timestamp: Date.now(),
      });
    }
    setIsSelectionMode(newMode);
    sendMessage(DOM_SELECTION_EVENTS.TOGGLE_SELECTION_MODE, {
      enabled: newMode,
    });
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="app-header">
          <button
            onClick={toggleSelectionMode}
            className={`selection-button ${
              isSelectionMode ? "enabled" : "disabled"
            }`}
          >
            <Power size={16} />
            {isSelectionMode ? "Selection Mode On" : "Selection Mode Off"}
          </button>

          <div className="header-actions">
            <button onClick={handleCapture} className="icon-button">
              <Camera size={16} />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`icon-button ${showSettings ? "active" : ""}`}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>

        {showSettings ? (
          <SettingsPanel />
        ) : (
          <div className="components-container">
            <DOMSelector />
            {showShareCapture && (
              <ShareCapture
                onClose={handleShareClose}
                onShare={handleShare}
                initialSelectedElement={selectedElement}
              />
            )}
            <TagInjection />
          </div>
        )}
      </div>
    </div>
  );
};
