/**
 * Common constants for the extension
 */

// Storage keys for Chrome storage
export const STORAGE_KEYS = {
  SHOW_FLOATING_BUTTON: 'showFloatingButton',
  PANEL_VISIBLE: 'panelVisible',
  HAS_ANALYSIS_DATA: 'hasAnalysisData',
  REPO_ANALYSIS: 'repoAnalysis'
};

// Message actions for extension communication
export const ACTIONS = {
  ANALYZE_REPO: 'analyzeRepo',
  SHOW_PANEL: 'showPanel',
  HIDE_PANEL: 'hidePanel',
  TOGGLE_PANEL: 'togglePanel',
  GET_STATE: 'getState',
  UPDATE_STATE: 'updateState',
  ANALYSIS_COMPLETE: 'analysisComplete',
  OPTIONS_UPDATED: 'optionsUpdated'
};
