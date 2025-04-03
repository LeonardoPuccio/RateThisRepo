import { ACTIONS } from '@utils/constants';
import { debugLog, errorLog } from '@utils/config';
import { ToggleButton } from '@ui/components/ToggleButton';
import { AnalysisPanel } from '@ui/components/AnalysisPanel';
import { RepositoryAnalyzer } from '@utils/repository-analyzer';
import { StorageService } from '@services/StorageService';
import { AnalysisResult } from '@interfaces/analysis.interface';

export default defineContentScript({
  matches: ['https://github.com/*/*'],
  
  async main(ctx) {
    // Local component references
    let analysisPanel: AnalysisPanel | null = null;
    let toggleButton: ToggleButton | null = null;
    
    // Load initial state
    const initialState = await StorageService.getState();
    
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
    
    // Listen for storage changes
    const unwatchStorageState = StorageService.watchState((state) => {
      debugLog('storage', `Storage state changed: ${JSON.stringify(state)}`);
      
      // Update UI based on new state
      if (state.isPanelVisible && state.repoAnalysis) {
        displayAnalysisPanel(state.repoAnalysis);
      } else {
        hideAnalysisPanel();
      }
      
      // Update toggle button state
      if (toggleButton) {
        toggleButton.setActive(state.isPanelVisible);
      }
    });
    
    // Listen for option changes
    const unwatchOptions = StorageService.watchOptions((options) => {
      debugLog('storage', `Options changed: ${JSON.stringify(options)}`);
      updateToggleButtonVisibility(options.showFloatingButton);
    });
    
    // Listen for messages from the extension
    browser.runtime.onMessage.addListener((message, sender, sendResponse): boolean => {
      debugLog('messaging', 'Received message:', message.action);
      
      if (message.action === ACTIONS.ANALYZE_REPO) {
        analyzeRepository().then(() => {
          return { success: true };
        }).catch(error => {
          return { success: false, error: error.message };
        });
        return true;
      } 
      
      if (message.action === ACTIONS.SHOW_PANEL) {
        StorageService.getState().then(state => {
          if (state.repoAnalysis && !state.isPanelVisible) {
            StorageService.updateUiState(true).then(() => {
              return { success: true, isPanelVisible: true };
            }).catch(error => {
              return { success: false, error: error.message };
            });
          } else {
            return { 
              success: false, 
              reason: !state.repoAnalysis ? 'No analysis data' : 'Panel already visible',
              isPanelVisible: state.isPanelVisible
            };
          }
        }).catch(error => {
          return { success: false, error: error.message };
        });
        return true;
      } 
      
      if (message.action === ACTIONS.HIDE_PANEL) {
        StorageService.getState().then(state => {
          if (state.isPanelVisible) {
            StorageService.updateUiState(false).then(() => {
              return { success: true, isPanelVisible: false };
            }).catch(error => {
              return { success: false, error: error.message };
            });
          } else {
            return { 
              success: false, 
              reason: 'Panel not visible',
              isPanelVisible: state.isPanelVisible 
            };
          }
        }).catch(error => {
          return { success: false, error: error.message };
        });
        return true;
      } 
      
      if (message.action === ACTIONS.TOGGLE_PANEL) {
        StorageService.getState().then(state => {
          if (state.isPanelVisible) {
            // Hide panel
            return StorageService.updateUiState(false).then(() => {
              return { success: true, isPanelVisible: false };
            });
          } else if (state.repoAnalysis) {
            // Show panel with existing data
            return StorageService.updateUiState(true).then(() => {
              return { success: true, isPanelVisible: true };
            });
          } else {
            // No analysis data available
            return { 
              success: false, 
              reason: 'No analysis data',
              isPanelVisible: false 
            };
          }
        }).catch(error => {
          return { success: false, error: error.message };
        });
        return true;
      }
      
      if (message.action === ACTIONS.GET_STATE) {
        StorageService.getState().then(state => {
          sendResponse(state);
        }).catch(error => {
          errorLog('messaging', 'Error getting state:', error);
          sendResponse({
            isPanelVisible: false,
            hasAnalysisData: false,
            repoAnalysis: null
          });
        });
        return true;
      }
      
      if (message.action === ACTIONS.OPTIONS_UPDATED) {
        loadOptionsAndApply().then(() => {
          return { success: true };
        }).catch(error => {
          return { success: false, error: error.message };
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
      const options = await StorageService.getOptions();
      updateToggleButtonVisibility(options.showFloatingButton);
    }
    
    // Update toggle button visibility based on options
    function updateToggleButtonVisibility(show: boolean): void {
      debugLog('ui', 'Updating toggle button visibility:', show);
      
      if (show) {
        if (!toggleButton) {
          toggleButton = new ToggleButton(toggleAnalysisPanel);
          toggleButton.appendTo(document.body);
          
          // Set initial state
          StorageService.getState().then(state => {
            toggleButton?.setActive(state.isPanelVisible);
          }).catch(error => {
            errorLog('ui', 'Error getting state for toggle button:', error);
          });
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
      StorageService.getState().then(state => {
        debugLog('ui', 'Toggle panel called, current visibility:', state.isPanelVisible);
        
        if (state.isPanelVisible) {
          // Hide panel
          StorageService.updateUiState(false).catch(error => {
            errorLog('ui', 'Error hiding panel:', error);
          });
        } else if (state.repoAnalysis) {
          // Show panel with existing data
          StorageService.updateUiState(true).catch(error => {
            errorLog('ui', 'Error showing panel:', error);
          });
        } else {
          // Run analysis if no data exists
          analyzeRepository();
        }
      }).catch(error => {
        errorLog('ui', 'Error getting state for toggle:', error);
      });
    }
    
    // Main function to analyze the repository
    async function analyzeRepository(): Promise<void> {
      try {
        debugLog('analysis', 'Starting repository analysis');
        
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
        
        // Save the result using our storage service
        await StorageService.saveAnalysisResult(result);
        
        // Send results to background script for cross-tab access
        browser.runtime.sendMessage({
          action: ACTIONS.ANALYSIS_COMPLETE,
          data: result
        }).catch(error => {
          errorLog('analysis', 'Error sending analysis complete message:', error);
        });
        
        // Set panel to visible to show the results
        await StorageService.updateUiState(true);
      } catch (error) {
        errorLog('analysis', "Error analyzing repository:", error);
        
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
      debugLog('analysis', 'Window loaded');
    });
    
    // Clean up when the content script is invalidated
    return () => {
      // Remove storage watchers
      unwatchStorageState();
      unwatchOptions();
      
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
      
      debugLog('analysis', 'Content script cleaned up');
    };
  }
});
