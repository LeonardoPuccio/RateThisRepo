/**
 * StorageService
 * 
 * A service for managing browser storage operations with built-in error handling,
 * type safety, and support for MV3 service worker lifecycle.
 */

import { STORAGE_KEYS } from '@utils/constants';
import { storage } from '#imports';
import { AnalysisResult } from '@interfaces/analysis.interface';
import { errorLog, debugLog } from '@utils/config';

/**
 * Define the app state structure
 */
export interface AppState {
  isPanelVisible: boolean;
  hasAnalysisData: boolean;
  repoAnalysis: AnalysisResult | null;
}

/**
 * Define storage items with proper typing
 */
export const panelVisibleItem = storage.defineItem<boolean>('local:panelVisible', {
  fallback: false,
});

export const hasAnalysisDataItem = storage.defineItem<boolean>('local:hasAnalysisData', {
  fallback: false,
});

export const repoAnalysisItem = storage.defineItem<AnalysisResult | null>('local:repoAnalysis', {
  fallback: null,
});

/**
 * Options storage items
 */
export const showFloatingButtonItem = storage.defineItem<boolean>('sync:showFloatingButton', {
  fallback: true,
});

/**
 * StorageService class that provides a clean API for storage operations
 */
export class StorageService {
  /**
   * Get the current state from storage
   */
  public static async getState(): Promise<AppState> {
    try {
      const [isPanelVisible, hasAnalysisData, repoAnalysis] = await Promise.all([
        panelVisibleItem.getValue(),
        hasAnalysisDataItem.getValue(),
        repoAnalysisItem.getValue(),
      ]);

      return {
        isPanelVisible,
        hasAnalysisData,
        repoAnalysis,
      };
    } catch (error) {
      errorLog('storage', 'Error retrieving state from storage:', error);
      // Return default state in case of error
      return {
        isPanelVisible: false,
        hasAnalysisData: false,
        repoAnalysis: null,
      };
    }
  }

  /**
   * Update the UI state in storage
   */
  public static async updateUiState(isPanelVisible: boolean): Promise<void> {
    try {
      await panelVisibleItem.setValue(isPanelVisible);
    } catch (error) {
      errorLog('storage', 'Error updating UI state in storage:', error);
      throw error;
    }
  }

  /**
   * Update the analysis data in storage
   */
  public static async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    try {
      debugLog('storage', 'Saving analysis result to storage');
      await storage.setItems([
        { item: repoAnalysisItem, value: result },
        { item: hasAnalysisDataItem, value: true }
      ]);
    } catch (error) {
      errorLog('storage', 'Error saving analysis result to storage:', error);
      throw error;
    }
  }

  /**
   * Clear analysis data from storage
   */
  public static async clearAnalysisData(): Promise<void> {
    try {
      debugLog('storage', 'Clearing analysis data from storage');
      await storage.setItems([
        { item: repoAnalysisItem, value: null },
        { item: hasAnalysisDataItem, value: false }
      ]);
    } catch (error) {
      errorLog('storage', 'Error clearing analysis data from storage:', error);
      throw error;
    }
  }

  /**
   * Get the user options
   */
  public static async getOptions(): Promise<{ showFloatingButton: boolean }> {
    try {
      const showFloatingButton = await showFloatingButtonItem.getValue();
      return { showFloatingButton };
    } catch (error) {
      errorLog('storage', 'Error retrieving options from storage:', error);
      return { showFloatingButton: true }; // Default value
    }
  }

  /**
   * Update user options
   */
  public static async updateOptions(options: Partial<{ showFloatingButton: boolean }>): Promise<void> {
    try {
      if (options.showFloatingButton !== undefined) {
        debugLog('storage', `Updating showFloatingButton option to: ${options.showFloatingButton}`);
        await showFloatingButtonItem.setValue(options.showFloatingButton);
      }
    } catch (error) {
      errorLog('storage', 'Error updating options in storage:', error);
      throw error;
    }
  }

  /**
   * Watch for changes to the app state
   */
  public static watchState(callback: (state: AppState) => void): () => void {
    debugLog('storage', 'Setting up state watchers');
    
    // Create a function to get the full state and call the callback
    const handleChange = async () => {
      const state = await this.getState();
      callback(state);
    };
    
    // Set up watchers for each part of the state
    const unwatchPanel = panelVisibleItem.watch(() => handleChange());
    const unwatchHasData = hasAnalysisDataItem.watch(() => handleChange());
    const unwatchRepo = repoAnalysisItem.watch(() => handleChange());
    
    // Return a function that calls all unwatch functions
    return () => {
      debugLog('storage', 'Removing state watchers');
      unwatchPanel();
      unwatchHasData();
      unwatchRepo();
    };
  }

  /**
   * Watch for changes to options
   */
  public static watchOptions(callback: (options: { showFloatingButton: boolean }) => void): () => void {
    debugLog('storage', 'Setting up options watcher');
    
    const unwatchButton = showFloatingButtonItem.watch((value) => {
      callback({ showFloatingButton: value });
    });
    
    return () => {
      debugLog('storage', 'Removing options watcher');
      unwatchButton();
    };
  }
}
