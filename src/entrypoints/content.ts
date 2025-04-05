import { ACTIONS } from '@/utils/constants';
import { debugLog, errorLog } from '@/utils/config';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { AnalysisPanel } from '@/ui/components/AnalysisPanel';
import { RepositoryAnalyzer } from '@/utils/repository-analyzer';
import { StorageService } from '@/services/StorageService';
import { StateManager } from '@/services/StateManager';
import { AnalysisResult } from '@/interfaces/analysis.interface';

export default defineContentScript({
  matches: ['https://github.com/*/*'],
  
  async main(ctx) {
    debugLog('lifecycle', 'Content script loaded');
    
    // Component references
    let analysisPanel: AnalysisPanel | null = null;
    let toggleButton: ToggleButton | null = null;
    
    // Initialize the state manager
    const stateManager = StateManager.getInstance();
    await stateManager.initialize();
    
    // Get initial state
    const initialState = stateManager.getState();
    
    /**
     * Display analysis panel with the provided data
     */
    function displayAnalysisPanel(data: AnalysisResult): void {
      // Create panel if it doesn't exist
      if (!analysisPanel) {
        analysisPanel = new AnalysisPanel();
        analysisPanel.appendTo(document.body);
      }
      
      // Set data and show the panel
      analysisPanel.setData(data);
      analysisPanel.show();
    }
    
    /**
     * Hide and remove the analysis panel
     */
    function hideAnalysisPanel(): void {
      if (analysisPanel) {
        analysisPanel.remove();
        analysisPanel = null;
      }
    }
    
    // Listen for state events
    stateManager.on('panel:visibility-changed', (isVisible: boolean) => {
      debugLog('state', `Panel visibility changed: ${isVisible}`);
      
      if (isVisible) {
        const state = stateManager.getState();
        if (state.repoAnalysis) {
          displayAnalysisPanel(state.repoAnalysis);
        }
      } else {
        hideAnalysisPanel();
      }
      
      // Update toggle button
      if (toggleButton) {
        toggleButton.setActive(isVisible);
      }
    });
    
    stateManager.on('analysis:completed', (data: AnalysisResult) => {
      debugLog('state', 'Analysis completed, data received');
      
      // If panel should be visible, display it
      const state = stateManager.getState();
      if (state.isPanelVisible) {
        displayAnalysisPanel(data);
      }
    });
    
    stateManager.on('options:changed', (options: { showFloatingButton: boolean }) => {
      debugLog('state', 'Options changed:', options);
      updateToggleButtonVisibility(options.showFloatingButton);
    });
    
    // Listen for messages from the extension
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      debugLog('messaging', 'Received message:', message.action);
      
      if (message.action === ACTIONS.ANALYZE_REPO) {
        analyzeRepository().then(() => {
          return { success: true };
        }).catch(error => {
          errorLog('analysis', 'Error analyzing repository:', error);
          return { success: false, error: error.message };
        });
        return true;
      } 
      
      if (message.action === ACTIONS.SHOW_PANEL) {
        const state = stateManager.getState();
        if (state.repoAnalysis && !state.isPanelVisible) {
          stateManager.setPanelVisibility(true).then(() => {
            sendResponse({ success: true, isPanelVisible: true });
          }).catch(error => {
            errorLog('ui', 'Error showing panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        } else {
          const reason = !state.repoAnalysis ? 'No analysis data' : 'Panel already visible';
          debugLog('ui', `Cannot show panel: ${reason}`);
          sendResponse({ 
            success: false, 
            reason: reason,
            isPanelVisible: state.isPanelVisible
          });
        }
        return true;
      } 
      
      if (message.action === ACTIONS.HIDE_PANEL) {
        const state = stateManager.getState();
        if (state.isPanelVisible) {
          stateManager.setPanelVisibility(false).then(() => {
            sendResponse({ success: true, isPanelVisible: false });
          }).catch(error => {
            errorLog('ui', 'Error hiding panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        } else {
          debugLog('ui', 'Cannot hide panel: Panel not visible');
          sendResponse({ 
            success: false, 
            reason: 'Panel not visible',
            isPanelVisible: state.isPanelVisible 
          });
        }
        return true;
      } 
      
      if (message.action === ACTIONS.TOGGLE_PANEL) {
        const state = stateManager.getState();
        if (state.isPanelVisible) {
          stateManager.setPanelVisibility(false).then(() => {
            sendResponse({ success: true, isPanelVisible: false });
          }).catch(error => {
            errorLog('ui', 'Error hiding panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        } else if (state.repoAnalysis) {
          stateManager.setPanelVisibility(true).then(() => {
            sendResponse({ success: true, isPanelVisible: true });
          }).catch(error => {
            errorLog('ui', 'Error showing panel:', error);
            sendResponse({ success: false, error: error.message });
          });
        } else {
          debugLog('ui', 'Cannot toggle panel: No analysis data');
          sendResponse({ 
            success: false, 
            reason: 'No analysis data',
            isPanelVisible: false 
          });
        }
        return true;
      }
      
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
      
      if (message.action === ACTIONS.OPTIONS_UPDATED) {
        loadOptionsAndApply().then(() => {
          sendResponse({ success: true });
        }).catch(error => {
          errorLog('messaging', 'Error updating options:', error);
          sendResponse({ success: false, error: error.message });
        });
        return true;
      }
      
      return false;
    });
    
    // Check if we're on a GitHub repository page and initialize if needed
    async function initializeOnGitHub(): Promise<void> {
      if (window.location.href.includes('github.com/') && 
          window.location.pathname.split('/').filter(Boolean).length >= 2) {
        
        debugLog('ui', 'Initializing on GitHub page');
        
        // Load and apply options
        await loadOptionsAndApply();
        
        // Show UI based on initial state
        if (initialState.isPanelVisible && initialState.repoAnalysis) {
          displayAnalysisPanel(initialState.repoAnalysis);
          
          if (toggleButton) {
            toggleButton.setActive(true);
          }
        }
        
        debugLog('ui', 'Initialization complete');
      }
    }
    
    // Load options from storage and apply them
    async function loadOptionsAndApply(): Promise<void> {
      try {
        const options = await StorageService.getOptions();
        updateToggleButtonVisibility(options.showFloatingButton);
      } catch (error) {
        errorLog('storage', 'Error loading options:', error);
      }
    }
    
    // Update toggle button visibility based on options
    function updateToggleButtonVisibility(show: boolean): void {
      debugLog('ui', 'Updating toggle button visibility:', show);
      
      if (show) {
        if (!toggleButton) {
          toggleButton = new ToggleButton(toggleAnalysisPanel);
          toggleButton.appendTo(document.body);
          
          // Set initial state
          const state = stateManager.getState();
          toggleButton.setActive(state.isPanelVisible);
        }
      } else {
        const buttonContainer = document.getElementById('repo-evaluator-button-container');
        if (buttonContainer) {
          buttonContainer.remove();
          toggleButton = null;
        }
      }
    }
    
    // Toggle the analysis panel visibility
    function toggleAnalysisPanel(): void {
      const state = stateManager.getState();
      debugLog('ui', 'Toggle panel called, current visibility:', state.isPanelVisible);
      
      if (state.isPanelVisible) {
        // Hide panel
        stateManager.setPanelVisibility(false).catch(error => {
          errorLog('ui', 'Error hiding panel:', error);
        });
      } else {
        // If we already have results, show them
        if (state.repoAnalysis) {
          stateManager.setPanelVisibility(true).catch(error => {
            errorLog('ui', 'Error showing panel:', error);
          });
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
        stateManager.notifyAnalysisStarted();
        
        // Extract username and repository name from URL
        const urlParts = window.location.pathname.split('/').filter(Boolean);
        const username = urlParts[0];
        const repoName = urlParts[1];
        
        // Create repository analyzer instance
        const analyzer = new RepositoryAnalyzer(username, repoName);
        
        // Detect README from DOM since we're in the content script
        analyzer.detectReadmeFromDOM(document);
        
        // Analyze the repository
        const result = await analyzer.analyze();
        
        debugLog('analysis', 'Analysis complete');
        
        // Save the result using the state manager
        await stateManager.saveAnalysisResult(result);
        
        // Send results to background script for cross-tab access
        browser.runtime.sendMessage({
          action: ACTIONS.ANALYSIS_COMPLETE,
          data: result
        }).catch(error => {
          errorLog('messaging', 'Error sending analysis complete message:', error);
        });
        
        // Set panel to visible to show the results
        await stateManager.setPanelVisibility(true);
      } catch (error) {
        errorLog('analysis', 'Error analyzing repository:', error);
        stateManager.notifyAnalysisError(error as Error);
        
        // Show an error panel or notification
        if (analysisPanel) {
          hideAnalysisPanel();
        }
        
        // Create a basic error panel
        const errorPanel = document.createElement('div');
        errorPanel.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 20px;
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          z-index: 10000;
          max-width: 400px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        `;
        
        const errorTitle = document.createElement('h3');
        errorTitle.style.color = '#cb2431';
        errorTitle.textContent = 'Analysis Error';
        
        const errorMessage = document.createElement('p');
        errorMessage.textContent = "Failed to analyze repository: " + (error as Error).message;
        
        const closeButton = document.createElement('button');
        closeButton.textContent = 'Close';
        closeButton.style.cssText = `
          padding: 5px 10px;
          cursor: pointer;
          margin-top: 10px;
        `;
        closeButton.onclick = () => errorPanel.remove();
        
        errorPanel.appendChild(errorTitle);
        errorPanel.appendChild(errorMessage);
        errorPanel.appendChild(closeButton);
        
        document.body.appendChild(errorPanel);
      }
    }
    
    // Initialize when the page loads
    await initializeOnGitHub();
    
    // Use context event listeners to prevent memory leaks
    ctx.addEventListener(window, 'load', () => {
      debugLog('lifecycle', 'Window loaded');
    });
    
    // Clean up when the content script is invalidated
    return () => {
      // Clean up state manager
      stateManager.destroy();
      
      // Remove UI elements
      if (analysisPanel) {
        analysisPanel.remove();
      }
      
      if (toggleButton) {
        const buttonContainer = document.getElementById('repo-evaluator-button-container');
        if (buttonContainer) {
          buttonContainer.remove();
        }
      }
      
      debugLog('lifecycle', 'Content script cleaned up');
    };
  }
});
