import { AnalysisResult } from '@/interfaces/analysis.interface';
import { StateManager } from '@/services/StateManager';
import { StorageService } from '@/services/StorageService';
import { debugLog, errorLog } from '@/utils/config';
import { type ContentScriptContext } from 'wxt/utils/content-script-context';

import { buttonManager } from './button-manager';
import { errorHandler } from './error-handler';
import { messageHandler } from './message-handler';
import { panelManager } from './panel-manager';
import { repoAnalyzer } from './repo-analyzer';

/**
 * Content script initializer
 * - Coordinates the initialization of all content script components
 */
export class Initializer {
  private static instance: Initializer;
  private ctx!: ContentScriptContext;
  private isInitialized = false;
  private stateManager: StateManager;

  private constructor() {
    // Private constructor to enforce singleton
    this.stateManager = StateManager.getInstance();
  }

  /**
   * Get the singleton instance of the Initializer
   */
  public static getInstance(): Initializer {
    if (!Initializer.instance) {
      Initializer.instance = new Initializer();
    }
    return Initializer.instance;
  }

  /**
   * Clean up resources when content script is invalidated
   */
  public cleanup(): void {
    panelManager.cleanup();
    buttonManager.cleanup();
    this.stateManager.destroy();
    this.isInitialized = false;

    debugLog('lifecycle', 'Content script resources cleaned up');
  }

  /**
   * Initialize all components
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      debugLog('lifecycle', 'Content script already initialized');
      return;
    }

    try {
      debugLog('lifecycle', 'Starting content script initialization');

      // Register toggle panel callback
      buttonManager.setToggleCallback(this.toggleAnalysisPanel.bind(this));

      // Initialize state manager
      await this.stateManager.initialize();

      // Register message handlers
      messageHandler.registerMessageListener();

      // Setup event listeners
      this.setupEventListeners();

      // Check if we're on a GitHub repo page and initialize if needed
      await this.initializeOnGitHub();

      this.isInitialized = true;
      debugLog('lifecycle', 'Content script initialization complete');
    } catch (error) {
      errorLog('lifecycle', 'Error initializing content script:', error);

      try {
        // Try to show an error notification
        errorHandler.handleError(error as Error, 'lifecycle');
      } catch (displayError) {
        // Last resort - log to console if even error display fails
        console.error('Content script initialization failed:', displayError);
        // log the original error too - precaution, it may not be necessary
        console.error('Original initialization error:', error);
      }
    }
  }

  /**
   * Set the context for the initializer
   */
  public setContext(ctx: ContentScriptContext): void {
    this.ctx = ctx;

    // Pass context to other managers
    errorHandler.setContext(ctx);
    panelManager.setContext(ctx);
    buttonManager.setContext(ctx);
  }

  /**
   * Analyze the current repository
   */
  private async analyzeRepository(): Promise<void> {
    try {
      debugLog('analysis', 'Starting repository analysis');
      this.stateManager.notifyAnalysisStarted();

      // Analyze repository
      const result = await repoAnalyzer.analyzeRepository();

      if (result) {
        // Save result and notify
        await this.stateManager.saveAnalysisResult(result);
        repoAnalyzer.notifyAnalysisComplete(result);

        // Show panel
        await this.stateManager.setPanelVisibility(true);
      }
    } catch (error) {
      errorLog('analysis', 'Error in repository analysis flow:', error);
      this.stateManager.notifyAnalysisError(error as Error);
      errorHandler.handleError(error as Error, 'analysis');
    }
  }

  /**
   * Check if we're on a GitHub repository page and initialize if needed
   */
  private async initializeOnGitHub(): Promise<void> {
    try {
      const options = await StorageService.getOptions();
      const showButton = options?.showFloatingButton ?? true;

      if (!repoAnalyzer.isGitHubRepoPage()) {
        debugLog('lifecycle', 'Not on a GitHub repository page');
        buttonManager.initializeButton(false);
        return;
      }

      debugLog('lifecycle', 'On GitHub repository page, initializing components');

      // Initialize button based on option
      await buttonManager.initializeButton(showButton);

      // Only handle panel if button is shown
      if (showButton) {
        const state = this.stateManager.getState();
        if (state.isPanelVisible && state.repoAnalysis) {
          await panelManager.displayAnalysisPanel(state.repoAnalysis);
          buttonManager.setButtonActive(true);
        } else {
          buttonManager.setButtonActive(false);
        }
      }
    } catch (error) {
      errorLog('lifecycle', 'Error loading options:', error);
      // Hide button on errors as a safe default
      buttonManager.initializeButton(false);
    }
  }

  /**
   * Setup state event listeners
   */
  private setupEventListeners(): void {
    // Panel visibility changed
    this.stateManager.on('panel:visibility-changed', (isVisible: boolean) => {
      debugLog('state', `Panel visibility changed: ${isVisible}`);

      if (isVisible) {
        const state = this.stateManager.getState();
        if (state.repoAnalysis) {
          panelManager.displayAnalysisPanel(state.repoAnalysis);
        }
      } else {
        panelManager.hideAnalysisPanel();
      }

      // Update toggle button
      buttonManager.setButtonActive(isVisible);
    });

    // Analysis completed
    this.stateManager.on('analysis:completed', (data: AnalysisResult) => {
      debugLog('state', 'Analysis completed, data received');

      // If panel should be visible, display it
      const state = this.stateManager.getState();
      if (state.isPanelVisible) {
        panelManager.displayAnalysisPanel(data);
      }
    });

    // Options changed
    this.stateManager.on('options:changed', (options: { showFloatingButton: boolean }) => {
      debugLog('state', 'Options changed:', options);
      buttonManager.initializeButton(options.showFloatingButton);
    });
  }

  /**
   * Toggle analysis panel visibility
   */
  private toggleAnalysisPanel(): void {
    const state = this.stateManager.getState();
    debugLog('ui', 'Toggle panel called, current visibility:', state.isPanelVisible);

    if (state.isPanelVisible) {
      // Hide panel
      this.stateManager.setPanelVisibility(false).catch(error => {
        errorLog('ui', 'Error hiding panel:', error);
        errorHandler.handleError(error as Error, 'ui');
      });
    } else if (state.repoAnalysis) {
      // Show panel with existing data
      this.stateManager.setPanelVisibility(true).catch(error => {
        errorLog('ui', 'Error showing panel:', error);
        errorHandler.handleError(error as Error, 'ui');
      });
    } else {
      // No analysis data, so analyze the repository
      this.analyzeRepository();
    }
  }
}

// Export the singleton instance
export const initializer = Initializer.getInstance();
