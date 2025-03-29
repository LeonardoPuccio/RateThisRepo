import { RepositoryAnalyzer } from './utils/repository-analyzer';
import { UIManager } from './utils/ui-manager';
import { ToggleButton } from './ui/components/ToggleButton';
import { STORAGE_KEYS, ACTIONS } from './constants';
import { DEBUG_MODE, debugLog } from './config';

// Global state
let isPanelVisible = false;
let currentPanel: HTMLElement | null = null;
let repoAnalysisData: any = null;
let toggleButton: ToggleButton | null = null;

/**
 * Update the state and ensure it's saved to storage
 */
function updateState(panelVisible: boolean, hasData: boolean = repoAnalysisData !== null): Promise<void> {
  debugLog('ui', `Setting state: panelVisible=${panelVisible}, hasData=${hasData}`);
  
  return new Promise((resolve) => {
    // Update local state
    isPanelVisible = panelVisible;
    
    // Update storage
    chrome.storage.local.set({
      [STORAGE_KEYS.PANEL_VISIBLE]: panelVisible,
      [STORAGE_KEYS.HAS_ANALYSIS_DATA]: hasData
    }, () => {
      // Update toggle button if it exists
      if (toggleButton) {
        toggleButton.setActive(panelVisible);
      }
      
      debugLog('storage', 'State updated in storage');
      resolve();
    });
  });
}

/**
 * Load state from storage and apply it
 */
async function loadStateFromStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get([
      STORAGE_KEYS.PANEL_VISIBLE, 
      STORAGE_KEYS.HAS_ANALYSIS_DATA,
      STORAGE_KEYS.REPO_ANALYSIS
    ], (result) => {
      debugLog('storage', 'Loaded state from storage:', result);
      
      // Update panel visibility
      isPanelVisible = result[STORAGE_KEYS.PANEL_VISIBLE] === true;
      
      // Load analysis data if available
      if (result[STORAGE_KEYS.HAS_ANALYSIS_DATA] === true && result[STORAGE_KEYS.REPO_ANALYSIS]) {
        repoAnalysisData = result[STORAGE_KEYS.REPO_ANALYSIS];
        
        // If panel should be visible, show it
        if (isPanelVisible && !currentPanel) {
          currentPanel = UIManager.displayAnalysisPanel(repoAnalysisData);
        }
      }
      
      resolve();
    });
  });
}

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog('messaging', 'Received message:', message.action);
  
  if (message.action === ACTIONS.ANALYZE_REPO) {
    analyzeRepository().then(() => {
      sendResponse({ success: true });
    }).catch(error => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  } 
  
  if (message.action === ACTIONS.SHOW_PANEL) {
    if (repoAnalysisData && !isPanelVisible) {
      currentPanel = UIManager.displayAnalysisPanel(repoAnalysisData);
      updateState(true).then(() => {
        sendResponse({ success: true, isPanelVisible: true });
      });
    } else {
      sendResponse({ 
        success: false, 
        reason: !repoAnalysisData ? 'No analysis data' : 'Panel already visible',
        isPanelVisible
      });
    }
    return true;
  } 
  
  if (message.action === ACTIONS.HIDE_PANEL) {
    if (isPanelVisible && currentPanel) {
      currentPanel.remove();
      currentPanel = null;
      updateState(false).then(() => {
        sendResponse({ success: true, isPanelVisible: false });
      });
    } else {
      sendResponse({ 
        success: false, 
        reason: 'Panel not visible',
        isPanelVisible 
      });
    }
    return true;
  } 
  
  if (message.action === ACTIONS.TOGGLE_PANEL) {
    if (isPanelVisible && currentPanel) {
      currentPanel.remove();
      currentPanel = null;
      updateState(false).then(() => {
        sendResponse({ success: true, isPanelVisible: false });
      });
    } else if (repoAnalysisData) {
      currentPanel = UIManager.displayAnalysisPanel(repoAnalysisData);
      updateState(true).then(() => {
        sendResponse({ success: true, isPanelVisible: true });
      });
    } else {
      sendResponse({ 
        success: false, 
        reason: 'No analysis data',
        isPanelVisible: false 
      });
    }
    return true;
  }
  
  if (message.action === ACTIONS.GET_STATE) {
    sendResponse({
      isPanelVisible,
      hasAnalysisData: repoAnalysisData !== null
    });
    return true;
  }
  
  if (message.action === ACTIONS.OPTIONS_UPDATED) {
    loadOptionsAndApply().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  return false;
});

// Check if we're on a GitHub repository page and add button if needed
async function initializeOnGitHub(): Promise<void> {
  if (window.location.href.includes('github.com/') && 
      window.location.pathname.split('/').filter(Boolean).length >= 2) {
    
    debugLog('ui', 'Initializing on GitHub page');
    
    // Load state from storage first
    await loadStateFromStorage();
    
    // Then load and apply options
    await loadOptionsAndApply();
    
    debugLog('ui', 'Initialization complete');
  }
}

// Load options from storage and apply them
async function loadOptionsAndApply(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.sync.get({ [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: true }, function(options) {
      const showFloatingButton = options[STORAGE_KEYS.SHOW_FLOATING_BUTTON];
      
      debugLog('ui', 'Applying options, showFloatingButton:', showFloatingButton);
      
      if (showFloatingButton) {
        if (!toggleButton) {
          toggleButton = new ToggleButton(toggleAnalysisPanel);
          toggleButton.appendTo(document.body);
          toggleButton.setActive(isPanelVisible);
        }
      } else {
        const buttonContainer = document.getElementById('repo-evaluator-button-container');
        if (buttonContainer) {
          buttonContainer.remove();
          toggleButton = null;
        }
      }
      
      resolve();
    });
  });
}

// Toggle the analysis panel visibility
function toggleAnalysisPanel(): void {
  debugLog('ui', 'Toggle panel called, current visibility:', isPanelVisible);
  
  if (isPanelVisible && currentPanel) {
    // Hide panel
    currentPanel.remove();
    currentPanel = null;
    updateState(false);
  } else {
    // If we already have results, show them
    if (repoAnalysisData) {
      currentPanel = UIManager.displayAnalysisPanel(repoAnalysisData);
      updateState(true);
    } else {
      // Otherwise, run the analysis
      analyzeRepository();
    }
  }
}

// Main function to analyze the repository
async function analyzeRepository(): Promise<void> {
  try {
    debugLog('analysis', 'Starting repository analysis');
    
    // Extract username and repository name from URL
    const urlParts = window.location.pathname.split('/').filter(Boolean);
    const username = urlParts[0];
    const repoName = urlParts[1];
    
    // Show loading indication
    UIManager.showLoading();
    
    // Create repository analyzer instance
    const analyzer = new RepositoryAnalyzer(username, repoName);
    
    // Detect README from DOM since we're in the content script
    analyzer.detectReadmeFromDOM(document);
    
    // Analyze the repository
    const result = await analyzer.analyze();
    
    debugLog('analysis', 'Analysis complete');
    
    // Save the result for later use
    repoAnalysisData = result;
    
    // Store in Chrome storage
    chrome.storage.local.set({ 
      [STORAGE_KEYS.REPO_ANALYSIS]: result,
      [STORAGE_KEYS.HAS_ANALYSIS_DATA]: true 
    });
    
    // Send results to background script for cross-tab access
    chrome.runtime.sendMessage({
      action: ACTIONS.ANALYSIS_COMPLETE,
      data: result
    });
    
    // Display the results visually
    if (isPanelVisible && currentPanel) {
      // Remove the existing panel first
      currentPanel.remove();
    }
    
    // Create and display the UI panel
    currentPanel = UIManager.displayAnalysisPanel(result);
    
    // Update state
    await updateState(true, true);
  } catch (error) {
    console.error("Error analyzing repository:", error);
    UIManager.showError("Failed to analyze repository: " + (error as Error).message);
  }
}

// Initialize when the page loads
initializeOnGitHub();

// Listen for storage changes that might affect our UI
chrome.storage.onChanged.addListener((changes, namespace) => {
  // Handle option changes
  if (namespace === 'sync' && changes[STORAGE_KEYS.SHOW_FLOATING_BUTTON]) {
    loadOptionsAndApply();
  }
});

// Log initialization 
console.log('Content script loaded. Debug mode is:', DEBUG_MODE ? 'ENABLED' : 'DISABLED');
