// src/components/SettingsPanel.tsx
import React from 'react';
import { LogLevel, useSettings } from '../lib/settings';
import '../styles/common.css';
import './SettingsPanel.css';

export const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, loading, error } = useSettings();

  if (error) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Settings Error</h2>
        </div>
        <div className="card-content error-message">
          Failed to load settings: {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Settings</h2>
        </div>
        <div className="card-content loading-message">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Settings</h2>
      </div>
      <div className="card-content">
        <div className="setting-group">
          <label>Log Level</label>
          <select
            value={settings.logLevel}
            onChange={(e) => updateSettings({ logLevel: e.target.value as LogLevel })}
          >
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>
      </div>
    </div>
  );
};