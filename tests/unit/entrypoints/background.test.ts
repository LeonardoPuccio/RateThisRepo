import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Mock modules BEFORE importing anything that depends on them
vi.mock('@/utils/constants', () => ({
  ACTIONS: {
    OPTIONS_UPDATED: 'OPTIONS_UPDATED',
    ANALYZE_REPO: 'ANALYZE_REPO',
    ANALYSIS_COMPLETE: 'ANALYSIS_COMPLETE',
    GET_STATE: 'GET_STATE',
  },
  STORAGE_KEYS: {
    SHOW_FLOATING_BUTTON: 'sync:showFloatingButton',
  },
}));

vi.mock('@/services/StateManager', () => ({
  StateManager: {
    getInstance: vi.fn().mockReturnValue({
      initialize: vi.fn().mockResolvedValue(undefined),
      saveAnalysisResult: vi.fn().mockResolvedValue(undefined),
      getState: vi.fn().mockReturnValue({
        isPanelVisible: false,
        hasAnalysisData: false,
        repoAnalysis: null,
      }),
    }),
  },
}));

vi.mock('@/services/StorageService', () => ({
  StorageService: {
    getOptions: vi.fn().mockResolvedValue({ showFloatingButton: true }),
    updateOptions: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('@/utils/config', () => ({
  DEBUG_MODE: false,
  debugLog: vi.fn(),
  errorLog: vi.fn(),
}));

// Now import after all mocks are set up
import { ACTIONS, STORAGE_KEYS } from '@/utils/constants';
import { StateManager } from '@/services/StateManager';
import { StorageService } from '@/services/StorageService';
import backgroundScript from '@/entrypoints/background';

// Define proper types for our listeners
type StorageChangeListener = (
  changes: Record<string, { newValue?: unknown; oldValue?: unknown }>,
  areaName: string
) => Promise<void> | void;

type MessageListener = (
  message: { action: string; data?: Record<string, unknown> },
  sender: { id: string },
  sendResponse: (response?: unknown) => void
) => boolean | void;

type InstalledListener = (details: Record<string, unknown>) => Promise<void> | void;

describe('Background Script', () => {
  // Store our listeners with proper types
  let storageChangeListener: StorageChangeListener;
  let messageListener: MessageListener;
  let installedListener: InstalledListener;

  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers();

    vi.clearAllMocks();
    fakeBrowser.reset();

    // Replace event listeners with mocks that capture the callback functions
    fakeBrowser.storage.onChanged.addListener = vi.fn((callback: StorageChangeListener) => {
      storageChangeListener = callback;
    });

    fakeBrowser.runtime.onMessage.addListener = vi.fn((callback: MessageListener) => {
      messageListener = callback;
    });

    fakeBrowser.runtime.onInstalled.addListener = vi.fn((callback: InstalledListener) => {
      installedListener = callback;
    });

    fakeBrowser.runtime.onStartup.addListener = vi.fn();
    if (fakeBrowser.runtime.onSuspend) {
      fakeBrowser.runtime.onSuspend.addListener = vi.fn();
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize state manager', () => {
    backgroundScript.main();

    expect(StateManager.getInstance).toHaveBeenCalled();
    expect(StateManager.getInstance().initialize).toHaveBeenCalled();
  });

  it('should handle storage.onChanged event', async () => {
    // Must mock tabs before background script executes
    fakeBrowser.tabs.query = vi.fn().mockResolvedValue([
      { id: 1, url: 'https://github.com/user/repo' },
      { id: 2, url: 'https://github.com/user/another-repo' },
    ]);

    // Ensure sendMessage resolves, not rejects
    fakeBrowser.tabs.sendMessage = vi.fn().mockResolvedValue(undefined);

    // Run the background script to register listeners
    backgroundScript.main();

    // Confirm listener was registered
    expect(fakeBrowser.storage.onChanged.addListener).toHaveBeenCalled();

    // Create change object with the mocked storage key
    const changes = {
      [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: {
        newValue: false,
        oldValue: true,
      },
    };

    // Call the listener
    const storagePromise = storageChangeListener(changes, 'sync');

    // Advance timers to resolve promises
    await vi.runAllTimersAsync();

    // Ensure storage listener has completed
    await storagePromise;

    // Verify the expected calls were made
    expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({ url: '*://github.com/*/*' });

    // Both tab ids (1 and 2) should receive a message
    expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledTimes(2);
    expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledWith(1, {
      action: ACTIONS.OPTIONS_UPDATED,
    });
    expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledWith(2, {
      action: ACTIONS.OPTIONS_UPDATED,
    });
  });

  it('should handle runtime.onInstalled event', async () => {
    backgroundScript.main();

    expect(fakeBrowser.runtime.onInstalled.addListener).toHaveBeenCalled();

    await installedListener({});

    expect(StorageService.getOptions).toHaveBeenCalled();
  });

  it('should initialize showFloatingButton option if not set', async () => {
    vi.mocked(StorageService.getOptions).mockResolvedValueOnce({
      showFloatingButton: undefined as unknown as boolean,
    });

    backgroundScript.main();

    await installedListener({});

    expect(StorageService.updateOptions).toHaveBeenCalledWith({
      showFloatingButton: true,
    });
  });

  describe('Message handling', () => {
    it('should handle ANALYZE_REPO message', async () => {
      fakeBrowser.tabs.query = vi.fn().mockResolvedValue([{ id: 1 }]);
      fakeBrowser.tabs.sendMessage = vi.fn().mockResolvedValue(undefined);

      backgroundScript.main();

      expect(fakeBrowser.runtime.onMessage.addListener).toHaveBeenCalled();

      const sendResponse = vi.fn();

      const result = await messageListener(
        { action: ACTIONS.ANALYZE_REPO },
        { id: 'sender-id' },
        sendResponse
      );

      expect(fakeBrowser.tabs.query).toHaveBeenCalledWith({
        active: true,
        currentWindow: true,
      });
      expect(fakeBrowser.tabs.sendMessage).toHaveBeenCalledWith(1, {
        action: ACTIONS.ANALYZE_REPO,
      });
      expect(result).toBe(true);
    });

    it('should handle ANALYSIS_COMPLETE message', async () => {
      backgroundScript.main();

      const sendResponse = vi.fn();
      const mockData = { repoName: 'test/repo', score: 85 };

      const result = await messageListener(
        { action: ACTIONS.ANALYSIS_COMPLETE, data: mockData },
        { id: 'sender-id' },
        sendResponse
      );

      expect(StateManager.getInstance().saveAnalysisResult).toHaveBeenCalledWith(mockData);
      expect(result).toBe(true);
    });

    it('should handle GET_STATE message', () => {
      backgroundScript.main();

      const sendResponse = vi.fn();

      messageListener({ action: ACTIONS.GET_STATE }, { id: 'sender-id' }, sendResponse);

      expect(StateManager.getInstance().getState).toHaveBeenCalled();
      expect(sendResponse).toHaveBeenCalledWith({
        isPanelVisible: false,
        hasAnalysisData: false,
        repoAnalysis: null,
      });
    });

    it('should handle error in GET_STATE message', () => {
      vi.mocked(StateManager.getInstance().getState).mockImplementationOnce(() => {
        throw new Error('Test error');
      });

      backgroundScript.main();

      const sendResponse = vi.fn();

      messageListener({ action: ACTIONS.GET_STATE }, { id: 'sender-id' }, sendResponse);

      expect(sendResponse).toHaveBeenCalledWith({
        isPanelVisible: false,
        hasAnalysisData: false,
        repoAnalysis: null,
      });
    });
  });

  it('should handle service worker lifecycle events', () => {
    backgroundScript.main();

    expect(fakeBrowser.runtime.onStartup.addListener).toHaveBeenCalled();
    if (fakeBrowser.runtime.onSuspend) {
      expect(fakeBrowser.runtime.onSuspend.addListener).toHaveBeenCalled();
    }
  });
});
