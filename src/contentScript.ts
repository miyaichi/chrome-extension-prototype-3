// src/contentScript.ts
import { ConnectionManager, Message, useConnectionManager } from './lib/connectionManager';

const { sendMessage, subscribe } = useConnectionManager();

ConnectionManager.getInstance().setContext('content');

sendMessage('CONTENT_READY', { url: window.location.href });

// Subscribe to all messages and log them
subscribe('DEBUG', (message: Message) => {
  const timestamp = new Date(message.timestamp).toISOString();
  console.log(
    `[${timestamp}] ${message.source} -> ${message.target || 'broadcast'}: ${message.type}`,
    message.payload
  );
});