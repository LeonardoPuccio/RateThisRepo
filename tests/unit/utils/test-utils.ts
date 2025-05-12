/**
 * Standardized test utilities for RateThisRepo tests
 * Helps ensure consistent mocking approaches across all tests
 */
import { expect, vi } from 'vitest';
import { ShadowRootContentScriptUi } from 'wxt/utils/content-script-ui/shadow-root';

// Export mock functions that tests can use directly
export const mockDebugLog = vi.fn();
export const mockErrorLog = vi.fn();

/**
 * Sets up silent mocks for logging functions
 * This prevents debug and error logs from cluttering test output
 * Note: Must be called AFTER vi.mock calls in the test file
 */
export const setupSilentLogMocks = () => {
  // Reset the mocks before each use
  mockDebugLog.mockReset();
  mockErrorLog.mockReset();

  return { mockDebugLog, mockErrorLog };
};

/**
 * Helper to access private members of a class for testing
 * Provides type safety and eliminates the need for @ts-expect-error
 *
 * @example
 * // Access private 'ui' property of a component
 * const ui = getPrivateMember(component, 'ui');
 */
export const getPrivateMember = <T, K extends keyof any>(instance: T, property: K): unknown => {
  return (instance as any)[property];
};

/**
 * Set a private member of a class for testing
 * Provides type safety and eliminates the need for @ts-expect-error
 *
 * @example
 * // Set private 'ui' property of a component
 * setPrivateMember(component, 'ui', mockUi);
 */
export const setPrivateMember = <T, K extends keyof any, V>(
  instance: T,
  property: K,
  value: V
): void => {
  (instance as any)[property] = value;
};

/**
 * Creates a factory function for element mocks with all necessary properties
 * Standardizes the approach to mocking DOM elements across tests
 */
export const createElementMockFactory = () => {
  return () => ({
    addEventListener: vi.fn(),
    appendChild: vi.fn(),
    blur: vi.fn(),
    childNodes: [],
    children: [],
    classList: {
      add: vi.fn(),
      contains: vi.fn().mockReturnValue(false),
      remove: vi.fn(),
      toggle: vi.fn(),
    },
    className: '',
    click: vi.fn(),
    clientHeight: 500,
    closest: vi.fn().mockReturnValue(null),
    contains: vi.fn().mockReturnValue(false),
    firstChild: null,
    focus: vi.fn(),
    getAttribute: vi.fn(),
    getBoundingClientRect: vi.fn().mockReturnValue({
      bottom: 100,
      height: 100,
      left: 0,
      right: 100,
      top: 0,
      width: 100,
      x: 0,
      y: 0,
    }),
    id: '',
    innerHTML: '',
    onclick: null as unknown,
    parentNode: {
      removeChild: vi.fn(),
    },
    querySelector: vi.fn().mockReturnValue(null),
    querySelectorAll: vi.fn().mockReturnValue([]),
    removeEventListener: vi.fn(),
    scrollHeight: 1000,
    scrollTop: 0,
    setAttribute: vi.fn(),
    style: {
      background: '',
      display: 'block',
      height: '',
      left: '',
      maxHeight: '',
      minHeight: '',
      overflow: '',
      overflowX: '',
      overflowY: '',
      pointerEvents: '',
      position: '',
      right: '',
      top: '',
      width: '',
      zIndex: '',
    },
    textContent: '',
  });
};

/**
 * Creates a standard mock for Shadow DOM UI components
 * Provides consistent approach to mocking WXT's shadow DOM functionality
 */
export const createShadowUiMock = () => {
  // Mock shadow host with all properties components might access
  const mockShadowHost = {
    style: {
      display: 'block',
      maxHeight: '',
      maxWidth: '',
      overflow: '',
      pointerEvents: '',
      position: '',
      right: '',
      top: '',
      width: '',
      zIndex: '',
    },
  };

  // Mock shadow UI with standard methods
  const mockShadowUi = {
    autoMount: vi.fn(),
    mount: vi.fn(),
    remove: vi.fn(),
    shadowHost: mockShadowHost,
    unmount: vi.fn(),
  } as unknown as ShadowRootContentScriptUi<any>;

  return { mockShadowHost, mockShadowUi };
};

/**
 * Sets up standard document and window mocks for component tests
 * Creates a consistent testing environment across all component tests
 */
export const setupDomMocks = () => {
  const createElement = createElementMockFactory();

  const mockCreateElement = vi.fn().mockImplementation(createElement);

  const mockBodyAppendChild = vi.fn();
  const mockBody = {
    appendChild: mockBodyAppendChild,
    contains: vi.fn().mockReturnValue(false),
    querySelector: vi.fn().mockReturnValue(null),
    querySelectorAll: vi.fn().mockReturnValue([]),
    removeChild: vi.fn(),
    style: {},
  };

  // Override document with a standardized mock
  vi.stubGlobal('document', {
    addEventListener: vi.fn(),
    body: mockBody,
    createElement: mockCreateElement,
    documentElement: {
      clientHeight: 768,
      clientWidth: 1024,
    },
    querySelector: vi.fn().mockReturnValue(null),
    querySelectorAll: vi.fn().mockReturnValue([]),
    removeEventListener: vi.fn(),
  });

  // Mock window with standardized properties
  vi.stubGlobal('window', {
    addEventListener: vi.fn(),
    cancelAnimationFrame: vi.fn(),
    clearTimeout: vi.fn(),
    getComputedStyle: vi.fn().mockReturnValue({
      getPropertyValue: vi.fn().mockReturnValue(''),
    }),
    getSelection: vi.fn().mockReturnValue({
      removeAllRanges: vi.fn(),
    }),
    innerHeight: 768,
    innerWidth: 1024,
    removeEventListener: vi.fn(),
    requestAnimationFrame: vi.fn(cb => setTimeout(cb, 0)),
    setTimeout: vi.fn(cb => cb()),
  });

  return { createElement, mockBody, mockCreateElement };
};

/**
 * Creates a customized document.createElement mock function
 * Allows for returning different mock elements based on element type
 */
export const createCustomElementMock = (
  mockElements: Record<string, any>,
  defaultCreator = createElementMockFactory()()
) => {
  return vi.fn((tagName: string) => {
    if (mockElements[tagName]) {
      return mockElements[tagName];
    }
    return defaultCreator;
  });
};

/**
 * Verifies expected log calls in tests
 * Helper utility to consistently test logging across components
 */
export const expectErrorLogged = (
  mockErrorLog: ReturnType<typeof vi.fn>,
  component: string,
  message: string
) => {
  expect(mockErrorLog).toHaveBeenCalledWith(component, message);
};

/**
 * Mock common utility classes consistently across tests
 */
export const mockCommonDependencies = () => {
  // Mock button styles
  vi.mock('@/ui/styles/button-animations', () => ({
    BUTTON_CLASSES: {
      ACTIVE: 'rtr-button-active',
      COMPONENT: 'rtr-component',
      CONTAINER: 'rtr-button-container',
      DEFAULT: 'rtr-button-default',
      TOOLTIP: 'rtr-tooltip',
      TOOLTIP_VISIBLE: 'visible',
    },
  }));

  // Mock IconHelper
  vi.mock('@/ui/helpers/IconHelper', () => ({
    IconHelper: {
      getSvgIconString: vi.fn().mockReturnValue('<svg></svg>'),
    },
  }));
};
