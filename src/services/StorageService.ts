/**
 * StorageService
 *
 * A service for managing browser storage operations with built-in error handling,
 * type safety, and support for MV3 service worker lifecycle.
 */

import { storage } from '#imports';
import { AnalysisResult } from '@/interfaces/analysis.interface';
import { debugLog, errorLog } from '@/utils/debug';

/**
 * Define the app state structure
 */
export interface AppState {
  hasAnalysisData: boolean;
  isPanelVisible: boolean;
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
 * Options type definition
 */
export interface ExtensionOptions {
  showFloatingButton: boolean;
}

/**
 * StorageService class that provides a clean API for storage operations
 */
export class StorageService {
  /**
   * Clear all storage (useful for debugging/testing)
   */
  public static async clearAllStorage(): Promise<void> {
    try {
      debugLog('storage', 'Clearing all storage');
      await Promise.all([storage.clear('local'), storage.clear('sync')]);
    } catch (error) {
      errorLog('storage', 'Error clearing all storage:', error);
      throw new Error(`Failed to clear all storage: ${(error as Error).message}`);
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
        { item: hasAnalysisDataItem, value: false },
      ]);
    } catch (error) {
      errorLog('storage', 'Error clearing analysis data from storage:', error);
      throw new Error(`Failed to clear analysis data: ${(error as Error).message}`);
    }
  }

  /**
   * Get the user options
   */
  public static async getOptions(): Promise<ExtensionOptions> {
    try {
      const showFloatingButton = await showFloatingButtonItem.getValue();
      return { showFloatingButton };
    } catch (error) {
      errorLog('storage', 'Error retrieving options from storage:', error);
      return { showFloatingButton: true }; // Default value
    }
  }

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
        hasAnalysisData,
        isPanelVisible,
        repoAnalysis,
      };
    } catch (error) {
      errorLog('storage', 'Error retrieving state from storage:', error);
      // Return default state in case of error
      return {
        hasAnalysisData: false,
        isPanelVisible: false,
        repoAnalysis: null,
      };
    }
  }

  /**
   * Check if analysis data exists
   */
  public static async hasAnalysisData(): Promise<boolean> {
    try {
      return await hasAnalysisDataItem.getValue();
    } catch (error) {
      errorLog('storage', 'Error checking if analysis data exists:', error);
      return false;
    }
  }

  /**
   * Check if panel is visible
   */
  public static async isPanelVisible(): Promise<boolean> {
    try {
      return await panelVisibleItem.getValue();
    } catch (error) {
      errorLog('storage', 'Error checking if panel is visible:', error);
      return false;
    }
  }

  /**
   * Update the analysis data in storage
   */
  public static async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    if (!result) {
      errorLog('storage', 'Attempted to save null analysis result');
      throw new Error('Cannot save null analysis result');
    }

    try {
      debugLog('storage', 'Saving analysis result to storage');
      await storage.setItems([
        { item: repoAnalysisItem, value: result },
        { item: hasAnalysisDataItem, value: true },
      ]);
    } catch (error) {
      errorLog('storage', 'Error saving analysis result to storage:', error);
      throw new Error(`Failed to save analysis result: ${(error as Error).message}`);
    }
  }

  /**
   * Save the entire app state at once
   */
  public static async saveState(state: AppState): Promise<void> {
    try {
      debugLog('storage', 'Saving entire app state', state);

      const items = [];

      if (state.isPanelVisible !== undefined) {
        items.push({ item: panelVisibleItem, value: state.isPanelVisible });
      }

      if (state.hasAnalysisData !== undefined) {
        items.push({ item: hasAnalysisDataItem, value: state.hasAnalysisData });
      }

      if (state.repoAnalysis !== undefined) {
        items.push({ item: repoAnalysisItem, value: state.repoAnalysis });
      }

      await storage.setItems(items);
    } catch (error) {
      errorLog('storage', 'Error saving app state to storage:', error);
      throw new Error(`Failed to save app state: ${(error as Error).message}`);
    }
  }

  /**
   * Update user options
   */
  public static async updateOptions(options: Partial<ExtensionOptions>): Promise<void> {
    try {
      const items = [];

      if (options.showFloatingButton !== undefined) {
        debugLog('storage', `Updating showFloatingButton option to: ${options.showFloatingButton}`);
        items.push({ item: showFloatingButtonItem, value: options.showFloatingButton });
      }

      if (items.length > 0) {
        await storage.setItems(items);
      }
    } catch (error) {
      errorLog('storage', 'Error updating options in storage:', error);
      throw new Error(`Failed to update options: ${(error as Error).message}`);
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
      throw new Error(`Failed to update UI state: ${(error as Error).message}`);
    }
  }

  /**
   * Watch for changes to options
   */
  public static watchOptions(callback: (options: ExtensionOptions) => void): () => void {
    debugLog('storage', 'Setting up options watcher');

    const unwatchButton = showFloatingButtonItem.watch(value => {
      try {
        callback({ showFloatingButton: value });
      } catch (error) {
        errorLog('storage', 'Error in options watcher callback:', error);
      }
    });

    return () => {
      debugLog('storage', 'Removing options watcher');
      unwatchButton();
    };
  }

  /**
   * Watch for changes to the app state
   */
  public static watchState(callback: (state: AppState) => void): () => void {
    debugLog('storage', 'Setting up state watchers');

    // Create a function to get the full state and call the callback
    const handleChange = async () => {
      try {
        const state = await this.getState();
        callback(state);
      } catch (error) {
        errorLog('storage', 'Error in state watcher callback:', error);
      }
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
}
