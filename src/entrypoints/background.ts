import { ExtensionMessage, MessageHandler } from '@/interfaces/messaging.interface';
import { MessageService } from '@/services/MessageService';
import { StateManager } from '@/services/StateManager';
import { StorageService } from '@/services/StorageService';
import { ACTIONS, STORAGE_KEYS } from '@/utils/constants';
import { debugLog, errorLog } from '@/utils/debug';

export default defineBackground(() => {
  debugLog('lifecycle', 'Background script has loaded');

  // Initialize the state manager
  const stateManager = StateManager.getInstance();
  stateManager.initialize().catch(err => {
    errorLog('lifecycle', 'Failed to initialize state manager:', err);
  });

  // Initialize the message service
  const messageService = MessageService.getInstance();

  // Register message handlers
  registerMessageHandlers(messageService, stateManager);

  // Handle service worker lifecycle
  browser.runtime.onStartup.addListener(() => {
    debugLog('lifecycle', 'Service worker starting up');
  });

  // Handle unexpected termination using persistence
  browser.runtime.onSuspend?.addListener(() => {
    debugLog('lifecycle', 'Service worker suspending');
    // No need to save state here as we're already using persistent storage
  });

  // When the extension is installed or updated
  browser.runtime.onInstalled.addListener(() => {
    debugLog('lifecycle', 'Extension installed/updated');

    // Initialize options if needed
    StorageService.getOptions()
      .then(options => {
        if (options.showFloatingButton === undefined) {
          return StorageService.updateOptions({ showFloatingButton: true });
        }
      })
      .catch(err => {
        errorLog('lifecycle', 'Error initializing options:', err);
      });
  });

  // Listen for storage changes
  browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && STORAGE_KEYS.SHOW_FLOATING_BUTTON in changes) {
      browser.tabs
        .query({ url: '*://github.com/*/*' })
        .then(tabs => {
          tabs.forEach(tab => {
            if (tab.id) {
              messageService
                .sendTabMessage(tab.id, { action: ACTIONS.OPTIONS_UPDATED })
                .catch(err => {
                  // Tabs may not be listening yet, which is normal
                  debugLog('messaging', 'Could not notify tab of options change:', err);
                });
            }
          });
        })
        .catch(err => {
          errorLog('messaging', 'Error querying GitHub tabs:', err);
        });
    }
  });
});

/**
 * Register message handlers with the MessageService
 */
function registerMessageHandlers(messageService: MessageService, stateManager: StateManager): void {
  // Handle analyze repository message
  const handleAnalyzeRepo: MessageHandler = (message, sender, sendResponse) => {
    browser.tabs
      .query({ active: true, currentWindow: true })
      .then(tabs => {
        if (tabs[0].id) {
          messageService.sendTabMessage(tabs[0].id, { action: ACTIONS.ANALYZE_REPO }).catch(err => {
            errorLog('messaging', 'Error sending analyze request to tab:', err);
            sendResponse({ error: (err as Error).message, success: false });
          });
        } else {
          sendResponse({ error: 'No active tab found', success: false });
        }
      })
      .catch(err => {
        errorLog('messaging', 'Error querying active tab:', err);
        sendResponse({ error: (err as Error).message, success: false });
      });

    return true; // Keep channel open for async response
  };

  // Handle analysis complete message
  const handleAnalysisComplete: MessageHandler = (message, sender, sendResponse) => {
    const analysisMessage = message as ExtensionMessage;
    if ('data' in analysisMessage) {
      stateManager
        .saveAnalysisResult(analysisMessage.data)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch(err => {
          errorLog('storage', 'Error saving analysis result:', err);
          sendResponse({ error: (err as Error).message, success: false });
        });

      return true; // Keep channel open for async response
    }

    sendResponse({ error: 'Invalid analysis data', success: false });
    return false;
  };

  // Handle get state message
  const handleGetState: MessageHandler = (message, sender, sendResponse) => {
    try {
      const state = stateManager.getState();
      sendResponse(state);
    } catch (error) {
      errorLog('messaging', 'Error getting state:', error);
      sendResponse({
        hasAnalysisData: false,
        isPanelVisible: false,
        repoAnalysis: null,
      });
    }

    return false; // Immediate response
  };

  // Register all handlers
  messageService.registerHandler(ACTIONS.ANALYZE_REPO, handleAnalyzeRepo);
  messageService.registerHandler(ACTIONS.ANALYSIS_COMPLETE, handleAnalysisComplete);
  messageService.registerHandler(ACTIONS.GET_STATE, handleGetState);

  debugLog('messaging', 'Message handlers registered in background script');
}
