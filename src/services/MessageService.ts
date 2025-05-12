import { AnalysisResult } from '@/interfaces/analysis.interface';
import {
  AnalysisCompleteMessage,
  ExtensionMessage,
  GenericResponse,
  IMessageService,
  isExtensionMessage,
  MessageHandler,
  MessageResponse,
} from '@/interfaces/messaging.interface';
import { ACTIONS } from '@/utils/constants';
import { debugLog, errorLog } from '@/utils/debug';

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
        sendResponse: (response?: GenericResponse) => void
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
   * Utility method to request repository analysis
   */
  public async requestAnalyzeRepo(forceRefresh = false): Promise<MessageResponse> {
    return this.sendMessage({
      action: ACTIONS.ANALYZE_REPO,
      forceRefresh,
    });
  }

  /**
   * Utility method to send analysis complete message
   */
  public async sendAnalysisComplete(data: AnalysisResult): Promise<void> {
    const message: AnalysisCompleteMessage = {
      action: ACTIONS.ANALYSIS_COMPLETE,
      data: data,
    };
    await this.sendMessage(message);
  }

  /**
   * Send a message to the extension
   */
  public async sendMessage<T extends MessageResponse>(message: ExtensionMessage): Promise<T> {
    try {
      if (!isExtensionMessage(message)) {
        throw new Error('Invalid message format');
      }

      debugLog('messaging', `Sending message: ${message.action}`);
      return (await browser.runtime.sendMessage(message)) as T;
    } catch (error) {
      this.handleSendError(message.action, error);
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
      if (!isExtensionMessage(message)) {
        throw new Error('Invalid message format');
      }

      debugLog('messaging', `Sending tab message to tab ${tabId}: ${message.action}`);
      return (await browser.tabs.sendMessage(tabId, message)) as T;
    } catch (error) {
      this.handleSendError(message.action, error, tabId);
      throw error;
    }
  }

  /**
   * Utility method to toggle panel visibility
   */
  public async togglePanel(): Promise<MessageResponse> {
    return this.sendMessage({
      action: ACTIONS.TOGGLE_PANEL,
    });
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
   * Utility method to update state
   */
  public async updateState(state: Record<string, unknown>): Promise<MessageResponse> {
    return this.sendMessage({
      action: ACTIONS.UPDATE_STATE,
      state,
    });
  }

  /**
   * Handle incoming messages
   * Uses unknown type first to validate message structure before processing
   */
  private handleMessage(
    message: unknown,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    // Type guard to validate message structure
    if (!isExtensionMessage(message)) {
      errorLog('messaging', 'Received invalid message format:', message);
      sendResponse({ error: 'Invalid message format', success: false });
      return false;
    }

    const { action } = message;

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
    } else {
      debugLog('messaging', `No handlers registered for action: ${action}`);
      sendResponse({ error: `No handler for action: ${action}`, success: false });
    }

    return false;
  }

  /**
   * Centralized error handling for message sending
   */
  private handleSendError(action: string, error: unknown, tabId?: number): void {
    const tabInfo = tabId ? ` to tab ${tabId}` : '';
    const errorMessage = error instanceof Error ? error.message : String(error);

    errorLog('messaging', `Error sending message${tabInfo} (${action}): ${errorMessage}`, error);

    // Additional error handling logic can be added here
    // For example, retrying, notifying the user, etc.
  }
}
