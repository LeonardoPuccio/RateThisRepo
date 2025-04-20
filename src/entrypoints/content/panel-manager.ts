import { AnalysisResult } from '@/interfaces/analysis.interface';
import { AnalysisPanel } from '@/ui/components/AnalysisPanel';
import { debugLog, errorLog, logUIState } from '@/utils/debug';
import { type ContentScriptContext } from 'wxt/utils/content-script-context';

import { errorHandler } from './error-handler';

/**
 * PanelManager - Handles creation, updating and display of the analysis panel
 */
export class PanelManager {
  private static instance: PanelManager;
  private analysisPanel: AnalysisPanel | null = null;
  private ctx!: ContentScriptContext;

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the PanelManager
   */
  public static getInstance(): PanelManager {
    if (!PanelManager.instance) {
      PanelManager.instance = new PanelManager();
    }
    return PanelManager.instance;
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.removeAnalysisPanel();
  }

  /**
   * Display analysis panel with the provided data
   */
  public async displayAnalysisPanel(data: AnalysisResult): Promise<void> {
    try {
      // Create panel if it doesn't exist
      if (!this.analysisPanel) {
        debugLog('ui', 'Creating and initializing AnalysisPanel');
        this.analysisPanel = new AnalysisPanel(undefined, this.ctx);
        await this.analysisPanel.initialize();
        await this.analysisPanel.mount();
      }

      // Set data and show the panel
      this.analysisPanel.setData(data);
      this.analysisPanel.show();

      debugLog('ui', 'Analysis panel displayed successfully');

      // Log UI state after panel is displayed for debugging
      setTimeout(() => logUIState('panel-displayed'), 300);
    } catch (error) {
      errorLog('ui', 'Error displaying analysis panel:', error);
      errorHandler.handleError(error as Error, 'ui', {
        autoHideTimeout: 5000,
      });
      // Log UI state on error for debugging
      setTimeout(() => logUIState('panel-display-error'), 100);
    }
  }

  /**
   * Hide the analysis panel
   */
  public hideAnalysisPanel(): void {
    if (this.analysisPanel) {
      try {
        debugLog('ui', 'Hiding analysis panel');
        this.analysisPanel.hide();
        debugLog('ui', 'Analysis panel hidden');

        // Log UI state after panel is hidden for debugging
        setTimeout(() => logUIState('panel-hidden'), 300);
      } catch (error) {
        errorLog('ui', 'Error hiding analysis panel:', error);
        // Log UI state on error for debugging
        setTimeout(() => logUIState('panel-hide-error'), 100);
      }
    }
  }

  /**
   * Check if the panel is currently initialized
   */
  public isPanelInitialized(): boolean {
    return this.analysisPanel !== null;
  }

  /**
   * Remove the analysis panel completely
   */
  public removeAnalysisPanel(): void {
    if (this.analysisPanel) {
      try {
        debugLog('ui', 'Removing analysis panel');
        this.analysisPanel.remove();
        this.analysisPanel = null;
        debugLog('ui', 'Analysis panel removed');

        // Log UI state after panel is removed for debugging
        setTimeout(() => logUIState('panel-removed'), 100);
      } catch (error) {
        errorLog('ui', 'Error removing analysis panel:', error);
        // Log UI state on error for debugging
        setTimeout(() => logUIState('panel-remove-error'), 100);
      }
    }
  }

  /**
   * Set the context for the panel manager
   */
  public setContext(ctx: ContentScriptContext): void {
    this.ctx = ctx;
  }
}

// Export the singleton instance
export const panelManager = PanelManager.getInstance();
