/**
 * Styling utilities for RateThisRepo
 * Centralized location for all styling constants and helpers
 */

// Main component classes - organized by type
export const COMPONENT_CLASSES = {
  // Animation
  ANIMATE_PULSE: 'rtr-animate-pulse',
  // Custom elements
  BAR: 'rtr-bar',

  BG_ERROR: 'rtr-bg-error',
  BG_ERROR_LIGHT: 'rtr-bg-error-light',

  // Background variants
  BG_SUCCESS: 'rtr-bg-success',
  // Light background variants
  BG_SUCCESS_LIGHT: 'rtr-bg-success-light',

  BG_WARNING: 'rtr-bg-warning',
  BG_WARNING_LIGHT: 'rtr-bg-warning-light',
  BORDER_ERROR: 'rtr-border-error',

  // Border variants
  BORDER_SUCCESS: 'rtr-border-success',
  BORDER_WARNING: 'rtr-border-warning',
  // Button states
  BUTTON_ACTIVE: 'rtr-button-active',

  BUTTON_CONTAINER: 'rtr-button-container',
  BUTTON_DEFAULT: 'rtr-button-default',
  // Base classes
  CONTAINER: 'rtr-component',

  ERROR: 'rtr-error',
  INDICATOR: 'rtr-indicator',
  SCORE_CIRCLE: 'rtr-score-circle',

  // Status classes for text
  SUCCESS: 'rtr-success',
  // Tooltip
  TOOLTIP: 'rtr-tooltip',

  WARNING: 'rtr-warning',
};

// For backward compatibility with existing code
export const BUTTON_CLASSES = {
  ACTIVE: COMPONENT_CLASSES.BUTTON_ACTIVE,
  COMPONENT: COMPONENT_CLASSES.CONTAINER,
  CONTAINER: COMPONENT_CLASSES.BUTTON_CONTAINER,
  DEFAULT: COMPONENT_CLASSES.BUTTON_DEFAULT,
  TOOLTIP: COMPONENT_CLASSES.TOOLTIP,
};

/**
 * Combine Tailwind utility classes with our custom classes
 * @param tailwindClasses Array of Tailwind utility classes
 * @param customClasses Array of our custom rtr- classes
 * @returns Combined class string
 */
export function combineClasses(tailwindClasses: string[], customClasses: string[]): string {
  return [...tailwindClasses, ...customClasses].join(' ');
}

/**
 * Get a status-based class based on a numerical value
 * @param value The numerical value to evaluate (0-100)
 * @param type The type of style class to return (text, bg, bg-light, border)
 * @returns The appropriate CSS class
 */
export function getStatusClass(
  value: number,
  type: 'bg' | 'bg-light' | 'border' | 'text' = 'text'
): string {
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
    case 'indicator':
      return `${COMPONENT_CLASSES.INDICATOR} ${status}`;
    case 'score-circle':
      return `${COMPONENT_CLASSES.SCORE_CIRCLE} ${status}`;
    default:
      return status;
  }
}
