// src/sidepanel/App.tsx
import { Settings } from 'lucide-react';
import React, { useState } from 'react';
import { DOMSelector } from '../components/DOMSelector';
import { SettingsPanel } from '../components/SettingsPanel';
import { TagInjection } from '../components/TagInjection';
import { useConnectionManager } from '../lib/connectionManager';
import '../styles/common.css';
import './App.css';

// src/sidepanel/App.tsx
export const App = () => {
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { sendMessage } = useConnectionManager();

  const toggleSelectionMode = () => {
    const newMode = !isSelectionMode;
    setIsSelectionMode(newMode);
    sendMessage('TOGGLE_SELECTION_MODE', { enabled: newMode });
  };

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="app-header">
          <button
            onClick={toggleSelectionMode}
            className={`settings-button 'active'`}
          >
            {isSelectionMode ? 'Disable Selection Mode' : 'Enable Selection Mode'}
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={`settings-button ${showSettings ? 'active' : ''}`}
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
