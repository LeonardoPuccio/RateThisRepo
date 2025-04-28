import { AnalysisResult } from '@/interfaces/analysis.interface';
import { StateManager } from '@/services/StateManager';
import { StorageService } from '@/services/StorageService';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Mock the StorageService
vi.mock('@/services/StorageService', () => ({
  StorageService: {
    clearAnalysisData: vi.fn(),
    getOptions: vi.fn(),
    getState: vi.fn(),
    saveAnalysisResult: vi.fn(),
    updateUiState: vi.fn(),
    watchOptions: vi.fn(),
    watchState: vi.fn(),
  },
}));

// Mock the config module to avoid console output
vi.mock('@/utils/config', () => ({
  DEBUG_MODE: false,
  debugLog: vi.fn(),
  errorLog: vi.fn(),
}));

describe('StateManager', () => {
  let stateManager: StateManager;

  // Helper to mock initial state
  const mockInitialState = (overrides = {}) => {
    return {
      hasAnalysisData: false,
      isPanelVisible: false,
      repoAnalysis: null,
      ...overrides,
    };
  };

  // Mock storage watch callbacks with proper typing
  let stateWatchCallback: (state: Record<string, unknown>) => void;
  let optionsWatchCallback: (options: Record<string, unknown>) => void;

  beforeEach(() => {
    // Reset mocks and browser API
    vi.clearAllMocks();
    fakeBrowser.reset();

    // Setup storage mock behavior
    const mockState = mockInitialState();
    vi.mocked(StorageService.getState).mockResolvedValue(mockState);

    // Mock watchers to capture callbacks
    vi.mocked(StorageService.watchState).mockImplementation(callback => {
      stateWatchCallback = callback;
      return () => {}; // Return mock cleanup function
    });

    vi.mocked(StorageService.watchOptions).mockImplementation(callback => {
      optionsWatchCallback = callback;
      return () => {}; // Return mock cleanup function
    });

    // Get state manager instance
    stateManager = StateManager.getInstance();
  });

  afterEach(() => {
    // Clean up
    stateManager.destroy();
  });

  describe('Initialization', () => {
    it('should be a singleton', () => {
      const instance1 = StateManager.getInstance();
      const instance2 = StateManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with state from storage', async () => {
      await stateManager.initialize();
      expect(StorageService.getState).toHaveBeenCalled();
    });

    it('should handle initialization error gracefully', async () => {
      vi.mocked(StorageService.getState).mockRejectedValueOnce(new Error('Storage error'));

      // Should not throw
      await expect(stateManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('State Access and Modification', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should return current state', () => {
      const state = stateManager.getState();
      expect(state).toEqual(mockInitialState());
    });

    it('should set panel visibility', async () => {
      await stateManager.setPanelVisibility(true);
      expect(StorageService.updateUiState).toHaveBeenCalledWith(true);
    });

    it('should handle visibility update error', async () => {
      vi.mocked(StorageService.updateUiState).mockRejectedValueOnce(new Error('Update error'));

      await expect(stateManager.setPanelVisibility(true)).rejects.toThrow('Update error');
    });

    it('should save analysis result', async () => {
      const mockResult = { repository: { name: 'test-repo' } } as unknown as AnalysisResult;

      await stateManager.saveAnalysisResult(mockResult);
      expect(StorageService.saveAnalysisResult).toHaveBeenCalledWith(mockResult);
    });

    it('should handle save analysis error', async () => {
      vi.mocked(StorageService.saveAnalysisResult).mockRejectedValueOnce(new Error('Save error'));

      await expect(stateManager.saveAnalysisResult({} as AnalysisResult)).rejects.toThrow(
        'Save error'
      );
    });

    it('should clear analysis data', async () => {
      await stateManager.clearAnalysisData();
      expect(StorageService.clearAnalysisData).toHaveBeenCalled();
    });

    it('should handle clear analysis error', async () => {
      vi.mocked(StorageService.clearAnalysisData).mockRejectedValueOnce(new Error('Clear error'));

      await expect(stateManager.clearAnalysisData()).rejects.toThrow('Clear error');
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should register and call event handlers', () => {
      const handler = vi.fn();
      stateManager.on('panel:visibility-changed', handler);

      // Emit event
      stateManager.emit('panel:visibility-changed', true);

      expect(handler).toHaveBeenCalledWith(true);
    });

    it('should remove event handler', () => {
      const handler = vi.fn();
      stateManager.on('panel:visibility-changed', handler);
      stateManager.off('panel:visibility-changed', handler);

      // Emit event
      stateManager.emit('panel:visibility-changed', true);

      expect(handler).not.toHaveBeenCalled();
    });

    it('should handle errors in event handlers', () => {
      const handler = vi.fn().mockImplementation(() => {
        throw new Error('Handler error');
      });

      stateManager.on('panel:visibility-changed', handler);

      // Should not throw
      expect(() => stateManager.emit('panel:visibility-changed', true)).not.toThrow();
    });

    it('should emit panel visibility events when storage changes', () => {
      const handler = vi.fn();
      stateManager.on('panel:visibility-changed', handler);

      // Simulate storage state change
      if (stateWatchCallback) {
        stateWatchCallback({
          ...mockInitialState(),
          isPanelVisible: true,
        });
      }

      expect(handler).toHaveBeenCalledWith(true);
    });

    it('should emit analysis completed events when storage changes', () => {
      const handler = vi.fn();
      stateManager.on('analysis:completed', handler);

      const mockResult = { repository: { name: 'test-repo' } } as unknown as AnalysisResult;

      // Simulate storage state change
      if (stateWatchCallback) {
        stateWatchCallback({
          ...mockInitialState(),
          hasAnalysisData: true,
          repoAnalysis: mockResult,
        });
      }

      expect(handler).toHaveBeenCalledWith(mockResult);
    });

    it('should emit options changed events', () => {
      const handler = vi.fn();
      stateManager.on('options:changed', handler);

      const mockOptions = { showFloatingButton: true };

      // Simulate options change
      if (optionsWatchCallback) {
        optionsWatchCallback(mockOptions);
      }

      expect(handler).toHaveBeenCalledWith(mockOptions);
    });

    it('should notify analysis started', () => {
      const handler = vi.fn();
      stateManager.on('analysis:started', handler);

      stateManager.notifyAnalysisStarted();

      expect(handler).toHaveBeenCalled();
    });

    it('should notify analysis error', () => {
      const handler = vi.fn();
      stateManager.on('analysis:error', handler);

      const error = new Error('Analysis failed');
      stateManager.notifyAnalysisError(error);

      expect(handler).toHaveBeenCalledWith(error);
    });
  });

  describe('Cleanup', () => {
    beforeEach(async () => {
      await stateManager.initialize();
    });

    it('should clean up resources on destroy', () => {
      // Set up watchers and handlers
      const handler = vi.fn();
      stateManager.on('panel:visibility-changed', handler);

      // Destroy the manager
      stateManager.destroy();

      // Try to emit event after destroy
      stateManager.emit('panel:visibility-changed', true);

      // Should not trigger handler since event listeners were cleared
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
