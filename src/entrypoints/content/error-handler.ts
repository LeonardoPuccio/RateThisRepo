import { ErrorPanelMountData } from '@/ui/interfaces/ui-interfaces';
import { BUTTON_CLASSES } from '@/ui/styles/button-animations';
import { type DEBUG_CONFIG, errorLog } from '@/utils/config';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root';

export interface ErrorOptions {
  autoHideTimeout?: number;
  position?: {
    right?: string;
    top?: string;
  };
}

const DEFAULT_OPTIONS: ErrorOptions = {
  autoHideTimeout: 10000, // 10 seconds
  position: {
    right: '20px',
    top: '20px',
  },
};

/**
 * ErrorHandler - Handles error display and logging with Shadow DOM encapsulation
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private ctx!: ContentScriptContext;

  private constructor() {
    // Private constructor to enforce singleton
  }

  /**
   * Get the singleton instance of the ErrorHandler
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Log and display an error
   */
  public async handleError(
    error: Error,
    context: keyof typeof DEBUG_CONFIG,
    options: ErrorOptions = {}
  ): Promise<void> {
    // Always log the error
    errorLog(context, error.message, error);

    // Display the error using Shadow DOM
    await this.displayError(error, context, options);
  }

  /**
   * Set the context for the error handler
   */
  public setContext(ctx: ContentScriptContext): void {
    this.ctx = ctx;
  }

  /**
   * Display an error panel using Shadow DOM
   */
  private async displayError(error: Error, context: string, options: ErrorOptions): Promise<void> {
    if (!this.ctx) {
      console.error('ErrorHandler: Context not set, cannot display error UI');
      return;
    }

    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    try {
      // Create overlay for the error panel within Shadow DOM
      const errorUi = await createShadowRootUi<ErrorPanelMountData>(this.ctx, {
        anchor: 'body',
        mode: 'open',
        name: 'repo-evaluator-error',
        onMount: (container, shadow, shadowHost) => {
          // Add component base class
          container.classList.add(BUTTON_CLASSES.COMPONENT);

          // Style the host element directly
          shadowHost.style.position = 'fixed';
          shadowHost.style.top = mergedOptions.position?.top || '20px';
          shadowHost.style.right = mergedOptions.position?.right || '20px';
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
          errorMessage.textContent = `Failed to analyze repository: ${error.message}`;

          // Create close button
          const closeButton = document.createElement('button');
          closeButton.className =
            'px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors';
          closeButton.textContent = 'Close';

          // Add event listener for close button
          closeButton.addEventListener('click', () => {
            errorUi.remove();
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
            closeButton,
            container,
            errorContainer,
            errorMessage,
            errorTitle,
          };
        },
        position: 'inline',
      });

      // Mount the error UI using WXT's mount method
      errorUi.mount();

      // Auto-remove after the specified timeout
      if (mergedOptions.autoHideTimeout) {
        setTimeout(() => {
          errorUi.remove();
        }, mergedOptions.autoHideTimeout);
      }
    } catch (uiError) {
      // Fallback to simple error notification if shadow DOM fails
      errorLog('ui', 'Error creating error UI:', uiError);
      console.error(`Error in ${context}: ${error.message}`);
    }
  }
}

// Export the singleton instance
export const errorHandler = ErrorHandler.getInstance();
