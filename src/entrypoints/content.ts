import { debugLog } from '@/utils/config';

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
    debugLog('lifecycle', 'Content script loaded');

    // Set context and initialize
    initializer.setContext(ctx);
    await initializer.initialize();

    // Return cleanup function for WXT
    return () => {
      initializer.cleanup();
    };
  },

  matches: ['https://github.com/*/*'],
});
