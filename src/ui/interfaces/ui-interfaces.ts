/**
 * Centralized UI component interfaces for RateThisRepo
 * This file contains interfaces used by UI components
 */

/**
 * Interface for data returned by ToggleButton's onMount callback
 */
export interface ToggleButtonMountData {
  container: HTMLElement;
  button: HTMLButtonElement;
  tooltip: HTMLDivElement;
  buttonContainer: HTMLElement;
}

/**
 * Interface for data returned by AnalysisPanel's onMount callback
 */
export interface AnalysisPanelMountData {
  panelContainer: HTMLElement;
  contentContainer: HTMLElement;
}

/**
 * Interface for data returned by ErrorPanel's onMount callback
 */
export interface ErrorPanelMountData {
  container: HTMLElement;
  errorContainer: HTMLElement;
  errorTitle: HTMLElement;
  errorMessage: HTMLElement;
  closeButton: HTMLButtonElement;
}

/**
 * Interface for health indicator item
 */
export interface HealthIndicatorItem {
  name: string;
  value: string;
  status: boolean;
  tooltip?: string;
}

/**
 * Interface for collapsible card options
 */
export interface CollapsibleCardOptions {
  title: string;
  content: HTMLElement;
  icon: string;
  isCollapsedByDefault?: boolean;
}
