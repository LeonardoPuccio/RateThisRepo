import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { ACTIONS } from '@/utils/constants';

// Mock window and document globals
const mockDocument = {
  body: {
    appendChild: vi.fn(),
  },
  createElement: vi.fn(() => ({
    style: {},
    appendChild: vi.fn(),
  })),
  getElementById: vi.fn(),
  querySelector: vi.fn(),
};

const mockWindow = {
  location: {
    href: 'https://github.com/user/repo',
    pathname: '/user/repo',
  },
};

// Apply global mocks before importing modules that use them
vi.stubGlobal('document', mockDocument);
vi.stubGlobal('window', mockWindow);

// Mock components and services
vi.mock('@/ui/components/ToggleButton', () => ({
  ToggleButton: vi.fn(_ => ({
    appendTo: vi.fn(),
    setActive: vi.fn(),
    buttonContainer: {
      remove: vi.fn(),
    },
    // Add missing properties to satisfy TypeScript
    button: document.createElement('button'),
    tooltip: document.createElement('div'),
    setupEventListeners: vi.fn(),
    toggleActive: vi.fn(),
  })),
}));

vi.mock('@/ui/components/AnalysisPanel', () => ({
  AnalysisPanel: vi.fn(() => ({
    appendTo: vi.fn(),
    setData: vi.fn(),
    show: vi.fn(),
    remove: vi.fn(),
  })),
}));

// Mock services
vi.mock('@/services/StateManager', () => {
  const mockStateManager = {
    initialize: vi.fn().mockResolvedValue(undefined),
    getState: vi.fn().mockReturnValue({
      isPanelVisible: false,
      hasAnalysisData: false,
      repoAnalysis: null,
    }),
    setPanelVisibility: vi.fn().mockResolvedValue(undefined),
    saveAnalysisResult: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    notifyAnalysisStarted: vi.fn(),
    notifyAnalysisError: vi.fn(),
    destroy: vi.fn(),
  };

  return {
    StateManager: {
      getInstance: vi.fn().mockReturnValue(mockStateManager),
    },
  };
});

vi.mock('@/services/StorageService', () => ({
  StorageService: {
    getOptions: vi.fn().mockResolvedValue({ showFloatingButton: true }),
  },
}));

// Mock repository analyzer - Updated to match actual implementation
vi.mock('@/utils/repository-analyzer', () => {
  // Create mock analyzer instance that will be returned by constructor
  const mockAnalyzer = {
    detectReadmeFromDOM: vi.fn(),
    analyze: vi.fn().mockResolvedValue({
      repoName: 'test-repo',
      description: 'Test repository',
      score: '85', // String to match the interface
      categories: [],
      metrics: {},
      isPopular: true,
      isActive: true,
      hasCommunity: true,
      isWellMaintained: true,
      isWellDocumented: true,
      hasReadme: true,
      hasWiki: false,
      hasWebsite: false,
      readmeLength: 500,
      activityMessage: 'Last updated 2 days ago',
      strengths: [],
      recommendations: [],
    }),
  };

  // Return a constructor function that creates the mock analyzer
  return {
    RepositoryAnalyzer: vi.fn((username, repoName) => {
      // Store the constructor arguments so we can verify them in tests
      RepositoryAnalyzer.lastConstructorArgs = [username, repoName];
      return mockAnalyzer;
    }),
  };
});

// Mock config module
vi.mock('@/utils/config', () => ({
  DEBUG_MODE: false,
  debugLog: vi.fn(),
  errorLog: vi.fn(),
}));

// Import after mocks are set up
import { StateManager } from '@/services/StateManager';
import { StorageService } from '@/services/StorageService';
import { RepositoryAnalyzer } from '@/utils/repository-analyzer';
import { ToggleButton } from '@/ui/components/ToggleButton';
import contentScript from '@/entrypoints/content';

// Helper to create a ContentScriptContext that TypeScript accepts
function createMockContext() {
  // Create a fully mocked context with all required properties
  const abortController = new AbortController();

  return {
    // Required properties by the interface
    contentScriptName: 'content',
    isTopFrame: true,
    isValid: true,
    isInvalid: false,
    addEventListener: vi.fn(),
    setTimeout: vi.fn(),
    setInterval: vi.fn(),
    clearTimeout: vi.fn(),
    clearInterval: vi.fn(),
    abortController,
    signal: abortController.signal,
    abort: vi.fn(),
    receivedMessageIds: new Set(),
    documentReadyState: 'complete',
    documentVisibilityState: 'visible',
    onInvalidated: vi.fn(),
    setInvalidOnDisconnect: vi.fn(),
    onDisconnect: vi.fn(),
    invalidateContextIfNecessary: vi.fn(),
    locationWatcher: {
      observe: vi.fn(),
      disconnect: vi.fn(),
      locationChanges: [],
      dispatch: vi.fn(),
    },
    requestAnimationFrame: vi.fn(),
    cancelAnimationFrame: vi.fn(),
    fetch: vi.fn(),
    pauseWithContext: vi.fn(),
    queueMutationObserverTasks: vi.fn(),
    queueFrameCalls: vi.fn(),
    queueTimers: vi.fn(),
    queueSharedWorkerMessages: vi.fn(),
    queueRuntimeMessages: vi.fn(),
    queueEventDispatch: vi.fn(),
  };
}

describe('Content Script', () => {
  // Store listeners for testing
  let messageListeners: Array<any> = [];

  beforeEach(() => {
    // Setup fake timers
    vi.useFakeTimers();

    // Reset mocks
    vi.clearAllMocks();
    fakeBrowser.reset();

    // Reset document mock
    mockDocument.getElementById.mockReturnValue(null);

    // Setup browser message listener mock
    messageListeners = [];
    fakeBrowser.runtime.onMessage = {
      addListener: vi.fn(listener => {
        messageListeners.push(listener);
      }),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    };

    // Setup sendMessage spy
    fakeBrowser.runtime.sendMessage = vi.fn().mockResolvedValue(undefined);

    // Reset the stored constructor args
    RepositoryAnalyzer.lastConstructorArgs = null;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize state manager', async () => {
    // Create mock context
    const mockContext = createMockContext();

    // Execute content script
    await contentScript.main(mockContext);

    // Verify state manager is initialized
    expect(StateManager.getInstance).toHaveBeenCalled();
    expect(StateManager.getInstance().initialize).toHaveBeenCalled();
  });

  it('should add toggle button if option is enabled', async () => {
    // Create mock context
    const mockContext = createMockContext();

    // Execute content script
    await contentScript.main(mockContext);

    // Run any pending timers
    await vi.runAllTimersAsync();

    // Verify button is added
    expect(ToggleButton).toHaveBeenCalled();
  });

  it('should not add toggle button if option is disabled', async () => {
    // Create mock context
    const mockContext = createMockContext();

    // Mock storage to disable button
    vi.mocked(StorageService.getOptions).mockResolvedValueOnce({
      showFloatingButton: false,
    });

    // Reset toggle button mock
    vi.mocked(ToggleButton).mockClear();

    // Execute content script
    await contentScript.main(mockContext);

    // Run any pending timers
    await vi.runAllTimersAsync();

    // Verify button is not added
    expect(ToggleButton).not.toHaveBeenCalled();
  });

  describe('Message handling', () => {
    it('should handle ANALYZE_REPO message', async () => {
      // Create mock context
      const mockContext = createMockContext();

      // Execute content script
      await contentScript.main(mockContext);

      // Wait for all promises to resolve
      await vi.runAllTimersAsync();

      // Ensure the listener was registered
      expect(fakeBrowser.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(messageListeners.length).toBeGreaterThan(0);

      // Get the first registered message listener
      const messageListener = messageListeners[0];

      // Create mock sender and response function
      const sender = { id: 'sender-id' };
      const sendResponse = vi.fn();

      // Call the message listener with ANALYZE_REPO action
      messageListener({ action: ACTIONS.ANALYZE_REPO }, sender, sendResponse);

      // Run timers to process async operations
      await vi.runAllTimersAsync();

      // Verify repository analyzer was created and called with correct args
      expect(RepositoryAnalyzer).toHaveBeenCalled();
      expect(RepositoryAnalyzer.lastConstructorArgs).toEqual(['user', 'repo']);

      // Get the mock analyzer instance
      const mockAnalyzer = vi.mocked(RepositoryAnalyzer).mock.results[0].value;
      expect(mockAnalyzer.detectReadmeFromDOM).toHaveBeenCalledWith(mockDocument);
      expect(mockAnalyzer.analyze).toHaveBeenCalled();
      expect(StateManager.getInstance().notifyAnalysisStarted).toHaveBeenCalled();
    });

    it('should handle GET_STATE message', async () => {
      // Create expected state
      const mockState = {
        isPanelVisible: true,
        hasAnalysisData: true,
        repoAnalysis: {
          repoName: 'test/repo',
          description: 'Test description',
          score: '85', // String to match the interface
          categories: [],
          metrics: {},
          isPopular: true,
          isActive: true,
          hasCommunity: true,
          isWellMaintained: true,
          isWellDocumented: true,
          hasReadme: true,
          hasWiki: true,
          hasWebsite: false,
          readmeLength: 500,
          activityMessage: 'Last updated recently',
          strengths: [],
          recommendations: [],
        },
      };

      // Mock state manager to return custom state
      vi.mocked(StateManager.getInstance().getState).mockReturnValue(mockState);

      // Create mock context
      const mockContext = createMockContext();

      // Execute content script
      await contentScript.main(mockContext);

      // Wait for all promises to resolve
      await vi.runAllTimersAsync();

      // Ensure the listener was registered
      expect(fakeBrowser.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(messageListeners.length).toBeGreaterThan(0);

      // Get the first registered message listener
      const messageListener = messageListeners[0];

      // Create mock sender and response function
      const sender = { id: 'sender-id' };
      const sendResponse = vi.fn();

      // Call the message listener with GET_STATE action
      messageListener({ action: ACTIONS.GET_STATE }, sender, sendResponse);

      // Verify response was sent
      expect(sendResponse).toHaveBeenCalledWith(mockState);
    });
  });

  it('should register event handlers with context', async () => {
    // Create mock context
    const mockContext = createMockContext();

    // Execute content script
    await contentScript.main(mockContext);

    // Verify event listeners were added
    expect(mockContext.addEventListener).toHaveBeenCalled();
  });

  it('should cleanup resources when content script is unloaded', async () => {
    // Create mock context
    const mockContext = createMockContext();

    // Execute content script and get cleanup function
    const cleanup = await contentScript.main(mockContext);

    // Call cleanup function
    cleanup();

    // Verify state manager is destroyed
    expect(StateManager.getInstance().destroy).toHaveBeenCalled();
  });

  it('should analyze repository and show panel when toggle button is clicked', async () => {
    // Create mock context
    const mockContext = createMockContext();

    // Setup mock state with no analysis data
    const mockState = {
      isPanelVisible: false,
      hasAnalysisData: false,
      repoAnalysis: null,
    };
    vi.mocked(StateManager.getInstance().getState).mockReturnValue(mockState);

    // Capture toggle callback when ToggleButton is created
    let toggleCallback: (() => void) | undefined;
    vi.mocked(ToggleButton).mockImplementation(callback => {
      toggleCallback = callback;
      return {
        appendTo: vi.fn(),
        setActive: vi.fn(),
        buttonContainer: {
          remove: vi.fn(),
        },
        // Add missing properties to satisfy TypeScript
        button: document.createElement('button'),
        tooltip: document.createElement('div'),
        setupEventListeners: vi.fn(),
        toggleActive: vi.fn(),
      };
    });

    // Execute content script
    await contentScript.main(mockContext);

    // Run timers to process async operations
    await vi.runAllTimersAsync();

    // Verify toggle button was created
    expect(ToggleButton).toHaveBeenCalled();
    expect(toggleCallback).toBeDefined();

    // Execute toggle callback to simulate button click
    if (toggleCallback) {
      await toggleCallback();
    }

    // Run timers to process async operations
    await vi.runAllTimersAsync();

    // Verify repository was analyzed with correct arguments
    expect(RepositoryAnalyzer).toHaveBeenCalled();
    expect(RepositoryAnalyzer.lastConstructorArgs).toEqual(['user', 'repo']);

    // Get the mock analyzer instance
    const mockAnalyzer = vi.mocked(RepositoryAnalyzer).mock.results[0].value;
    expect(mockAnalyzer.analyze).toHaveBeenCalled();
    expect(StateManager.getInstance().saveAnalysisResult).toHaveBeenCalled();
    expect(fakeBrowser.runtime.sendMessage).toHaveBeenCalled();
  });
});
