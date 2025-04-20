import { debugLog, errorLog, logUIState } from '@/utils/debug';

import { initializer } from './content/modules';

import '@/assets/tailwind.css';

/**
 * Content script entry point
 * - Matches GitHub repository pages
 * - Delegates to dedicated modules for specific functionality
 * - Provides clean teardown when script is invalidated
 */
export default defineContentScript({
  cssInjectionMode: 'ui',
  async main(ctx) {
    try {
      debugLog('lifecycle', 'Content script loaded', {
        ctxExists: !!ctx,
        url: window.location.href,
      });

      // Ensure context is available
      if (!ctx) {
        throw new Error('ContentScriptContext is undefined');
      }

      // Set context and initialize
      debugLog('lifecycle', 'Setting context and initializing extension');
      initializer.setContext(ctx);

      // Wait a moment to ensure DOM is fully loaded
      await new Promise(resolve => setTimeout(resolve, 50));

      // Initialize our components
      await initializer.initialize().catch(error => {
        errorLog('lifecycle', 'Initialization error:', error);
        throw error;
      });

      // Log UI state after initialization to verify visibility
      setTimeout(logUIState, 500);

      // Return cleanup function for WXT
      return () => {
        debugLog('lifecycle', 'Content script cleanup triggered');
        try {
          initializer.cleanup();
        } catch (error) {
          errorLog('lifecycle', 'Error during cleanup:', error);
        }
      };
    } catch (error) {
      // Log error at the highest level
      errorLog('lifecycle', 'Content script main error:', error);

      // Return cleanup function anyway
      return () => {
        try {
          initializer.cleanup();
        } catch (cleanupError) {
          errorLog('lifecycle', 'Error during cleanup after main failure:', cleanupError);
        }
      };
    }
  },

  matches: ['https://github.com/*/*'],
});
