# RateThisRepo Testing

This directory contains tests for the RateThisRepo extension using Vitest and WXT's testing utilities.

## Test Types

- **Unit Tests**: Tests for individual components and functions
- **Integration Tests**: (Future) Tests for interactions between components
- **E2E Tests**: (Future) End-to-end tests using Playwright

## Directory Structure

```
tests/
├── setup.ts                       # Global test setup
├── README.md                      # Documentation
├── unit/                          # Unit tests
│   ├── analysis/                  # Tests for analysis modules
│   │   └── insights/
│   │       └── StrengthsAnalyzer.test.ts
│   ├── basic.test.ts              # Basic environment verification
│   ├── core/                      # Tests for core browser features
│   │   └── browser-storage.test.ts
│   ├── entrypoints/               # Tests for extension entrypoints
│   │   ├── background.test.ts     # Tests for background script
│   │   └── content.test.ts        # Tests for content script
│   ├── services/                  # Tests for service modules
│   │   ├── MessageService.test.ts # Tests for messaging service
│   │   ├── StateManager.test.ts   # Tests for state management
│   │   └── StorageService.test.ts # Tests for storage service
│   ├── ui/                        # Tests for UI components
│   │   └── components/
│   │       ├── AnalysisPanel.test.ts  # Tests for the analysis panel
│   │       └── ToggleButton.test.ts   # Tests for the toggle button
│   └── utils/                     # Tests for utility functions
│       └── repository-analyzer.test.ts
├── integration/                   # Future integration tests
│   └── ...
└── e2e/                           # Future E2E tests
    └── ...
```

## Test Coverage

Current test coverage includes:

### Core Services
- **StateManager**: Tests for state persistence, event system, and lifecycle management
- **StorageService**: Tests for storage operations and type safety
- **MessageService**: Tests for messaging architecture and handler management

### UI Components
- **ToggleButton**: Tests for button functionality, state management, and user interaction
- **AnalysisPanel**: Tests for panel rendering, data handling, and user interaction

### Entrypoints
- **Background Script**: Tests for messaging handling, state management, and service worker lifecycle
- **Content Script**: Tests for UI initialization, message handling, and DOM interaction

### Utils
- **RepositoryAnalyzer**: Tests for GitHub API integration and analysis logic

## Best Practices

### Test Environment

WXT and Vitest are configured to use the Node environment for all tests. This provides:

- Faster test execution
- Better compatibility with browser-like APIs
- Simplified mocking approach
- Consistent behavior across all test types

### Test Setup

Keep the setup file simple and focused:

```ts
// tests/setup.ts
import { beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Reset the fake browser before each test
beforeEach(() => {
  fakeBrowser.reset();
});
```

### Type Safety in Tests

Maintain strong typing in your tests to catch errors at compile time:

```typescript
// Define test-specific interfaces
interface TestMessage {
  action: string;
  data?: unknown;
}

// Create factory functions that return properly typed objects
function createTestMessage(action: string, data?: unknown): TestMessage {
  return { action, data };
}

// Use type assertions sparingly and only when necessary
const testMessage = createTestMessage(ACTIONS.GET_STATE) as ExtensionMessage;
```

### Testing Browser APIs

Use `fakeBrowser` from WXT's testing utilities to test browser APIs:

```ts
import { fakeBrowser } from 'wxt/testing';

it('should store and retrieve values', async () => {
  await fakeBrowser.storage.local.set({ key: 'value' });
  const result = await fakeBrowser.storage.local.get('key');
  expect(result).toEqual({ key: 'value' });
});
```

### Testing Event Listeners

When testing code that registers event listeners:

```ts
it('should handle browser events', async () => {
  // Execute the code that registers listeners
  myService.setupListeners();
  
  // Get the event listener from the mock calls
  const storageListener = fakeBrowser.storage.onChanged.addListener.mock.calls[0][0];
  
  // Call the listener directly with a change object
  storageListener(
    { 'key': { newValue: 'new value', oldValue: 'old value' } }, 
    'local'
  );
  
  // Verify the expected behavior occurred
  expect(myService.wasUpdated).toBe(true);
});
```

### Testing Message Handlers

When testing code that registers message handlers:

```ts
it('should handle messages', async () => {
  // Execute the code that registers message handlers
  backgroundScript.main();
  
  // Get the message listener directly from the mock calls
  const messageListener = fakeBrowser.runtime.onMessage.addListener.mock.calls[0][0];
  
  // Create a mock sendResponse function
  const sendResponse = vi.fn();
  
  // Call the listener directly with message and context
  messageListener(
    { action: 'TEST_ACTION' }, 
    { id: 'sender-id' }, 
    sendResponse
  );
  
  // Verify the expected behavior
  expect(sendResponse).toHaveBeenCalledWith({ success: true });
});
```

### Mocking Dependencies

```ts
import { vi } from 'vitest';

// Mock a service or module
vi.mock('@/services/SomeService', () => ({
  SomeService: {
    method: vi.fn().mockReturnValue('mocked value')
  }
}));
```

### Testing UI Components

For UI components, we mock the DOM rather than using JSDOM to avoid compatibility issues:

```ts
// Mock DOM elements for UI testing
const mockButton = {
  id: 'button-id',
  style: {},
  classList: {
    add: vi.fn(),
    remove: vi.fn(),
    contains: vi.fn(() => false)
  },
  onclick: null,
  click: vi.fn()
};

// Mock document methods
vi.spyOn(document, 'getElementById')
  .mockImplementation((id) => {
    if (id === 'button-id') return mockButton;
    return null;
  });

describe('UIComponent', () => {
  it('should handle click events', () => {
    // Create component
    const component = new UIComponent();
    
    // Simulate click by calling the event handler directly
    mockButton.onclick?.({} as any);
    
    // Verify expected behavior
    expect(component.wasClicked).toBe(true);
  });
});
```

## Testing WXT-specific Features

### Testing Content Scripts

```ts
import contentScript from '@/entrypoints/content';
import { fakeBrowser } from 'wxt/testing';

describe('Content Script', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should initialize correctly', async () => {
    // Create mock context
    const mockContext = {
      isValid: true,
      isInvalid: false,
      addEventListener: vi.fn()
    };
    
    // Run the content script's main function
    await contentScript.main(mockContext);
    
    // Verify behavior
    expect(mockContext.addEventListener).toHaveBeenCalled();
  });
});
```

### Testing Background Scripts

```ts
import backgroundScript from '@/entrypoints/background';
import { fakeBrowser } from 'wxt/testing';

describe('Background Script', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should initialize service worker', () => {
    // Run background script
    backgroundScript.main();
    
    // Get message listener from mock calls
    const listeners = fakeBrowser.runtime.onMessage.addListener.mock.calls;
    expect(listeners.length).toBeGreaterThan(0);
  });
});
```

### Testing Service Worker Lifecycle

```ts
it('should handle service worker lifecycle events', () => {
  // Execute background script
  backgroundScript.main();
  
  // Get lifecycle listeners from mock calls
  const startupListeners = fakeBrowser.runtime.onStartup.addListener.mock.calls;
  
  if (startupListeners.length > 0) {
    // Call the listener directly
    startupListeners[0][0]();
  }
  
  // Verify the expected behavior
  expect(StateManager.getInstance().initialize).toHaveBeenCalled();
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode during development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

## Testing Content Scripts

When testing content scripts, particularly those that interact with a page's DOM, keep these considerations in mind:

1. **Mock window and document properties**:
   Content scripts often read from window location and the DOM.

   ```typescript
   // Mock window.location
   vi.mock('global', () => ({
     location: {
       href: 'https://github.com/user/repo',
       pathname: '/user/repo'
     }
   }), { virtual: true });
   ```

2. **Test ContentScriptContext usage**:
   Content scripts receive a context object from WXT that handles lifecycle.

   ```typescript
   const mockContext = {
     isValid: true,
     isInvalid: false,
     addEventListener: vi.fn()
   };
   
   await contentScript.main(mockContext);
   expect(mockContext.addEventListener).toHaveBeenCalled();
   ```

3. **Test cleanup functions**:
   Content scripts should return a cleanup function that gets called when 
   the script is unloaded.

   ```typescript
   const cleanup = await contentScript.main(mockContext);
   cleanup();
   expect(stateManager.destroy).toHaveBeenCalled();
   ```

## Common Pitfalls to Avoid

- **Don't use `dispatch` methods on event objects** - fakeBrowser events should be tested by accessing the registered listeners directly through mock calls
- **Don't forget to reset fakeBrowser** before each test with `fakeBrowser.reset()`
- **Don't use unnecessary mocks** - fakeBrowser provides in-memory implementations of most browser APIs
- **Don't test implementation details** - focus on testing behavior and outputs
- **Mock DOM selectively** - only mock the parts of the DOM your component actually interacts with
- **Don't use real timers** - use `vi.useFakeTimers()` for predictable timer behavior

## Mocking WXT APIs

When mocking WXT-specific APIs, keep these tips in mind:

1. **Understand `#imports` resolution**:
   When you use `#imports` in your code, WXT resolves these to real paths during build and test time.
   To mock these imports correctly, you need to mock the actual paths:

   ```ts
   // If your code has:
   import { injectScript } from '#imports';
   
   // In your test, mock the actual path:
   vi.mock("wxt/utils/inject-script", () => ({
     injectScript: vi.fn()
   }));
   ```

2. **Look up real paths in `.wxt/types/imports-module.d.ts`**:
   This file contains mappings from `#imports` to real paths.

3. **Always run `wxt prepare`** before writing tests to ensure this file is generated.

## Next Steps

To improve test coverage, consider:

1. **Integration Tests** for key workflows, like:
   - The full analysis pipeline from user action to UI display
   - Message passing between background and content scripts

2. **E2E Tests** with Playwright to:
   - Test the extension in actual browser environments
   - Verify UI rendering and interaction
   - Test cross-browser compatibility
