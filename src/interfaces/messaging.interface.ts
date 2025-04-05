/**
 * Interfaces for the extension messaging system
 */

import { AnalysisResult } from '@/interfaces/analysis.interface';
import { AppState } from '@/services/StorageService';
import { ACTIONS } from '@/utils/constants';

/**
 * Base message interface
 */
export interface Message {
  action: string;
}

/**
 * Message to request repository analysis
 */
export interface AnalyzeRepoMessage extends Message {
  action: typeof ACTIONS.ANALYZE_REPO;
}

/**
 * Message when analysis is complete
 */
export interface AnalysisCompleteMessage extends Message {
  action: typeof ACTIONS.ANALYSIS_COMPLETE;
  data: AnalysisResult;
}

/**
 * Message to request current state
 */
export interface GetStateMessage extends Message {
  action: typeof ACTIONS.GET_STATE;
}

/**
 * Message to show panel
 */
export interface ShowPanelMessage extends Message {
  action: typeof ACTIONS.SHOW_PANEL;
}

/**
 * Message to hide panel
 */
export interface HidePanelMessage extends Message {
  action: typeof ACTIONS.HIDE_PANEL;
}

/**
 * Message to toggle panel
 */
export interface TogglePanelMessage extends Message {
  action: typeof ACTIONS.TOGGLE_PANEL;
}

/**
 * Message to notify of options updates
 */
export interface OptionsUpdatedMessage extends Message {
  action: typeof ACTIONS.OPTIONS_UPDATED;
}

/**
 * Union type of all message types
 */
export type ExtensionMessage =
  | AnalyzeRepoMessage
  | AnalysisCompleteMessage
  | GetStateMessage
  | ShowPanelMessage
  | HidePanelMessage
  | TogglePanelMessage
  | OptionsUpdatedMessage;

/**
 * Response types
 */
export interface SuccessResponse {
  success: true;
  [key: string]: any;
}

export interface ErrorResponse {
  success: false;
  error?: string;
  reason?: string;
  [key: string]: any;
}

export type MessageResponse = SuccessResponse | ErrorResponse | AppState;

/**
 * Handler type for message actions
 */
export type MessageHandler = (
  message: any,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response?: any) => void
) => boolean | void | Promise<any>;

/**
 * Interface for MessageService
 */
export interface IMessageService {
  /**
   * Register a handler for a specific action
   */
  registerHandler(action: string, handler: MessageHandler): void;
  
  /**
   * Remove a handler for a specific action
   */
  unregisterHandler(action: string, handler: MessageHandler): void;
  
  /**
   * Send a message to the extension
   */
  sendMessage<T extends MessageResponse>(message: ExtensionMessage): Promise<T>;
  
  /**
   * Send a message to a specific tab
   */
  sendTabMessage<T extends MessageResponse>(tabId: number, message: ExtensionMessage): Promise<T>;
  
  /**
   * Clean up resources
   */
  destroy(): void;
}
