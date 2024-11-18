// src/background.ts
import { ConnectionManager, Message } from './lib/connectionManager';
import { Logger } from './lib/logger';

class BackgroundService {
  private manager: ConnectionManager;
  private logger = new Logger('background');

  constructor() {
    this.logger.debug('Initializing BackgroundService...');
    this.manager = ConnectionManager.getInstance();
    this.logger.debug('Setting background context...');
    this.manager.setContext('background');
    this.logger.debug('Setting up event handlers...');
    this.setupEventHandlers();
    this.logger.log('BackgroundService initialization complete');
    
    this.setupSidePanel();
  }

  private setupEventHandlers() {
    // Subscribe to all messages and log them
    this.manager.subscribe('DEBUG', (message: Message) => {
      const timestamp = new Date(message.timestamp).toISOString();
      this.logger.log(
        `[${timestamp}] ${message.source} -> ${message.target || 'broadcast'}: ${message.type}`,
        message.payload
      );
    });

    chrome.runtime.onInstalled.addListener(() => {
      this.logger.log('Extension installed/updated');
      this.setupSidePanel();
    });

    chrome.action.onClicked.addListener(this.toggleSidePanel);
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
  }

  private async handleTabActivated({ tabId, windowId }: chrome.tabs.TabActiveInfo) {
    try {
      const tab = await chrome.tabs.get(tabId);
      await this.manager.sendMessage('TAB_ACTIVATED', {
        tabId,
        windowId,
        url: tab.url,
        title: tab.title
      });
    } catch (error) {
      this.logger.error('Tab activation error:', error);
    }
  }

  private async setupSidePanel() {
    try {
      await chrome.sidePanel.setOptions({
        enabled: true,
        path: 'sidepanel.html'
      });
      this.logger.log('Side panel settings updated');
    } catch (error) {
      this.logger.error('Failed to setup side panel:', error);
    }
  }

  private toggleSidePanel = (tab: chrome.tabs.Tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        this.logger.error('Failed to open side panel:', error);
      } else {
        this.logger.debug('Side panel opened successfully');
      }
    });
  }
}

new BackgroundService();