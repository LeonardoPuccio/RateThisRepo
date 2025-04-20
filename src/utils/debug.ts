/**
 * Debug utilities for the extension
 */

import { DEBUG_CONFIG, DEBUG_MODE } from './config';

/**
 * Debug logging with component context
 */
export function debugLog(component: keyof typeof DEBUG_CONFIG, ...args: any[]): void {
  if (DEBUG_MODE && DEBUG_CONFIG[component]) {
    // eslint-disable-next-line no-console
    console.log(`[DEBUG:${component}]`, ...args);
  }
}

/**
 * Error logging with component context
 * Always logs regardless of debug mode
 */
export function errorLog(component: keyof typeof DEBUG_CONFIG, ...args: any[]): void {
  // Always log errors, regardless of DEBUG_MODE
  console.error(`[ERROR:${component}]`, ...args);
}

/**
 * Logs performance information for debugging slow operations
 * @param operation Name of the operation being measured
 * @param startTime Start time from performance.now()
 */
export function logPerformance(operation: string, startTime: number): void {
  if (!DEBUG_CONFIG.performance) {
    return;
  }

  const duration = performance.now() - startTime;
  debugLog('performance', `Operation: ${operation}`, {
    durationMs: duration.toFixed(2),
    timestamp: new Date().toISOString(),
  });
}

/**
 * Import the button classes for UI state logging
 */
import { BUTTON_CLASSES } from '@/ui/styles/button-animations';

/**
 * Logs the current UI state to help debug visibility issues
 * @param context Optional context information for the log entry
 */
export function logUIState(context: string = 'general'): void {
  if (!DEBUG_CONFIG.ui) {
    return;
  }

  // Check button state
  const buttonHost = document.querySelector('repo-evaluator-button');
  const buttonVisible = buttonHost ? window.getComputedStyle(buttonHost).display !== 'none' : false;

  // Check panel state
  const panelHost = document.querySelector('repo-evaluator-panel');
  const panelVisible = panelHost ? window.getComputedStyle(panelHost).display !== 'none' : false;

  // Get more detailed button information
  const buttonShadowRoot = buttonHost ? buttonHost.shadowRoot : null;
  const buttonContainer = buttonShadowRoot?.querySelector(`.${BUTTON_CLASSES?.CONTAINER}`) || null;
  const buttonElement = buttonShadowRoot?.querySelector('button') || null;
  const buttonActive = buttonElement?.classList.contains(BUTTON_CLASSES?.ACTIVE) || false;

  // Get detailed panel information if visible
  const panelShadowRoot = panelHost ? panelHost.shadowRoot : null;
  const panelMainElement = panelShadowRoot?.querySelector('.analysis-panel') || null;

  debugLog('ui', `UI State [${context}]`, {
    // DOM structure
    bodyChildCount: document.body.childElementCount,
    buttonActive,

    buttonContainerExists: !!buttonContainer,
    buttonElementExists: !!buttonElement,
    // Button info
    buttonExists: !!buttonHost,
    buttonVisible,
    devicePixelRatio: window.devicePixelRatio,

    panelElementExists: !!panelMainElement,
    // Panel info
    panelExists: !!panelHost,
    panelVisible,

    shadowComponents: document.querySelectorAll('*[data-wxt-shadow-host]').length,
    // Environment
    url: window.location.href,
    viewportHeight: window.innerHeight,
    viewportWidth: window.innerWidth,
  });
}
