import { AnalysisResult } from './interfaces/analysis.interface';
import { STORAGE_KEYS, ACTIONS } from './constants';
import { DEBUG_MODE } from './config';

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (DEBUG_MODE) {
    console.log('[Background] Received message:', message.action);
  }
  
  if (message.action === ACTIONS.ANALYZE_REPO) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: ACTIONS.ANALYZE_REPO });
      }
    });
  }
  
  if (message.action === ACTIONS.ANALYSIS_COMPLETE) {
    chrome.storage.local.set({ 
      [STORAGE_KEYS.REPO_ANALYSIS]: message.data as AnalysisResult,
      [STORAGE_KEYS.HAS_ANALYSIS_DATA]: true 
    });
  }
  
  return true;
});

// When the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  if (DEBUG_MODE) {
    console.log('[Background] Extension installed/updated');
  }
  
  // Set default options if not already set
  chrome.storage.sync.get(STORAGE_KEYS.SHOW_FLOATING_BUTTON, (result) => {
    if (result[STORAGE_KEYS.SHOW_FLOATING_BUTTON] === undefined) {
      chrome.storage.sync.set({ [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: true });
    }
  });
  
  // Initialize state variables if not set
  chrome.storage.local.get([
    STORAGE_KEYS.PANEL_VISIBLE,
    STORAGE_KEYS.HAS_ANALYSIS_DATA
  ], (result) => {
    const updates: Record<string, any> = {};
    
    if (result[STORAGE_KEYS.PANEL_VISIBLE] === undefined) {
      updates[STORAGE_KEYS.PANEL_VISIBLE] = false;
    }
    
    if (result[STORAGE_KEYS.HAS_ANALYSIS_DATA] === undefined) {
      updates[STORAGE_KEYS.HAS_ANALYSIS_DATA] = false;
    }
    
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes[STORAGE_KEYS.SHOW_FLOATING_BUTTON]) {
    chrome.tabs.query({url: "*://github.com/*/*"}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: ACTIONS.OPTIONS_UPDATED });
        }
      });
    });
  }
});
