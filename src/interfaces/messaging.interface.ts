/**
 * Messaging interfaces for type-safe communication between extension contexts
 */

import { AnalysisResult } from '@/interfaces/analysis.interface';
import { AppState } from '@/services/StorageService';
import { ACTIONS } from '@/utils/constants';

/**
 * Base structure for generic messages
 */
export interface ActionMessage {
  action: string;
  payload?: Record<string, unknown>;
}

/**
 * Message when analysis is complete
 */
export interface AnalysisCompleteMessage extends Message {
  action: typeof ACTIONS.ANALYSIS_COMPLETE;
  data: AnalysisResult;
}

/**
 * Analysis response
 */
export interface AnalysisResponse extends SuccessResponse {
  data?: unknown;
}

/**
 * Message to request repository analysis
 */
export interface AnalyzeRepoMessage extends Message {
  action: typeof ACTIONS.ANALYZE_REPO;
}

/**
 * Response types for MessageService
 */
export interface ErrorResponse {
  [key: string]: unknown;
  error?: string;
  reason?: string;
  success: false;
}

/**
 * Union type of all message types
 */
export type ExtensionMessage =
  | AnalysisCompleteMessage
  | AnalyzeRepoMessage
  | GetStateMessage
  | HidePanelMessage
  | OptionsUpdatedMessage
  | ShowPanelMessage
  | TogglePanelMessage;

// --- Preparation of more detailed interfaces for MessageService ---

/**
 * Message to request current state
 */
export interface GetStateMessage extends Message {
  action: typeof ACTIONS.GET_STATE;
}

/**
 * Message to hide panel
 */
export interface HidePanelMessage extends Message {
  action: typeof ACTIONS.HIDE_PANEL;
}

/**
 * Interface for MessageService
 */
export interface IMessageService {
  /**
   * Clean up resources
   */
  destroy(): void;

  /**
   * Register a handler for a specific action
   */
  registerHandler(action: string, handler: MessageHandler): void;

  /**
   * Send a message to the extension
   */
  sendMessage<T extends MessageResponse>(message: ExtensionMessage): Promise<T>;

  /**
   * Send a message to a specific tab
   */
  sendTabMessage<T extends MessageResponse>(tabId: number, message: ExtensionMessage): Promise<T>;

  /**
   * Remove a handler for a specific action
   */
  unregisterHandler(action: string, handler: MessageHandler): void;
}

/**
 * Base message interface
 */
export interface Message {
  action: string;
}

/**
 * Handler type for message actions
 */
export type MessageHandler = (
  message: ActionMessage | ExtensionMessage | Message,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response?: MessageResponse) => void
) => boolean | Promise<unknown> | void;

export type MessageResponse = AppState | ErrorResponse | SuccessResponse;

/**
 * Information about the message sender
 */
export interface MessageSender {
  id?: string;
  tab?: {
    id?: number;
  };
}

/**
 * Message to notify of options updates
 */
export interface OptionsUpdatedMessage extends Message {
  action: typeof ACTIONS.OPTIONS_UPDATED;
}

/**
 * Panel visibility response
 */
export interface PanelVisibilityResponse extends SuccessResponse {
  isPanelVisible: boolean;
  reason?: string;
}

/**
 * Callback function for responses to messages
 */
export type ResponseCallback = (response?: unknown) => void;

/**
 * Message to show panel
 */
export interface ShowPanelMessage extends Message {
  action: typeof ACTIONS.SHOW_PANEL;
}

/**
 * Standard response structure for most message handlers
 */
export interface SuccessResponse {
  [key: string]: unknown;
  error?: string;
  success: boolean;
}

/**
 * Message to toggle panel
 */
export interface TogglePanelMessage extends Message {
  action: typeof ACTIONS.TOGGLE_PANEL;
}
