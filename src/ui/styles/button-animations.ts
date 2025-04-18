/**
 * Styling utilities for RateThisRepo
 * Centralized location for all styling constants and helpers
 */

// Main component classes - organized by type
export const COMPONENT_CLASSES = {
  // Base classes
  CONTAINER: 'rtr-component',
  BUTTON_CONTAINER: 'rtr-button-container',
  
  // Button states
  BUTTON_ACTIVE: 'rtr-button-active',
  BUTTON_DEFAULT: 'rtr-button-default',
  
  // Tooltip
  TOOLTIP: 'rtr-tooltip',
  TOOLTIP_VISIBLE: 'visible',
  
  // Status classes for text
  SUCCESS: 'rtr-success',
  WARNING: 'rtr-warning',
  ERROR: 'rtr-error',
  
  // Background variants
  BG_SUCCESS: 'rtr-bg-success',
  BG_WARNING: 'rtr-bg-warning',
  BG_ERROR: 'rtr-bg-error',
  
  // Light background variants
  BG_SUCCESS_LIGHT: 'rtr-bg-success-light',
  BG_WARNING_LIGHT: 'rtr-bg-warning-light',
  BG_ERROR_LIGHT: 'rtr-bg-error-light',
  
  // Border variants
  BORDER_SUCCESS: 'rtr-border-success',
  BORDER_WARNING: 'rtr-border-warning',
  BORDER_ERROR: 'rtr-border-error',
  
  // Custom elements
  BAR: 'rtr-bar',
  SCORE_CIRCLE: 'rtr-score-circle',
  INDICATOR: 'rtr-indicator',
  
  // Animation
  ANIMATE_PULSE: 'rtr-animate-pulse'
};

// For backward compatibility with existing code
export const BUTTON_CLASSES = {
  ACTIVE: COMPONENT_CLASSES.BUTTON_ACTIVE,
  DEFAULT: COMPONENT_CLASSES.BUTTON_DEFAULT,
  TOOLTIP: COMPONENT_CLASSES.TOOLTIP,
  TOOLTIP_VISIBLE: COMPONENT_CLASSES.TOOLTIP_VISIBLE,
  CONTAINER: COMPONENT_CLASSES.BUTTON_CONTAINER,
  COMPONENT: COMPONENT_CLASSES.CONTAINER
};

/**
 * Get a status-based class based on a numerical value
 * @param value The numerical value to evaluate (0-100)
 * @param type The type of style class to return (text, bg, bg-light, border)
 * @returns The appropriate CSS class
 */
export function getStatusClass(value: number, type: 'text' | 'bg' | 'bg-light' | 'border' = 'text'): string {
  const status = value >= 80 ? 'success' : value >= 60 ? 'warning' : 'error';
  
  switch (type) {
    case 'bg':
      return `rtr-bg-${status}`;
    case 'bg-light':
      return `rtr-bg-${status}-light`;
    case 'border':
      return `rtr-border-${status}`;
    default:
      return `rtr-${status}`;
  }
}

/**
 * Get appropriate status classes for a component based on a score
 * @param score Score value (0-100)
 * @param elementType The type of element ('bar', 'indicator', 'score-circle', etc.)
 * @returns Class string to apply
 */
export function getStatusClassesForElement(score: number, elementType: string): string {
  const status = score >= 80 ? 'success' : score >= 60 ? 'warning' : 'error';
  
  switch (elementType) {
    case 'bar':
      return `${COMPONENT_CLASSES.BAR} ${status}`;
    case 'score-circle':
      return `${COMPONENT_CLASSES.SCORE_CIRCLE} ${status}`;
    case 'indicator':
      return `${COMPONENT_CLASSES.INDICATOR} ${status}`;
    default:
      return status;
  }
}

/**
 * Combine Tailwind utility classes with our custom classes
 * @param tailwindClasses Array of Tailwind utility classes
 * @param customClasses Array of our custom rtr- classes
 * @returns Combined class string
 */
export function combineClasses(tailwindClasses: string[], customClasses: string[]): string {
  return [...tailwindClasses, ...customClasses].join(' ');
}
