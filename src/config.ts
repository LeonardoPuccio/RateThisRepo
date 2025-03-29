/**
 * Global configuration for the extension
 */

// This constant is injected by webpack's DefinePlugin
declare const __DEBUG__: boolean;

// Master debug switch - uses value from webpack
export const DEBUG_MODE = __DEBUG__;

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
