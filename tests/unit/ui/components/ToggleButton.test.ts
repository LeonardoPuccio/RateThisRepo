// tests/unit/ui/components/ToggleButton.test.ts
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

import {
  createShadowUiMock,
  getPrivateMember,
  mockDebugLog,
  mockErrorLog,
  setPrivateMember,
  setupDomMocks,
  setupSilentLogMocks,
} from '../../utils/test-utils';

// Define BUTTON_CLASSES directly here for mocking
const BUTTON_CLASSES = {
  ACTIVE: 'rtr-button-active',
  COMPONENT: 'rtr-component',
  CONTAINER: 'rtr-button-container',
  DEFAULT: 'rtr-button-default',
  TOOLTIP: 'rtr-tooltip',
  TOOLTIP_VISIBLE: 'visible',
};

// IMPORTANT: First define the mocks that need to be hoisted
vi.mock('@/utils/debug', () => ({
  debugLog: mockDebugLog,
  errorLog: mockErrorLog,
  logPerformance: vi.fn(),
  logUIState: vi.fn(),
}));

vi.mock('@/utils/config', () => ({
  DEBUG_CONFIG: {
    ui: false,
  },
  DEBUG_MODE: false,
}));

// Mock button classes - important to export the constant directly instead of in a function
vi.mock('@/ui/styles/button-animations', () => ({
  BUTTON_CLASSES,
}));

// Reset mock functions
setupSilentLogMocks();

// Get standard shadow UI mocks
const { mockShadowHost, mockShadowUi } = createShadowUiMock();

// Create standard button UI mocks - adding all necessary properties
const mockButton = {
  addEventListener: vi.fn(),
  classList: {
    add: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
    remove: vi.fn(),
    toggle: vi.fn(),
  },
  innerHTML: '',
  setAttribute: vi.fn(),
  style: {},
};

const mockTooltip = {
  classList: {
    add: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
    remove: vi.fn(),
    toggle: vi.fn(),
  },
  style: {},
  textContent: '',
};

const mockButtonContainer = {
  addEventListener: vi.fn(),
  appendChild: vi.fn(),
  classList: {
    add: vi.fn(),
    contains: vi.fn().mockReturnValue(false),
    remove: vi.fn(),
    toggle: vi.fn(),
  },
  className: '',
  style: {},
};

// Mock WXT's shadow DOM API - must be defined after the mock elements
vi.mock('wxt/utils/content-script-ui/shadow-root', () => ({
  createShadowRootUi: vi.fn(async (ctx, options) => {
    // Create container element
    const container = {
      appendChild: vi.fn(),
      classList: { add: vi.fn() },
    };

    // Call the onMount function with our mocks if provided
    if (options && options.onMount) {
      options.onMount(container, { host: mockShadowHost }, mockShadowHost);
    }

    return mockShadowUi;
  }),
}));

// Set up standard DOM mocks - must be after defining all mock elements
const { mockCreateElement } = setupDomMocks();

// Custom mock implementation for document.createElement
document.createElement = vi.fn(tagName => {
  if (tagName === 'button') {
    return mockButton;
  } else if (tagName === 'div') {
    // Return different divs based on creation order
    const divCalls = document.createElement.mock.calls.filter(call => call[0] === 'div').length;
    if (divCalls === 1) {
      return mockButtonContainer;
    } else {
      return mockTooltip;
    }
  }
  // Default element with basic properties
  return {
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    classList: {
      add: vi.fn(),
      contains: vi.fn(),
      remove: vi.fn(),
      toggle: vi.fn(),
    },
    className: '',
    innerHTML: '',
    style: {},
  };
});

describe('ToggleButton', () => {
  let ToggleButton;
  let toggleButton;
  let toggleCallback;

  beforeEach(async () => {
    // Clear all mocks
    vi.clearAllMocks();

    // Create toggle callback
    toggleCallback = vi.fn();

    // Reset mock elements
    mockButton.addEventListener.mockClear();
    mockButton.setAttribute.mockClear();
    mockButtonContainer.appendChild.mockClear();
    mockButtonContainer.addEventListener.mockClear();

    // Reset shadow host display
    mockShadowHost.style.display = 'block';

    // Import ToggleButton class
    const module = await import('@/ui/components/ToggleButton');
    ToggleButton = module.ToggleButton;

    // Create mock context
    const mockContext = {
      addEventListener: vi.fn(),
      isInvalid: false,
      isValid: true,
    };

    // Create ToggleButton instance
    toggleButton = new ToggleButton(toggleCallback, mockContext as ContentScriptContext);
  });

  it('should instantiate correctly', () => {
    expect(toggleButton).toBeDefined();
  });

  it('should create button elements on initialization', async () => {
    // Initialize the button
    await toggleButton.initialize();

    // Verify document.createElement was called with correct arguments
    expect(document.createElement).toHaveBeenCalledWith('div');
    expect(document.createElement).toHaveBeenCalledWith('button');

    // Verify button was set up correctly
    expect(mockButton.setAttribute).toHaveBeenCalledWith('aria-label', 'Analyze Repository');
    expect(mockButton.innerHTML).toBe('📊');
    expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockButton.addEventListener).toHaveBeenCalledWith('mouseover', expect.any(Function));
    expect(mockButton.addEventListener).toHaveBeenCalledWith('mouseout', expect.any(Function));

    // Verify the button container has proper structure
    expect(mockButtonContainer.addEventListener).toHaveBeenCalledWith(
      'wheel',
      expect.any(Function),
      { passive: false }
    );
  });

  it('should mount button to the DOM', async () => {
    // Set UI property using our new utility
    setPrivateMember(toggleButton, 'ui', mockShadowUi);

    // Mount the button
    await toggleButton.mount();

    // Verify mount was called
    expect(mockShadowUi.mount).toHaveBeenCalled();
  });

  it('should remove button from the DOM', () => {
    // Set UI property using our new utility
    setPrivateMember(toggleButton, 'ui', mockShadowUi);

    // Remove the button
    toggleButton.remove();

    // Verify remove was called
    expect(mockShadowUi.remove).toHaveBeenCalled();

    // Verify UI reference was cleared using our new utility
    expect(getPrivateMember(toggleButton, 'ui')).toBeNull();
  });

  it('should set active state correctly', () => {
    // Set button property using our new utility
    setPrivateMember(toggleButton, 'button', mockButton);

    // Set to active
    toggleButton.setActive(true);
    expect(mockButton.classList.remove).toHaveBeenCalledWith('rtr-button-default');
    expect(mockButton.classList.add).toHaveBeenCalledWith('rtr-button-active');

    // Clear mocks
    mockButton.classList.remove.mockClear();
    mockButton.classList.add.mockClear();

    // Set to inactive
    toggleButton.setActive(false);
    expect(mockButton.classList.remove).toHaveBeenCalledWith('rtr-button-active');
    expect(mockButton.classList.add).toHaveBeenCalledWith('rtr-button-default');
  });

  it('should call toggle callback when clicked', () => {
    // Access the private method using our new utility
    const handleClick = getPrivateMember(toggleButton, 'handleClick').bind(toggleButton);

    // Call the handler
    handleClick();

    // Verify callback was called
    expect(toggleCallback).toHaveBeenCalled();
  });

  it('should show and hide tooltip', () => {
    // Set tooltip property using our new utility
    setPrivateMember(toggleButton, 'tooltip', mockTooltip);

    // Get the private methods using our new utility
    const showTooltip = getPrivateMember(toggleButton, 'showTooltip').bind(toggleButton);
    const hideTooltip = getPrivateMember(toggleButton, 'hideTooltip').bind(toggleButton);

    // Test show tooltip
    showTooltip();
    expect(mockTooltip.classList.add).toHaveBeenCalledWith('visible');

    // Test hide tooltip
    hideTooltip();
    expect(mockTooltip.classList.remove).toHaveBeenCalledWith('visible');
  });
});
