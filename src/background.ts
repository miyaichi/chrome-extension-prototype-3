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

  /**
   * Sets up event handlers for the background service
   */
  private setupEventHandlers() {
    // Debugging message handler
    this.manager.subscribe('DEBUG', (message: Message) => {
      const timestamp = new Date(message.timestamp).toISOString();
      this.logger.log(
        `[${timestamp}] ${message.source} -> ${message.target || 'broadcast'}: ${message.type}`,
        message.payload
      );
    });

    // Tab capture handler
    this.manager.subscribe('CAPTURE_TAB', this.captureTab.bind(this));

    // Extension installation/update handler
    chrome.runtime.onInstalled.addListener(() => {
      this.logger.log('Extension installed/updated');
      this.setupSidePanel();
    });

    // Browser events
    chrome.action.onClicked.addListener(this.toggleSidePanel);
    chrome.tabs.onActivated.addListener(this.handleTabActivated.bind(this));
  }

  /**
   * Captures the current tab and sends the image data back to the requester
   */
  private async captureTab(message: Message) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      const windowId = tab.windowId;

      const imageDataUrl = await chrome.tabs.captureVisibleTab(windowId, {
        format: 'png',
        quality: 100,
      });

      await this.manager.sendMessage(
        'CAPTURE_TAB_RESULT',
        {
          success: true,
          imageDataUrl: imageDataUrl,
          url: tab.url || null,
        },
        message.source
      );
    } catch (error) {
      this.logger.error('Failed to capture tab:', error);
      await this.manager.sendMessage(
        'CAPTURE_TAB_RESULT',
        {
          success: false,
          error: (error as Error).message,
          url: null,
        },
        message.source
      );
    }
  }

  /**
   * Handles tab activation events
   */
  private async handleTabActivated({ tabId, windowId }: chrome.tabs.TabActiveInfo) {
    try {
      const tab = await chrome.tabs.get(tabId);
      await this.manager.sendMessage('TAB_ACTIVATED', {
        tabId,
        windowId,
        url: tab.url,
        title: tab.title,
      });
    } catch (error) {
      this.logger.error('Tab activation error:', error);
    }
  }

  /**
   * Sets up the side panel configuration
   */
  private async setupSidePanel() {
    try {
      await chrome.sidePanel.setOptions({
        enabled: true,
        path: 'sidepanel.html',
      });
      this.logger.log('Side panel settings updated');
    } catch (error) {
      this.logger.error('Failed to setup side panel:', error);
    }
  }

  /**
   * Toggles the side panel visibility
   */
  private toggleSidePanel = (tab: chrome.tabs.Tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId }, () => {
      const error = chrome.runtime.lastError;
      if (error) {
        this.logger.error('Failed to open side panel:', error);
      } else {
        this.logger.debug('Side panel opened successfully');
      }
    });
  };
}

// Initialize the background service
new BackgroundService();
