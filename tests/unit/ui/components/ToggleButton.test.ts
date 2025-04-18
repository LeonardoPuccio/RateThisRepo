// tests/unit/ui/components/ToggleButton.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { ContentScriptContext } from 'wxt/utils/content-script-context';

// Mock elements that we'll use for testing
const mockButton = {
  classList: {
    add: vi.fn(),
    remove: vi.fn()
  },
  addEventListener: vi.fn(),
  setAttribute: vi.fn(),
  innerHTML: "",
  style: {}
};

const mockTooltip = {
  classList: {
    add: vi.fn(),
    remove: vi.fn()
  },
  textContent: "",
  style: {}
};

const mockButtonContainer = {
  classList: {
    add: vi.fn()
  },
  className: "",
  style: {},
  appendChild: vi.fn(),
  addEventListener: vi.fn()
};

// Mock shadow host for UI
const mockShadowHost = {
  style: {
    position: '',
    bottom: '',
    right: '',
    width: '',
    height: '',
    zIndex: '',
    overflow: '',
    pointerEvents: '',
    display: 'block'
  }
};

const mockShadowUi = {
  mount: vi.fn(),
  remove: vi.fn(),
  shadowHost: mockShadowHost,
  autoMount: vi.fn(),
  unmount: vi.fn()
};

// Mock document.createElement to return our mock objects
const createElement = vi.fn((tagName) => {
  if (tagName === 'button') {
    return mockButton;
  } else if (tagName === 'div') {
    // Return different divs based on creation order
    if (createElement.mock.calls.filter(call => call[0] === 'div').length === 1) {
      return mockButtonContainer;
    } else {
      return mockTooltip;
    }
  }
  // Default element
  return {
    style: {},
    classList: { add: vi.fn() },
    appendChild: vi.fn(),
    addEventListener: vi.fn()
  };
});

// Mock document
vi.stubGlobal('document', {
  createElement,
  body: {
    appendChild: vi.fn()
  }
});

// Mock WXT's shadow DOM API
vi.mock('wxt/utils/content-script-ui/shadow-root', () => ({
  createShadowRootUi: vi.fn(async (ctx, options) => {
    // Create container element
    const container = {
      classList: { add: vi.fn() },
      appendChild: vi.fn()
    };
    
    // Make sure we call onMount directly
    if (options && options.onMount) {
      options.onMount(container, { host: mockShadowHost }, mockShadowHost);
    }
    
    return mockShadowUi;
  })
}));

// Mock config
vi.mock('@/utils/config', () => ({
  debugLog: vi.fn(),
  errorLog: vi.fn()
}));

// Mock button classes
vi.mock('@/ui/styles/button-animations', () => ({
  BUTTON_CLASSES: {
    COMPONENT: 'rtr-component',
    CONTAINER: 'rtr-button-container',
    TOOLTIP: 'rtr-tooltip',
    TOOLTIP_VISIBLE: 'visible',
    DEFAULT: 'rtr-button-default',
    ACTIVE: 'rtr-button-active',
  }
}));

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
      isValid: true,
      isInvalid: false
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
    expect(createElement).toHaveBeenCalledWith('div');
    expect(createElement).toHaveBeenCalledWith('button');
    
    // Verify button was set up correctly
    expect(mockButton.setAttribute).toHaveBeenCalledWith('aria-label', 'Analyze Repository');
    expect(mockButton.innerHTML).toBe('📊');
    expect(mockButton.addEventListener).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockButton.addEventListener).toHaveBeenCalledWith('mouseover', expect.any(Function));
    expect(mockButton.addEventListener).toHaveBeenCalledWith('mouseout', expect.any(Function));
    
    // Verify the button container has proper structure
    expect(mockButtonContainer.addEventListener).toHaveBeenCalledWith(
      'wheel', expect.any(Function), { passive: false }
    );
  });
  
  it('should mount button to the DOM', async () => {
    // Set UI property
    // @ts-ignore - accessing private property for testing
    toggleButton.ui = mockShadowUi;
    
    // Mount the button
    await toggleButton.mount();
    
    // Verify mount was called
    expect(mockShadowUi.mount).toHaveBeenCalled();
  });
  
  it('should remove button from the DOM', () => {
    // Set UI property
    // @ts-ignore - accessing private property for testing
    toggleButton.ui = mockShadowUi;
    
    // Remove the button
    toggleButton.remove();
    
    // Verify remove was called
    expect(mockShadowUi.remove).toHaveBeenCalled();
    
    // Verify UI reference was cleared
    // @ts-ignore - accessing private property for testing
    expect(toggleButton.ui).toBeNull();
  });
  
  it('should set active state correctly', () => {
    // Set button property
    // @ts-ignore - accessing private property for testing
    toggleButton.button = mockButton;
    
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
    // Access the private method
    // @ts-ignore - accessing private method for testing
    const handleClick = toggleButton.handleClick.bind(toggleButton);
    
    // Call the handler
    handleClick();
    
    // Verify callback was called
    expect(toggleCallback).toHaveBeenCalled();
  });
  
  it('should show and hide tooltip', () => {
    // Set tooltip property
    // @ts-ignore - accessing private property for testing
    toggleButton.tooltip = mockTooltip;
    
    // Get the private methods
    // @ts-ignore - accessing private method for testing
    const showTooltip = toggleButton.showTooltip.bind(toggleButton);
    // @ts-ignore - accessing private method for testing
    const hideTooltip = toggleButton.hideTooltip.bind(toggleButton);
    
    // Test show tooltip
    showTooltip();
    expect(mockTooltip.classList.add).toHaveBeenCalledWith('visible');
    
    // Test hide tooltip
    hideTooltip();
    expect(mockTooltip.classList.remove).toHaveBeenCalledWith('visible');
  });
});
