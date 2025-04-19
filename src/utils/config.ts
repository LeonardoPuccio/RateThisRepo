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
  state: DEBUG_MODE, // State management logs
  storage: DEBUG_MODE, // Storage operation debug logs
  ui: DEBUG_MODE, // UI component debug logs
};

// Utility function for component-specific debug logging
export function debugLog(component: keyof typeof DEBUG_CONFIG, ...args: any[]): void {
  if (DEBUG_MODE && DEBUG_CONFIG[component]) {
    console.log(`[DEBUG:${component}]`, ...args);
  }
}

export function errorLog(component: keyof typeof DEBUG_CONFIG, ...args: any[]): void {
  // Always log errors, regardless of DEBUG_MODE
  console.error(`[ERROR:${component}]`, ...args);
}

// Log debug status on initialization
console.log('[Config] Debug mode:', DEBUG_MODE ? 'ENABLED' : 'DISABLED');
