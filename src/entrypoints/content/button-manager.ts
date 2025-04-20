import { ToggleButton } from '@/ui/components/ToggleButton';
import { debugLog, errorLog, logUIState } from '@/utils/debug';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

import { errorHandler } from './error-handler';

/**
 * ButtonManager - Handles creation and management of toggle button
 */
export class ButtonManager {
  private static instance: ButtonManager;
  private ctx!: ContentScriptContext;
  private toggleButton: null | ToggleButton = null;
  private toggleCallback: (() => void) | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the ButtonManager
   */
  public static getInstance(): ButtonManager {
    if (!ButtonManager.instance) {
      ButtonManager.instance = new ButtonManager();
    }
    return ButtonManager.instance;
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    this.removeButton();
  }

  /**
   * Initialize the toggle button
   */
  public async initializeButton(show: boolean = true): Promise<void> {
    if (!show) {
      debugLog('ui', 'Toggle button initialization skipped (show=false)');
      this.removeButton();
      return;
    }

    try {
      // Only create button if it doesn't exist
      if (!this.toggleButton) {
        if (!this.toggleCallback) {
          errorLog('ui', 'Toggle callback not set during button initialization');
          throw new Error('Toggle callback not set');
        }

        debugLog('ui', 'Creating new ToggleButton instance');
        this.toggleButton = new ToggleButton(this.toggleCallback, this.ctx);
        await this.toggleButton.initialize();
        await this.toggleButton.mount();

        debugLog('ui', 'Toggle button initialized successfully');
        // Log UI state after button initialization for debugging
        setTimeout(() => logUIState('button-initialized'), 100);
      }
    } catch (error) {
      errorLog('ui', 'Error initializing toggle button:', error);
      errorHandler.handleError(error as Error, 'ui', {
        autoHideTimeout: 5000,
      });
      // Log UI state after error for debugging
      setTimeout(() => logUIState('button-init-error'), 100);
    }
  }

  /**
   * Check if button is currently initialized
   */
  public isButtonInitialized(): boolean {
    return this.toggleButton !== null;
  }

  /**
   * Remove the toggle button
   */
  public removeButton(): void {
    if (this.toggleButton) {
      try {
        debugLog('ui', 'Removing toggle button');
        this.toggleButton.remove();
        this.toggleButton = null;
        debugLog('ui', 'Toggle button removed');
        // Log UI state after button removal for debugging
        setTimeout(() => logUIState('button-manager-removed'), 100);
      } catch (error) {
        errorLog('ui', 'Error removing toggle button:', error);
        // Log UI state after error for debugging
        setTimeout(() => logUIState('button-remove-error'), 100);
      }
    }
  }

  /**
   * Update toggle button state
   */
  public setButtonActive(active: boolean): void {
    if (this.toggleButton) {
      try {
        debugLog('ui', `Setting toggle button active state to: ${active}`);
        this.toggleButton.setActive(active);
        // UI state is logged inside the ToggleButton.setActive method
      } catch (error) {
        errorLog('ui', 'Error setting button state:', error);
        // Log UI state after error for debugging
        setTimeout(() => logUIState('button-state-error'), 100);
      }
    } else {
      errorLog('ui', 'Attempted to set button state, but button is not initialized');
    }
  }

  /**
   * Set the context for the button manager
   */
  public setContext(ctx: ContentScriptContext): void {
    this.ctx = ctx;
  }

  /**
   * Set the toggle callback function
   */
  public setToggleCallback(callback: () => void): void {
    this.toggleCallback = callback;
  }
}

// Export the singleton instance
export const buttonManager = ButtonManager.getInstance();
