// src/sidepanel/App.tsx
import { Settings } from "lucide-react";
import React, { useEffect, useState } from "react";
import { DOMSelector } from "../components/DOMSelector";
import { SettingsPanel } from "../components/SettingsPanel";
import { TagInjection } from "../components/TagInjection";
import { useConnectionManager } from "../lib/connectionManager";
import "../styles/common.css";
import { DOM_SELECTION_EVENTS, UI_EVENTS } from "../types/domSelection";
import "./App.css";

// src/sidepanel/App.tsx
export const App = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { sendMessage } = useConnectionManager();

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
          <button onClick={toggleSelectionMode} className="text-button">
            {isSelectionMode
              ? "Disable Selection Mode"
              : "Enable Selection Mode"}
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`settings-button ${showSettings ? "active" : ""}`}
          >
            <Settings className="settings-icon" />
          </button>
        </div>

        {showSettings ? (
          <SettingsPanel />
        ) : (
          <div className="components-container">
            <DOMSelector />
            <TagInjection />
          </div>
        )}
      </div>
    </div>
  );
};
