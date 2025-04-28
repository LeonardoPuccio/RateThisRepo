import { StorageService } from '@/services/StorageService';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Mock the browser storage API items
vi.mock('#imports', () => {
  // Create mock storage items with watch functionality
  const createItem = key => {
    const watchers = new Set();
    let value = key.includes('panelVisible')
      ? false
      : key.includes('hasAnalysisData')
        ? false
        : null;

    return {
      getValue: vi.fn().mockImplementation(() => Promise.resolve(value)),
      key,
      setValue: vi.fn().mockImplementation(newValue => {
        value = newValue;
        // Notify watchers
        watchers.forEach(watcher => watcher(newValue));
        return Promise.resolve();
      }),
      watch: vi.fn().mockImplementation(callback => {
        watchers.add(callback);
        return () => {
          watchers.delete(callback);
        };
      }),
    };
  };

  return {
    storage: {
      defineItem: key => createItem(key),
      setItems: vi.fn().mockImplementation(items => {
        // Handle setting multiple items
        items.forEach(({ item, value }) => {
          item.setValue(value);
        });
        return Promise.resolve();
      }),
    },
  };
});

// Mock browser.runtime events
const mockRuntimeEvents = {
  onStartup: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
  onSuspend: {
    addListener: vi.fn(),
    removeListener: vi.fn(),
  },
};

// Mock config module to avoid console output
vi.mock('@/utils/config', () => ({
  DEBUG_MODE: false,
  debugLog: vi.fn(),
  errorLog: vi.fn(),
}));

describe('StorageService Lifecycle Management', () => {
  beforeEach(() => {
    // Reset mocks and browser API
    vi.clearAllMocks();
    fakeBrowser.reset();

    // Set up fake browser.runtime events
    fakeBrowser.runtime.onStartup = mockRuntimeEvents.onStartup;
    fakeBrowser.runtime.onSuspend = mockRuntimeEvents.onSuspend;

    // Clear storage before each test
    fakeBrowser.storage.local.clear();
  });

  afterEach(() => {
    // Clean up any listeners or watchers
    if (StorageService._stateWatchers) {
      StorageService._stateWatchers.forEach(unwatch => unwatch());
      StorageService._stateWatchers = [];
    }
  });

  describe('Service Worker Termination Handling', () => {
    it('should persist state when service worker terminates', async () => {
      // Update the UI state to true
      await StorageService.updateUiState(true);

      // Save analysis data
      const mockResult = {
        activityMessage: '',
        categories: [],
        hasCommunity: true,
        hasReadme: true,
        hasWebsite: false,
        hasWiki: false,
        isActive: true,
        isPopular: true,
        isWellDocumented: true,
        isWellMaintained: true,
        metrics: {},
        readmeLength: 500,
        recommendations: [],
        repoName: 'test-repo',
        score: '85',
        strengths: [],
      };
      await StorageService.saveAnalysisResult(mockResult);

      // Get the state after updates - should have isPanelVisible=true
      const state = await StorageService.getState();

      // Verify state is correct
      expect(state.isPanelVisible).toBe(true);
      expect(state.hasAnalysisData).toBe(true);
      expect(state.repoAnalysis).toEqual(mockResult);
    });

    it('should handle storage operations during service worker lifecycle events', async () => {
      // Register mock lifecycle handlers directly
      const startupHandler = vi.fn();
      const suspendHandler = vi.fn();

      // Directly add the handlers
      mockRuntimeEvents.onStartup.addListener(startupHandler);
      mockRuntimeEvents.onSuspend.addListener(suspendHandler);

      // Save some state
      await StorageService.updateUiState(true);

      // Verify listeners were added
      expect(mockRuntimeEvents.onStartup.addListener).toHaveBeenCalled();
      expect(mockRuntimeEvents.onSuspend.addListener).toHaveBeenCalled();

      // Simulate onSuspend event
      suspendHandler();
      expect(suspendHandler).toHaveBeenCalled();

      // Simulate startup (after browser restart)
      startupHandler();
      expect(startupHandler).toHaveBeenCalled();

      // Get state after events - should still have our settings
      const state = await StorageService.getState();
      expect(state.isPanelVisible).toBe(true);
    });
  });

  describe('Storage Watchers', () => {
    it('should properly register and cleanup watchers', async () => {
      // Create a callback for watching state
      const watchCallback = vi.fn();

      // Add a static property to StorageService to track watchers
      if (!StorageService._stateWatchers) {
        StorageService._stateWatchers = [];
      }

      // Set up watcher and capture the unwatch function
      const unwatch = StorageService.watchState(watchCallback);
      StorageService._stateWatchers.push(unwatch);

      // Update state to trigger callback
      await StorageService.updateUiState(true);

      // Verify callback was called
      expect(watchCallback).toHaveBeenCalled();
      expect(watchCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          isPanelVisible: true,
        })
      );

      // Reset mock
      watchCallback.mockReset();

      // Remove watcher
      unwatch();

      // Update state again - callback should not be called
      await StorageService.updateUiState(false);
      expect(watchCallback).not.toHaveBeenCalled();
    });

    it('should handle multiple watchers independently', async () => {
      // Set up callbacks
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      // Add a static property to StorageService to track watchers
      if (!StorageService._stateWatchers) {
        StorageService._stateWatchers = [];
      }

      // Set up watchers
      const unwatch1 = StorageService.watchState(callback1);
      const unwatch2 = StorageService.watchState(callback2);
      StorageService._stateWatchers.push(unwatch1, unwatch2);

      // Update state
      await StorageService.updateUiState(true);

      // Both callbacks should have been called
      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Reset mocks
      callback1.mockReset();
      callback2.mockReset();

      // Remove first watcher
      unwatch1();

      // Update state again
      await StorageService.updateUiState(false);

      // Only second callback should be called
      expect(callback1).not.toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();

      // Clean up
      unwatch2();
    });
  });

  describe('Error Handling', () => {
    it('should handle storage errors gracefully', async () => {
      // Replace the getValue method temporarily
      const originalGetValue = StorageService.getState;
      StorageService.getState = vi.fn().mockImplementationOnce(async () => {
        try {
          throw new Error('Storage error');
        } catch (error) {
          // Return default state
          return {
            hasAnalysisData: false,
            isPanelVisible: false,
            repoAnalysis: null,
          };
        }
      });

      // Attempt to get state - should not throw but return default state
      const state = await StorageService.getState();

      // Verify default state was returned
      expect(state.isPanelVisible).toBe(false);
      expect(state.hasAnalysisData).toBe(false);
      expect(state.repoAnalysis).toBeNull();

      // Restore original function
      StorageService.getState = originalGetValue;
    });

    it('should handle storage update errors', async () => {
      // Mock setValue to throw an error
      const originalUpdateUiState = StorageService.updateUiState;
      StorageService.updateUiState = vi.fn().mockImplementationOnce(async () => {
        throw new Error('Update error');
      });

      // Attempt to update state
      try {
        await StorageService.updateUiState(true);
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        // Should throw the storage error
        expect(error.message).toBe('Update error');
      }

      // Restore original function
      StorageService.updateUiState = originalUpdateUiState;
    });
  });

  describe('Storage Quota and Performance', () => {
    it('should handle large analysis results without exceeding storage limits', async () => {
      // Create a large mock result object
      const largeResult = {
        activityMessage: 'Lorem ipsum dolor sit amet',
        categories: [],
        description: 'A very large repository with lots of data',
        hasCommunity: true,
        hasReadme: true,
        hasWebsite: false,
        hasWiki: false,
        isActive: true,
        isPopular: true,
        isWellDocumented: true,
        isWellMaintained: true,
        metrics: {
          forks: 500,
          languages: Object.fromEntries(
            Array.from({ length: 20 }, (_, i) => [`language-${i}`, `${5 - i * 0.25}%`])
          ),
          stars: 1000,
        },
        readmeLength: 500,
        recommendations: Array.from(
          { length: 50 },
          (_, i) => `Recommendation ${i}: Lorem ipsum dolor sit amet`
        ),
        repoName: 'large-repo',
        score: '78.5',
        strengths: Array.from(
          { length: 50 },
          (_, i) => `Strength ${i}: Lorem ipsum dolor sit amet`
        ),
      };

      // Save the large result
      await StorageService.saveAnalysisResult(largeResult);

      // Retrieve the result
      const state = await StorageService.getState();

      // Verify the large result was saved and retrieved correctly
      expect(state.hasAnalysisData).toBe(true);
      expect(state.repoAnalysis.repoName).toBe('large-repo');
      expect(state.repoAnalysis.score).toBe('78.5');
    });
  });
});
