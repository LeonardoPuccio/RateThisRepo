import { AnalysisResult } from '@/interfaces/analysis.interface';
import { STORAGE_KEYS, ACTIONS } from '@/utils/constants';
import { DEBUG_MODE, debugLog, errorLog } from '@/utils/config';
import { StorageService } from '@/services/StorageService';
import { StateManager } from '@/services/StateManager';

export default defineBackground(() => {
  debugLog('lifecycle', 'Background script has loaded');
  
  // Initialize the state manager
  const stateManager = StateManager.getInstance();
  stateManager.initialize().catch(err => {
    errorLog('lifecycle', 'Failed to initialize state manager:', err);
  });
  
  // Handle service worker lifecycle
  browser.runtime.onStartup.addListener(() => {
    debugLog('lifecycle', 'Service worker starting up');
  });
  
  // Handle unexpected termination using persistence
  browser.runtime.onSuspend?.addListener(() => {
    debugLog('lifecycle', 'Service worker suspending');
    // No need to save state here as we're already using persistent storage
  });
  
  // Listen for messages from popup or content scripts
  browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    debugLog('messaging', 'Received message:', message.action);
    
    if (message.action === ACTIONS.ANALYZE_REPO) {
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0].id) {
          browser.tabs.sendMessage(tabs[0].id, { action: ACTIONS.ANALYZE_REPO })
            .catch(err => {
              errorLog('messaging', 'Error sending analyze request to tab:', err);
            });
        }
      }).catch(err => {
        errorLog('messaging', 'Error querying active tab:', err);
      });
      
      return true;
    }
    
    if (message.action === ACTIONS.ANALYSIS_COMPLETE) {
      // Save the analysis result using our state manager
      stateManager.saveAnalysisResult(message.data as AnalysisResult)
        .catch(err => {
          errorLog('storage', 'Error saving analysis result:', err);
        });
      
      return true;
    }
    
    // Messaging to request current state
    if (message.action === ACTIONS.GET_STATE) {
      try {
        const state = stateManager.getState();
        sendResponse(state);
      } catch (error) {
        errorLog('messaging', 'Error getting state:', error);
        sendResponse({
          isPanelVisible: false,
          hasAnalysisData: false,
          repoAnalysis: null
        });
      }
      return true;
    }
    
    return false;
  });

  // When the extension is installed or updated
  browser.runtime.onInstalled.addListener(() => {
    debugLog('lifecycle', 'Extension installed/updated');
    
    // Initialize options if needed
    StorageService.getOptions().then(options => {
      if (options.showFloatingButton === undefined) {
        return StorageService.updateOptions({ showFloatingButton: true });
      }
    }).catch(err => {
      errorLog('lifecycle', 'Error initializing options:', err);
    });
  });

  // Listen for storage changes
  browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && STORAGE_KEYS.SHOW_FLOATING_BUTTON in changes) {
      browser.tabs.query({url: "*://github.com/*/*"}).then(tabs => {
        tabs.forEach(tab => {
          if (tab.id) {
            browser.tabs.sendMessage(tab.id, { action: ACTIONS.OPTIONS_UPDATED })
              .catch(err => {
                // Tabs may not be listening yet, which is normal
                debugLog('messaging', 'Could not notify tab of options change:', err);
              });
          }
        });
      }).catch(err => {
        errorLog('messaging', 'Error querying GitHub tabs:', err);
      });
    }
  });
});
