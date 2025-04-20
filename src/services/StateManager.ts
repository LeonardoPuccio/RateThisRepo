/**
 * StateManager
 *
 * Centralized state management and event system for the extension.
 * Provides reactive state across service worker lifecycle and components.
 */

import { AnalysisResult } from '@/interfaces/analysis.interface';
import { StateEventHandler, StateEventMap, StateEventType } from '@/interfaces/events.interface';
import { debugLog, errorLog } from '@/utils/debug';

import { AppState, StorageService } from './StorageService';

/**
 * StateManager provides a centralized state store and event system
 * that works across the extension's context boundaries and survives
 * service worker termination.
 */
export class StateManager {
  private static instance: StateManager;
  private eventListeners: Map<StateEventType, Set<StateEventHandler<unknown>>>;
  private state: AppState;
  private unwatchOptionsCallback: (() => void) | null = null;
  private unwatchStateCallback: (() => void) | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    // Initialize with default state
    this.state = {
      hasAnalysisData: false,
      isPanelVisible: false,
      repoAnalysis: null,
    };

    this.eventListeners = new Map();

    // Set up storage watching
    this.setupStorageWatching();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): StateManager {
    if (!StateManager.instance) {
      StateManager.instance = new StateManager();
    }
    return StateManager.instance;
  }

  /**
   * Clear analysis data
   */
  public async clearAnalysisData(): Promise<void> {
    try {
      await StorageService.clearAnalysisData();
      debugLog('state', 'Analysis data cleared');
      // Note: We don't update the local state directly because
      // the storage watcher will do that and emit events
    } catch (error) {
      errorLog('state', 'Error clearing analysis data:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    if (this.unwatchStateCallback) {
      this.unwatchStateCallback();
      this.unwatchStateCallback = null;
    }

    if (this.unwatchOptionsCallback) {
      this.unwatchOptionsCallback();
      this.unwatchOptionsCallback = null;
    }

    this.eventListeners.clear();
    debugLog('state', 'StateManager destroyed and resources cleaned up');
  }

  /**
   * Emit an event with appropriate data
   */
  public emit<T extends StateEventType>(event: T, data?: StateEventMap[T]): void {
    debugLog('state', `Event emitted: ${event}`, data);

    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      if (handlers) {
        for (const handler of handlers) {
          try {
            handler(data);
          } catch (error) {
            errorLog('state', `Error in ${event} event handler:`, error);
          }
        }
      }
    }
  }

  /**
   * Get the current state
   */
  public getState(): AppState {
    return { ...this.state };
  }

  /**
   * Initialize the state manager
   */
  public async initialize(): Promise<void> {
    try {
      // Load initial state from storage
      this.state = await StorageService.getState();
      debugLog('state', 'StateManager initialized with state:', this.state);
    } catch (error) {
      errorLog('state', 'Error initializing StateManager:', error);
      // We're still continuing with default state in this case
    }
  }

  /**
   * Notify about analysis error
   */
  public notifyAnalysisError(error: Error): void {
    this.emit('analysis:error', error);
  }

  /**
   * Notify that analysis has started
   */
  public notifyAnalysisStarted(): void {
    this.emit('analysis:started');
  }

  /**
   * Remove an event listener
   */
  public off<T extends StateEventType>(
    event: T,
    handler: StateEventHandler<StateEventMap[T]>
  ): void {
    if (this.eventListeners.has(event)) {
      const handlers = this.eventListeners.get(event);
      if (handlers) {
        handlers.delete(handler as StateEventHandler<unknown>);
        debugLog('state', `Event listener removed for: ${event}`);
      }
    }
  }

  /**
   * Add an event listener
   */
  public on<T extends StateEventType>(
    event: T,
    handler: StateEventHandler<StateEventMap[T]>
  ): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }

    const handlers = this.eventListeners.get(event);
    if (handlers) {
      handlers.add(handler as StateEventHandler<unknown>);
      debugLog('state', `Event listener added for: ${event}`);
    }
  }

  /**
   * Save analysis result
   */
  public async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    try {
      await StorageService.saveAnalysisResult(result);
      debugLog('state', 'Analysis result saved');
      // Note: We don't update the local state directly because
      // the storage watcher will do that and emit the event
    } catch (error) {
      errorLog('state', 'Error saving analysis result:', error);
      throw error;
    }
  }

  /**
   * Update panel visibility
   */
  public async setPanelVisibility(isVisible: boolean): Promise<void> {
    try {
      await StorageService.updateUiState(isVisible);
      debugLog('state', `Panel visibility set to: ${isVisible}`);
      // Note: We don't update the local state directly because
      // the storage watcher will do that and emit the event
    } catch (error) {
      errorLog('state', 'Error updating panel visibility:', error);
      throw error;
    }
  }

  /**
   * Setup watchers for storage changes
   */
  private setupStorageWatching(): void {
    // Clean up any existing watchers
    if (this.unwatchStateCallback) {
      this.unwatchStateCallback();
    }

    if (this.unwatchOptionsCallback) {
      this.unwatchOptionsCallback();
    }

    // Watch for state changes in storage
    this.unwatchStateCallback = StorageService.watchState(newState => {
      const oldState = { ...this.state };
      this.state = newState;

      // Fire events for changed properties
      if (oldState.isPanelVisible !== newState.isPanelVisible) {
        this.emit('panel:visibility-changed', newState.isPanelVisible);
      }

      if (!oldState.hasAnalysisData && newState.hasAnalysisData) {
        this.emit('analysis:completed', newState.repoAnalysis as AnalysisResult);
      }
    });

    // Watch for options changes
    this.unwatchOptionsCallback = StorageService.watchOptions(newOptions => {
      this.emit('options:changed', newOptions as Record<string, unknown>);
    });
  }
}
