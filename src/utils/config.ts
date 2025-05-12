/**
 * Global configuration for the extension
 */

// Debug mode flag - can be overridden by environment
export const DEBUG_MODE = import.meta.env.DEV;

// Individual component debug settings
export const DEBUG_CONFIG = {
  analysis: DEBUG_MODE, // Analysis debug logs
  background: DEBUG_MODE, // Background script general logs
  content: DEBUG_MODE, // Content script general logs
  lifecycle: DEBUG_MODE, // Service Worker lifecycle debug logs
  messaging: DEBUG_MODE, // Message passing debug logs
  performance: DEBUG_MODE, // Performance measurement logs
  popup: DEBUG_MODE, // Popup script debug logs
  state: DEBUG_MODE, // State management logs
  storage: DEBUG_MODE, // Storage operation debug logs
  ui: DEBUG_MODE, // UI component debug logs
};

// Log debug status on initialization only if debug mode is enabled
if (DEBUG_MODE) {
  // eslint-disable-next-line no-console
  console.log('[Config] Debug mode: ENABLED');
}
