// src/sidepanel/App.tsx
import { Settings } from 'lucide-react';
import React, { useState } from 'react';
import { DOMSelector } from '../components/DOMSelector';
import { SettingsPanel } from '../components/SettingsPanel';
import { TagInjection } from '../components/TagInjection';
import '../styles/common.css';
import './App.css';

// src/sidepanel/App.tsx
export const App = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="app-container">
      <div className="app-content">
        <div className="app-header">
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
