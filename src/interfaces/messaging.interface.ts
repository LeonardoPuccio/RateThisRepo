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
  /** Analysis result data */
  data: AnalysisResult;
}

// =================================================================================
// Analysis related message interfaces
// =================================================================================

/**
 * Analysis response
 */
export interface AnalysisResponse extends SuccessResponse {
  /** Analysis data if successful */
  data?: AnalysisResult;
}

/**
 * Message to request repository analysis
 */
export interface AnalyzeRepoMessage extends Message {
  action: typeof ACTIONS.ANALYZE_REPO;
  /** Whether to force a refresh of cached data */
  forceRefresh?: boolean;
}

/**
 * Error response
 */
export interface ErrorResponse {
  /** Additional error data */
  [key: string]: unknown;
  /** Error message describing what went wrong */
  error?: string;
  /** More detailed reason for the error */
  reason?: string;
  /** Indicates the operation failed */
  success: false;
}

// =================================================================================
// UI state related message interfaces
// =================================================================================

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
  | TogglePanelMessage
  | UpdateStateMessage;

/**
 * Generic response type that allows for more flexible response handling
 * while maintaining some type safety
 */
export type GenericResponse = MessageResponse | Record<string, unknown> | undefined;

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

// =================================================================================
// Response interfaces
// =================================================================================

/**
 * Handler type for message actions
 */
export type MessageHandler = (
  message: ActionMessage | ExtensionMessage | Message,
  sender: Browser.runtime.MessageSender,
  sendResponse: (response?: GenericResponse) => void
) => boolean | Promise<unknown> | void;

/**
 * Combined response type
 */
export type MessageResponse = AppState | ErrorResponse | SuccessResponse;

/**
 * Information about the message sender
 */
export interface MessageSender {
  /** Sender extension ID */
  id?: string;
  /** Tab information if message from a tab */
  tab?: {
    id?: number;
  };
}

// =================================================================================
// Type unions and service interfaces
// =================================================================================

/**
 * Message to notify of options updates
 */
export interface OptionsUpdatedMessage extends Message {
  action: typeof ACTIONS.OPTIONS_UPDATED;
  /** The options that were updated */
  options?: {
    [key: string]: unknown;
    showFloatingButton?: boolean;
  };
}

/**
 * Response for panel visibility operations
 */
export interface PanelVisibilityResponse extends SuccessResponse {
  /** Whether the panel is currently visible */
  isPanelVisible: boolean;
  /** Reason for failure if applicable */
  reason?: string;
}

/**
 * Callback function for responses to messages
 */
export type ResponseCallback = (response?: GenericResponse) => void;

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
  /** Additional response data */
  [key: string]: unknown;
  /** Optional error message if success is false */
  error?: string;
  /** Indicates if the operation was successful */
  success: boolean;
}

/**
 * Message to toggle panel
 */
export interface TogglePanelMessage extends Message {
  action: typeof ACTIONS.TOGGLE_PANEL;
}

/**
 * Message to update state
 */
export interface UpdateStateMessage extends Message {
  action: typeof ACTIONS.UPDATE_STATE;
  /** Partial state to update */
  state: Partial<AppState>;
}

/**
 * Type guard function to check if a message is a valid ExtensionMessage
 */
export function isExtensionMessage(message: unknown): message is ExtensionMessage {
  if (!message || typeof message !== 'object') return false;

  const msg = message as Record<string, unknown>;
  return 'action' in msg && typeof msg.action === 'string';
}
