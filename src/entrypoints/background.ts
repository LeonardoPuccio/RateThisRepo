import { AnalysisResult } from '~/interfaces/analysis.interface';
import { STORAGE_KEYS, ACTIONS } from '~/utils/constants';
import { DEBUG_MODE, debugLog } from '~/utils/config';

export default defineBackground(() => {
  // Listen for messages from popup or content scripts
  browser.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
    if (DEBUG_MODE) {
      console.log('[Background] Received message:', message.action);
    }
    
    if (message.action === ACTIONS.ANALYZE_REPO) {
      browser.tabs.query({ active: true, currentWindow: true }).then(tabs => {
        if (tabs[0].id) {
          browser.tabs.sendMessage(tabs[0].id, { action: ACTIONS.ANALYZE_REPO });
        }
      });
    }
    
    if (message.action === ACTIONS.ANALYSIS_COMPLETE) {
      browser.storage.local.set({ 
        [STORAGE_KEYS.REPO_ANALYSIS]: message.data as AnalysisResult,
        [STORAGE_KEYS.HAS_ANALYSIS_DATA]: true 
      });
    }
    
    return true;
  });

  // When the extension is installed or updated
  browser.runtime.onInstalled.addListener(() => {
    if (DEBUG_MODE) {
      console.log('[Background] Extension installed/updated');
    }
    
    // Set default options if not already set
    browser.storage.sync.get(STORAGE_KEYS.SHOW_FLOATING_BUTTON).then(result => {
      if (result[STORAGE_KEYS.SHOW_FLOATING_BUTTON] === undefined) {
        browser.storage.sync.set({ [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: true });
      }
    });
    
    // Initialize state variables if not set
    browser.storage.local.get([
      STORAGE_KEYS.PANEL_VISIBLE,
      STORAGE_KEYS.HAS_ANALYSIS_DATA
    ]).then(result => {
      const updates: Record<string, any> = {};
      
      if (result[STORAGE_KEYS.PANEL_VISIBLE] === undefined) {
        updates[STORAGE_KEYS.PANEL_VISIBLE] = false;
      }
      
      if (result[STORAGE_KEYS.HAS_ANALYSIS_DATA] === undefined) {
        updates[STORAGE_KEYS.HAS_ANALYSIS_DATA] = false;
      }
      
      if (Object.keys(updates).length > 0) {
        browser.storage.local.set(updates);
      }
    });
  });

  // Listen for storage changes
  browser.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && STORAGE_KEYS.SHOW_FLOATING_BUTTON in changes) {
      browser.tabs.query({url: "*://github.com/*/*"}).then(tabs => {
        tabs.forEach(tab => {
          if (tab.id) {
            browser.tabs.sendMessage(tab.id, { action: ACTIONS.OPTIONS_UPDATED });
          }
        });
      });
    }
  });

  console.log('Background script has loaded. DEBUG_MODE:', DEBUG_MODE);
});
