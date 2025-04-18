import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

// Mock dependencies before importing the module being tested
vi.mock('@/ui/components/AnalysisPanel', () => ({
  AnalysisPanel: vi.fn().mockImplementation(() => ({
    hide: vi.fn(),
    initialize: vi.fn().mockResolvedValue(undefined),
    mount: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn(),
    setData: vi.fn(),
    show: vi.fn(),
  })),
}));

vi.mock('@/entrypoints/content/error-handler', () => ({
  errorHandler: {
    handleError: vi.fn(),
  },
}));

vi.mock('@/utils/config', () => ({
  debugLog: vi.fn(),
  errorLog: vi.fn(),
}));

// Import module after mocks are defined
import { PanelManager, panelManager } from '@/entrypoints/content/panel-manager';

describe('PanelManager', () => {
  // Create a mock ContentScriptContext
  const mockContentScriptContext = {
    abort: vi.fn(),
    abortController: { signal: {} },
    addEventListener: vi.fn(),
    clearInterval: vi.fn(),
    clearTimeout: vi.fn(),
    contentScriptName: 'test-content-script',
    isInvalid: false,
    isTopFrame: true,
    isValid: true,
    setInterval: vi.fn(),
    setTimeout: vi.fn(),
    signal: {},
  } as unknown as ContentScriptContext;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset panel manager internal state for testing
    // @ts-expect-error - accessing private property for testing
    panelManager.analysisPanel = null;

    // Set context with proper mock
    panelManager.setContext(mockContentScriptContext);
  });

  afterEach(() => {
    // Clean up after tests
    panelManager.cleanup();
  });

  it('should create a singleton instance', () => {
    const instance1 = PanelManager.getInstance();
    const instance2 = PanelManager.getInstance();

    expect(instance1).toBe(instance2);
  });
});
