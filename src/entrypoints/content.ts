import { debugLog, errorLog } from '@/utils/config';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { AnalysisPanel } from '@/ui/components/AnalysisPanel';
import { RepositoryAnalyzer } from '@/utils/repository-analyzer';
import { StorageService } from '@/services/StorageService';
import { StateManager } from '@/services/StateManager';
import { AnalysisResult } from '@/interfaces/analysis.interface';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';
import { ACTIONS } from '@/utils/constants';
import { ErrorPanelMountData } from '@/ui/interfaces/ui-interfaces';
import { BUTTON_CLASSES } from '@/ui/styles/button-animations';
import '@/assets/tailwind.css';

export default defineContentScript({
  matches: ['https://github.com/*/*'],
  cssInjectionMode: 'ui',

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
    async function displayAnalysisPanel(data: AnalysisResult): Promise<void> {
      // Create panel if it doesn't exist
      if (!analysisPanel) {
        analysisPanel = new AnalysisPanel(undefined, ctx);
        await analysisPanel.initialize();
        await analysisPanel.mount();
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
        analyzeRepository()
          .then(() => {
            return { success: true };
          })
          .catch(error => {
            errorLog('analysis', 'Error analyzing repository:', error);
            return { success: false, error: error.message };
          });
        return true;
      }

      if (message.action === ACTIONS.SHOW_PANEL) {
        const state = stateManager.getState();
        if (state.repoAnalysis && !state.isPanelVisible) {
          stateManager
            .setPanelVisibility(true)
            .then(() => {
              sendResponse({ success: true, isPanelVisible: true });
            })
            .catch(error => {
              errorLog('ui', 'Error showing panel:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else {
          const reason = !state.repoAnalysis ? 'No analysis data' : 'Panel already visible';
          debugLog('ui', `Cannot show panel: ${reason}`);
          sendResponse({
            success: false,
            reason: reason,
            isPanelVisible: state.isPanelVisible,
          });
        }
        return true;
      }

      if (message.action === ACTIONS.HIDE_PANEL) {
        const state = stateManager.getState();
        if (state.isPanelVisible) {
          stateManager
            .setPanelVisibility(false)
            .then(() => {
              sendResponse({ success: true, isPanelVisible: false });
            })
            .catch(error => {
              errorLog('ui', 'Error hiding panel:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else {
          debugLog('ui', 'Cannot hide panel: Panel not visible');
          sendResponse({
            success: false,
            reason: 'Panel not visible',
            isPanelVisible: state.isPanelVisible,
          });
        }
        return true;
      }

      if (message.action === ACTIONS.TOGGLE_PANEL) {
        const state = stateManager.getState();
        if (state.isPanelVisible) {
          stateManager
            .setPanelVisibility(false)
            .then(() => {
              sendResponse({ success: true, isPanelVisible: false });
            })
            .catch(error => {
              errorLog('ui', 'Error hiding panel:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else if (state.repoAnalysis) {
          stateManager
            .setPanelVisibility(true)
            .then(() => {
              sendResponse({ success: true, isPanelVisible: true });
            })
            .catch(error => {
              errorLog('ui', 'Error showing panel:', error);
              sendResponse({ success: false, error: error.message });
            });
        } else {
          debugLog('ui', 'Cannot toggle panel: No analysis data');
          sendResponse({
            success: false,
            reason: 'No analysis data',
            isPanelVisible: false,
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
            repoAnalysis: null,
          });
        }
        return true;
      }

      if (message.action === ACTIONS.OPTIONS_UPDATED) {
        loadOptionsAndApply()
          .then(() => {
            sendResponse({ success: true });
          })
          .catch(error => {
            errorLog('messaging', 'Error updating options:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true;
      }

      return false;
    });

    // Check if we're on a GitHub repository page and initialize if needed
    async function initializeOnGitHub(): Promise<void> {
      if (
        window.location.href.includes('github.com/') &&
        window.location.pathname.split('/').filter(Boolean).length >= 2
      ) {
        debugLog('ui', 'Initializing on GitHub page');

        // Load and apply options
        await loadOptionsAndApply();

        // Show UI based on initial state
        if (initialState.isPanelVisible && initialState.repoAnalysis) {
          await displayAnalysisPanel(initialState.repoAnalysis);

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
        await updateToggleButtonVisibility(options.showFloatingButton);
      } catch (error) {
        errorLog('storage', 'Error loading options:', error);
      }
    }

    // Update toggle button visibility based on options
    async function updateToggleButtonVisibility(show: boolean): Promise<void> {
      debugLog('ui', 'Updating toggle button visibility:', show);

      if (show) {
        if (!toggleButton) {
          toggleButton = new ToggleButton(toggleAnalysisPanel, ctx);
          await toggleButton.initialize();
          await toggleButton.mount();

          // Set initial state
          const state = stateManager.getState();
          toggleButton.setActive(state.isPanelVisible);
        }
      } else {
        if (toggleButton) {
          toggleButton.remove();
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
      } else if (state.repoAnalysis) {
        // Show panel
        stateManager.setPanelVisibility(true).catch(error => {
          errorLog('ui', 'Error showing panel:', error);
        });
      } else {
        // Analyze if no data
        analyzeRepository();
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
        browser.runtime
          .sendMessage({
            action: ACTIONS.ANALYSIS_COMPLETE,
            data: result,
          })
          .catch(error => {
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

        // Create a basic error panel using shadow DOM for isolation
        try {
          // Create overlay for the error panel
          const errorOverlay = document.createElement('div');
          errorOverlay.style.position = 'fixed';
          errorOverlay.style.top = '0';
          errorOverlay.style.right = '0';
          errorOverlay.style.width = '350px'; // Just enough to cover the error panel
          errorOverlay.style.height = '200px';
          errorOverlay.style.pointerEvents = 'none'; // Let events pass through by default
          errorOverlay.style.zIndex = '9998'; // Just below our UI

          // Add the overlay to the document
          document.body.appendChild(errorOverlay);

          // Create the error UI with Shadow DOM and Tailwind
          const errorUi = await createShadowRootUi<ErrorPanelMountData>(ctx, {
            name: 'repo-evaluator-error',
            position: 'inline',
            anchor: 'body',
            mode: 'open',
            onMount: (container, shadow, shadowHost) => {
              // Add component base class
              container.classList.add(BUTTON_CLASSES.COMPONENT);

              // Style the host element directly
              shadowHost.style.position = 'fixed';
              shadowHost.style.top = '20px';
              shadowHost.style.right = '20px';
              shadowHost.style.zIndex = '10000';
              shadowHost.style.overflow = 'visible';

              // Create error container using Tailwind classes
              const errorContainer = document.createElement('div');
              errorContainer.className = 'bg-white rounded-lg shadow-lg p-5 max-w-sm';
              errorContainer.style.pointerEvents = 'auto'; // Make sure error container captures events

              // Create error title
              const errorTitle = document.createElement('h3');
              errorTitle.className = 'rtr-error font-semibold text-lg mb-3';
              errorTitle.textContent = 'Analysis Error';

              // Create error message
              const errorMessage = document.createElement('p');
              errorMessage.className = 'text-black mb-4';
              errorMessage.textContent = `Failed to analyze repository: ${(error as Error).message}`;

              // Create close button
              const closeButton = document.createElement('button');
              closeButton.className =
                'px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors';
              closeButton.textContent = 'Close';

              // Add event listener for close button
              closeButton.addEventListener('click', () => {
                errorUi.remove();
                // Remove overlay
                if (errorOverlay.parentNode) {
                  errorOverlay.parentNode.removeChild(errorOverlay);
                }
              });

              // Critical: Add wheel event handler to the error container
              errorContainer.addEventListener(
                'wheel',
                e => {
                  // Always stop propagation and prevent default for error container
                  e.stopPropagation();
                  e.preventDefault();
                },
                { passive: false }
              );

              // Assemble the error UI
              errorContainer.appendChild(errorTitle);
              errorContainer.appendChild(errorMessage);
              errorContainer.appendChild(closeButton);
              container.appendChild(errorContainer);

              return {
                container,
                errorContainer,
                errorTitle,
                errorMessage,
                closeButton,
              };
            },
          });

          // Mount the error UI using WXT's mount method
          errorUi.mount();

          // Auto-remove after 10 seconds
          setTimeout(() => {
            errorUi.remove();
            // Remove overlay
            if (errorOverlay.parentNode) {
              errorOverlay.parentNode.removeChild(errorOverlay);
            }
          }, 10000);
        } catch (uiError) {
          // Fallback to simple error notification if shadow DOM fails
          errorLog('ui', 'Error creating error UI:', uiError);
          alert(`Error analyzing repository: ${(error as Error).message}`);
        }
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
        toggleButton.remove();
      }

      debugLog('lifecycle', 'Content script cleaned up');
    };
  },
});
