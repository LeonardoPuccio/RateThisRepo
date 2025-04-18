import { ToggleButton } from '@/ui/components/ToggleButton';
import { debugLog, errorLog } from '@/utils/config';
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
      this.removeButton();
      return;
    }

    try {
      // Only create button if it doesn't exist
      if (!this.toggleButton) {
        if (!this.toggleCallback) {
          throw new Error('Toggle callback not set');
        }

        this.toggleButton = new ToggleButton(this.toggleCallback, this.ctx);
        await this.toggleButton.initialize();
        await this.toggleButton.mount();

        debugLog('ui', 'Toggle button initialized successfully');
      }
    } catch (error) {
      errorHandler.handleError(error as Error, 'ui', {
        autoHideTimeout: 5000,
      });
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
        this.toggleButton.remove();
        this.toggleButton = null;
        debugLog('ui', 'Toggle button removed');
      } catch (error) {
        errorLog('ui', 'Error removing toggle button:', error);
      }
    }
  }

  /**
   * Update toggle button state
   */
  public setButtonActive(active: boolean): void {
    if (this.toggleButton) {
      try {
        this.toggleButton.setActive(active);
        debugLog('ui', `Toggle button active state set to: ${active}`);
      } catch (error) {
        errorLog('ui', 'Error setting button state:', error);
      }
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
