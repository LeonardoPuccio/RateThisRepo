import { ExtensionMessage, GenericResponse } from '@/interfaces/messaging.interface';
import { MessageService } from '@/services/MessageService';
import { StateManager } from '@/services/StateManager';
import { StorageService } from '@/services/StorageService';
import { ACTIONS } from '@/utils/constants';
import { debugLog, errorLog } from '@/utils/debug';

import { buttonManager } from './button-manager';
import { errorHandler } from './error-handler';
import { repoAnalyzer } from './repo-analyzer';

/**
 * MessageHandler - Handles incoming extension messages for the content script
 */
export class MessageHandler {
  private static instance: MessageHandler;
  private messageService: MessageService;
  private stateManager: StateManager;

  private constructor() {
    // Private constructor to enforce singleton
    this.stateManager = StateManager.getInstance();
    this.messageService = MessageService.getInstance();
  }

  /**
   * Get the singleton instance of the MessageHandler
   */
  public static getInstance(): MessageHandler {
    if (!MessageHandler.instance) {
      MessageHandler.instance = new MessageHandler();
    }
    return MessageHandler.instance;
  }

  /**
   * Load options and apply them
   */
  public async loadOptions(): Promise<void> {
    try {
      const options = await StorageService.getOptions();
      await buttonManager.initializeButton(options.showFloatingButton);
    } catch (error) {
      errorHandler.handleError(error as Error, 'storage');
    }
  }

  /**
   * Register message handlers with the MessageService
   */
  public registerMessageHandlers(): void {
    // Register handlers for each action type
    this.messageService.registerHandler(ACTIONS.ANALYZE_REPO, this.handleAnalyzeRepo.bind(this));
    this.messageService.registerHandler(ACTIONS.GET_STATE, this.handleGetState.bind(this));
    this.messageService.registerHandler(ACTIONS.HIDE_PANEL, this.handleHidePanel.bind(this));
    this.messageService.registerHandler(
      ACTIONS.OPTIONS_UPDATED,
      this.handleOptionsUpdated.bind(this)
    );
    this.messageService.registerHandler(ACTIONS.SHOW_PANEL, this.handleShowPanel.bind(this));
    this.messageService.registerHandler(ACTIONS.TOGGLE_PANEL, this.handleTogglePanel.bind(this));

    debugLog('messaging', 'Message handlers registered');
  }

  /**
   * Unregister all message handlers
   */
  public unregisterMessageHandlers(): void {
    this.messageService.destroy();
    debugLog('messaging', 'Message handlers unregistered');
  }

  /**
   * Handle analyze repository message
   */
  private handleAnalyzeRepo(
    message: ExtensionMessage,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    repoAnalyzer
      .analyzeRepository()
      .then(result => {
        if (result) {
          this.stateManager
            .saveAnalysisResult(result)
            .then(() => {
              // Notify background script
              this.messageService.sendAnalysisComplete(result);
              sendResponse({ success: true });
            })
            .catch(error => {
              errorLog('analysis', 'Error saving analysis result:', error);
              sendResponse({ error: (error as Error).message, success: false });
            });
        } else {
          sendResponse({ error: 'Analysis failed or returned null', success: false });
        }
      })
      .catch(error => {
        errorLog('analysis', 'Error analyzing repository:', error);
        sendResponse({ error: (error as Error).message, success: false });
      });

    return true; // Keep the message channel open for async response
  }

  /**
   * Handle get state message
   */
  private handleGetState(
    message: ExtensionMessage,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    try {
      const state = this.stateManager.getState();
      sendResponse(state);
    } catch (error) {
      errorLog('messaging', 'Error getting state:', error);
      sendResponse({
        hasAnalysisData: false,
        isPanelVisible: false,
        repoAnalysis: null,
      });
    }

    return true; // Immediate response, but keep consistent pattern
  }

  /**
   * Handle hide panel message
   */
  private handleHidePanel(
    message: ExtensionMessage,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    const state = this.stateManager.getState();

    if (state.isPanelVisible) {
      this.stateManager
        .setPanelVisibility(false)
        .then(() => {
          sendResponse({ isPanelVisible: false, success: true });
        })
        .catch(error => {
          errorLog('ui', 'Error hiding panel:', error);
          sendResponse({ error: (error as Error).message, success: false });
        });
    } else {
      debugLog('ui', 'Cannot hide panel: Panel not visible');
      sendResponse({
        isPanelVisible: state.isPanelVisible,
        reason: 'Panel not visible',
        success: false,
      });
    }

    return true; // Keep the message channel open for async response
  }

  /**
   * Handle options updated message
   */
  private handleOptionsUpdated(
    message: ExtensionMessage,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    this.loadOptions()
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        errorLog('messaging', 'Error updating options:', error);
        sendResponse({ error: (error as Error).message, success: false });
      });

    return true; // Keep the message channel open for async response
  }

  /**
   * Handle show panel message
   */
  private handleShowPanel(
    message: ExtensionMessage,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    const state = this.stateManager.getState();

    if (state.repoAnalysis && !state.isPanelVisible) {
      this.stateManager
        .setPanelVisibility(true)
        .then(() => {
          sendResponse({ isPanelVisible: true, success: true });
        })
        .catch(error => {
          errorLog('ui', 'Error showing panel:', error);
          sendResponse({ error: (error as Error).message, success: false });
        });
    } else {
      const reason = !state.repoAnalysis ? 'No analysis data' : 'Panel already visible';
      debugLog('ui', `Cannot show panel: ${reason}`);
      sendResponse({
        isPanelVisible: state.isPanelVisible,
        reason: reason,
        success: false,
      });
    }

    return true; // Keep the message channel open for async response
  }

  /**
   * Handle toggle panel message
   */
  private handleTogglePanel(
    message: ExtensionMessage,
    sender: Browser.runtime.MessageSender,
    sendResponse: (response?: GenericResponse) => void
  ): boolean {
    const state = this.stateManager.getState();

    if (state.isPanelVisible) {
      // Hide panel if visible
      this.stateManager
        .setPanelVisibility(false)
        .then(() => {
          sendResponse({ isPanelVisible: false, success: true });
        })
        .catch(error => {
          errorLog('ui', 'Error hiding panel:', error);
          sendResponse({ error: (error as Error).message, success: false });
        });
    } else if (state.repoAnalysis) {
      // Show panel if analysis data exists
      this.stateManager
        .setPanelVisibility(true)
        .then(() => {
          sendResponse({ isPanelVisible: true, success: true });
        })
        .catch(error => {
          errorLog('ui', 'Error showing panel:', error);
          sendResponse({ error: (error as Error).message, success: false });
        });
    } else {
      // No analysis data
      debugLog('ui', 'Cannot toggle panel: No analysis data');
      sendResponse({
        isPanelVisible: false,
        reason: 'No analysis data',
        success: false,
      });
    }

    return true; // Keep the message channel open for async response
  }
}

// Export the singleton instance
export const messageHandler = MessageHandler.getInstance();
