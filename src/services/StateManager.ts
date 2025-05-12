/**
 * StateManager
 *
 * Centralized state management and event system for the extension.
 * Provides reactive state across service worker lifecycle and components.
 */

import { AnalysisResult } from '@/interfaces/analysis.interface';
import { StateEventHandler, StateEventMap, StateEventType } from '@/interfaces/events.interface';
import { MessageService } from '@/services/MessageService';
import { debugLog, errorLog } from '@/utils/debug';

import { AppState, StorageService } from './StorageService';

/**
 * Batched update options for setState
 */
interface BatchOptions {
  /** Enable batch mode to reduce storage operations */
  batch?: boolean;
  /** Skip triggering events */
  skipEvents?: boolean;
  /** Skip notification to other contexts */
  skipNotification?: boolean;
}

/**
 * StateManager provides a centralized state store and event system
 * that works across the extension's context boundaries and survives
 * service worker termination.
 */
export class StateManager {
  private static instance: StateManager;
  private batchedUpdates: null | Partial<AppState> = null;
  private eventListeners: Map<StateEventType, Set<StateEventHandler<unknown>>>;
  private isBatching: boolean = false;
  private messageService: MessageService;
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
    this.messageService = MessageService.getInstance();

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
   * Begin a batch update
   * This allows multiple state changes to be combined into a single storage operation
   */
  public beginBatch(): void {
    if (this.isBatching) {
      debugLog('state', 'Already in batch mode, ignoring beginBatch call');
      return;
    }

    this.isBatching = true;
    this.batchedUpdates = {};
    debugLog('state', 'Batch update mode started');
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
   * Commit a batch update to storage
   */
  public async commitBatch(): Promise<void> {
    if (!this.isBatching || !this.batchedUpdates) {
      debugLog('state', 'No batch in progress, ignoring commitBatch call');
      return;
    }

    try {
      const updates = this.batchedUpdates;
      this.isBatching = false;
      this.batchedUpdates = null;

      debugLog('state', 'Committing batch update:', updates);

      // Apply updates to local state (storage watcher will handle events)
      await this.applyStateUpdates(updates);
    } catch (error) {
      this.isBatching = false;
      this.batchedUpdates = null;
      errorLog('state', 'Error committing batch update:', error);
      throw error;
    }
  }

  /**
   * Clean up resources
   */
  public destroy(): void {
    // Clean up any in-progress batch
    if (this.isBatching) {
      this.isBatching = false;
      this.batchedUpdates = null;
    }

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
    // If batching, combine with any pending updates
    if (this.isBatching && this.batchedUpdates) {
      return { ...this.state, ...this.batchedUpdates };
    }
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
   * Reset batch mode (discard any pending updates)
   */
  public resetBatch(): void {
    if (this.isBatching) {
      this.isBatching = false;
      this.batchedUpdates = null;
      debugLog('state', 'Batch update mode reset, updates discarded');
    }
  }

  /**
   * Save analysis result
   */
  public async saveAnalysisResult(result: AnalysisResult): Promise<void> {
    if (this.isBatching) {
      this.batchedUpdates = {
        ...this.batchedUpdates,
        hasAnalysisData: true,
        repoAnalysis: result,
      };
      return;
    }

    try {
      await StorageService.saveAnalysisResult(result);
      debugLog('state', 'Analysis result saved');

      // Notify other contexts
      try {
        await this.messageService.sendAnalysisComplete(result);
      } catch (error) {
        // Don't fail the operation if notification fails
        errorLog('state', 'Error notifying contexts of analysis completion:', error);
      }
    } catch (error) {
      errorLog('state', 'Error saving analysis result:', error);
      throw error;
    }
  }

  /**
   * Update panel visibility
   */
  public async setPanelVisibility(isVisible: boolean): Promise<void> {
    if (this.isBatching) {
      this.batchedUpdates = { ...this.batchedUpdates, isPanelVisible: isVisible };
      return;
    }

    try {
      await StorageService.updateUiState(isVisible);
      debugLog('state', `Panel visibility set to: ${isVisible}`);

      // Notify other contexts about the visibility change
      try {
        await this.messageService.updateState({ isPanelVisible: isVisible });
      } catch (error) {
        // Don't fail the operation if notification fails
        errorLog('state', 'Error notifying contexts of panel visibility change:', error);
      }
    } catch (error) {
      errorLog('state', 'Error updating panel visibility:', error);
      throw error;
    }
  }

  /**
   * Set multiple state properties at once
   */
  public async setState(updates: Partial<AppState>, options: BatchOptions = {}): Promise<void> {
    // If in batch mode, add to batched updates
    if (this.isBatching && !options.batch) {
      this.batchedUpdates = { ...this.batchedUpdates, ...updates };
      return;
    }

    try {
      await this.applyStateUpdates(updates, options);
    } catch (error) {
      errorLog('state', 'Error updating state:', error);
      throw error;
    }
  }

  /**
   * Apply state updates and handle events/notifications
   */
  private async applyStateUpdates(
    updates: Partial<AppState>,
    options: BatchOptions = {}
  ): Promise<void> {
    const oldState = { ...this.state };

    // Apply updates directly to storage
    if ('repoAnalysis' in updates && updates.repoAnalysis) {
      await StorageService.saveAnalysisResult(updates.repoAnalysis);
    }

    if ('isPanelVisible' in updates && updates.isPanelVisible !== undefined) {
      await StorageService.updateUiState(updates.isPanelVisible);
    }

    // Apply updates to local state
    this.state = { ...this.state, ...updates };

    // Notify other contexts if needed
    if (!options.skipNotification) {
      try {
        await this.messageService.updateState(updates);
      } catch (error) {
        errorLog('state', 'Error notifying contexts of state update:', error);
      }
    }

    // Emit events if needed
    if (!options.skipEvents) {
      // Handle visibility change event
      if ('isPanelVisible' in updates && oldState.isPanelVisible !== updates.isPanelVisible) {
        this.emit('panel:visibility-changed', updates.isPanelVisible);
      }

      // Handle analysis completed event
      if (
        'hasAnalysisData' in updates &&
        'repoAnalysis' in updates &&
        updates.hasAnalysisData &&
        updates.repoAnalysis
      ) {
        this.emit('analysis:completed', updates.repoAnalysis);
      }
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
      // Cast to Record<string, unknown> with a proper type assertion to avoid TypeScript error
      this.emit('options:changed', newOptions as unknown as Record<string, unknown>);
    });
  }
}
