/**
 * Global configuration for the extension
 */

// Debug mode flag - can be overridden by environment
export const DEBUG_MODE = import.meta.env.DEV;

// Individual component debug settings
export const DEBUG_CONFIG = {
  ui: DEBUG_MODE,          // UI component debug logs
  analysis: DEBUG_MODE,    // Analysis debug logs  
  storage: DEBUG_MODE,     // Storage operation debug logs
  messaging: DEBUG_MODE    // Message passing debug logs
};

// Utility function for component-specific debug logging
export function debugLog(component: keyof typeof DEBUG_CONFIG, ...args: any[]): void {
  if (DEBUG_MODE && DEBUG_CONFIG[component]) {
    console.log(`[DEBUG:${component}]`, ...args);
  }
}

// Log debug status on initialization
console.log('[Config] Debug mode:', DEBUG_MODE ? 'ENABLED' : 'DISABLED');
