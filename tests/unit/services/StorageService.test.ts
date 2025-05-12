import { StorageService } from '@/services/StorageService';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

describe('StorageService', () => {
  beforeEach(() => {
    // Each test starts with a clean storage
    fakeBrowser.storage.local.clear();
  });

  it('should get default state when storage is empty', async () => {
    const state = await StorageService.getState();

    // Verify default state properties
    expect(state).toHaveProperty('isPanelVisible');
    expect(state).toHaveProperty('hasAnalysisData');
    expect(state).toHaveProperty('repoAnalysis');

    // And their default values
    expect(state.isPanelVisible).toBe(false);
    expect(state.hasAnalysisData).toBe(false);
    expect(state.repoAnalysis).toBeNull();
  });

  it('should update UI state', async () => {
    // Update UI state
    await StorageService.updateUiState(true);

    // Get state and verify it was updated
    const state = await StorageService.getState();
    expect(state.isPanelVisible).toBe(true);
  });

  it('should watch for state changes', async () => {
    // Create a mock callback
    const mockCallback = vi.fn();

    // Set up watcher
    const unwatch = StorageService.watchState(mockCallback);

    // Update state to trigger callback
    await StorageService.updateUiState(true);

    // Verify callback was called with updated state
    expect(mockCallback).toHaveBeenCalled();
    const callArg = mockCallback.mock.calls[0][0];
    expect(callArg.isPanelVisible).toBe(true);

    // Cleanup
    unwatch();
  });
});
