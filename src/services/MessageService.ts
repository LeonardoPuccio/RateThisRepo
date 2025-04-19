import {
  ExtensionMessage,
  IMessageService,
  MessageHandler,
  MessageResponse,
} from '@/interfaces/messaging.interface';
import { debugLog, errorLog } from '@/utils/config';

/**
 * MessageService provides a centralized way to send and receive messages
 * between different parts of the extension.
 */
export class MessageService implements IMessageService {
  private static instance: MessageService;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private messageListener:
    | ((
        message: unknown,
        sender: Browser.runtime.MessageSender,
        sendResponse: (response?: MessageResponse) => void
      ) => boolean)
    | null = null;

  /**
   * Constructor registers the message listener
   */
  constructor() {
    this.messageListener = this.handleMessage.bind(this);
    browser.runtime.onMessage.addListener(this.messageListener);
    debugLog('messaging', 'MessageService initialized');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }
    return MessageService.instance;
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.messageListener) {
      browser.runtime.onMessage.removeListener(this.messageListener);
      this.messageListener = null;
    }

    this.handlers.clear();
    debugLog('messaging', 'MessageService destroyed');
  }

  /**
   * Register a handler for a specific action
   */
  public registerHandler(action: string, handler: MessageHandler): void {
    if (!this.handlers.has(action)) {
      this.handlers.set(action, new Set());
    }

    this.handlers.get(action)?.add(handler);
    debugLog('messaging', `Handler registered for action: ${action}`);
  }

  /**
   * Send a message to the extension
   */
  public async sendMessage<T extends MessageResponse>(message: ExtensionMessage): Promise<T> {
    try {
      debugLog('messaging', `Sending message: ${message.action}`);
      return (await browser.runtime.sendMessage(message)) as T;
    } catch (error) {
      errorLog('messaging', `Error sending message (${message.action}):`, error);
      throw error;
    }
  }

  /**
   * Send a message to a specific tab
   */
  public async sendTabMessage<T extends MessageResponse>(
    tabId: number,
    message: ExtensionMessage
  ): Promise<T> {
    try {
      debugLog('messaging', `Sending tab message to tab ${tabId}: ${message.action}`);
      return (await browser.tabs.sendMessage(tabId, message)) as T;
    } catch (error) {
      errorLog('messaging', `Error sending tab message (${message.action}):`, error);
      throw error;
    }
  }

  /**
   * Remove a handler for a specific action
   */
  public unregisterHandler(action: string, handler: MessageHandler): void {
    if (this.handlers.has(action)) {
      this.handlers.get(action)?.delete(handler);

      // Clean up empty sets
      if (this.handlers.get(action)?.size === 0) {
        this.handlers.delete(action);
      }

      debugLog('messaging', `Handler unregistered for action: ${action}`);
    }
  }

  /**
   * Handle incoming messages
   * Uses unknown type first to validate message structure before processing
   */
  private handleMessage(
    message: unknown,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: MessageResponse) => void
  ): boolean {
    // Type guard to validate message structure
    if (!message || typeof message !== 'object' || !('action' in message)) {
      errorLog('messaging', 'Received message without action:', message);
      return false;
    }

    const { action } = message as { action: string };

    debugLog('messaging', `Received message: ${action}`);

    if (this.handlers.has(action)) {
      const handlers = this.handlers.get(action);
      let hasAsyncHandler = false;

      if (handlers) {
        for (const handler of handlers) {
          try {
            const result = handler(message, sender, sendResponse);

            // If handler returns true, it will handle the sendResponse asynchronously
            if (result === true) {
              hasAsyncHandler = true;
            }
          } catch (error) {
            errorLog('messaging', `Error in message handler for ${action}:`, error);
          }
        }
      }

      return hasAsyncHandler;
    }

    return false;
  }
}
