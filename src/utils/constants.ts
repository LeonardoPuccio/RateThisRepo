/**
 * Common constants for the extension
 */

// Storage keys for Chrome storage
export const STORAGE_KEYS = {
  HAS_ANALYSIS_DATA: 'hasAnalysisData',
  PANEL_VISIBLE: 'panelVisible',
  REPO_ANALYSIS: 'repoAnalysis',
  SHOW_FLOATING_BUTTON: 'showFloatingButton',
};

// Message actions for extension communication
export const ACTIONS = {
  ANALYSIS_COMPLETE: 'analysisComplete',
  ANALYZE_REPO: 'analyzeRepo',
  GET_STATE: 'getState',
  HIDE_PANEL: 'hidePanel',
  OPTIONS_UPDATED: 'optionsUpdated',
  SHOW_PANEL: 'showPanel',
  TOGGLE_PANEL: 'togglePanel',
  UPDATE_STATE: 'updateState',
};
