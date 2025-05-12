/**
 * Centralized UI component interfaces for RateThisRepo
 * This file contains interfaces used by UI components
 */

/**
 * Interface for data returned by AnalysisPanel's onMount callback
 */
export interface AnalysisPanelMountData {
  contentContainer: HTMLElement;
  panelContainer: HTMLElement;
}

/**
 * Interface for collapsible card options
 */
export interface CollapsibleCardOptions {
  content: HTMLElement;
  icon: string;
  isCollapsedByDefault?: boolean;
  title: string;
}

/**
 * Interface for data returned by ErrorPanel's onMount callback
 */
export interface ErrorPanelMountData {
  closeButton: HTMLButtonElement;
  container: HTMLElement;
  errorContainer: HTMLElement;
  errorMessage: HTMLElement;
  errorTitle: HTMLElement;
}

/**
 * Interface for health indicator item
 */
export interface HealthIndicatorItem {
  name: string;
  status: boolean;
  tooltip?: string;
  value: string;
}

/**
 * Interface for data returned by ToggleButton's onMount callback
 */
export interface ToggleButtonMountData {
  button: HTMLButtonElement;
  buttonContainer: HTMLElement;
  container: HTMLElement;
  tooltip: HTMLDivElement;
}
