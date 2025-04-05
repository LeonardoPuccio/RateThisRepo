# RateThisRepo Testing

This directory contains tests for the RateThisRepo extension using Vitest and WXT's testing utilities.

## Test Types

- **Unit Tests**: Tests for individual components and functions
- **Integration Tests**: (Future) Tests for interactions between components
- **E2E Tests**: (Future) End-to-end tests using Playwright

## Directory Structure

```
tests/
├── setup.ts                      # Global test setup
├── README.md                     # Documentation
├── unit/                         # Unit tests
│   ├── basic.test.ts             # Basic environment verification
│   ├── analysis/                 # Tests for analysis modules
│   │   └── insights/
│   │       └── StrengthsAnalyzer.test.ts
│   ├── core/                     # Tests for core browser features
│   │   └── browser-storage.test.ts
│   ├── services/                 # Tests for service modules
│   │   └── StorageService.test.ts
│   ├── ui/                       # Tests for UI components
│   └── utils/                    # Tests for utility functions
│       └── repository-analyzer.test.ts
├── integration/                  # Future integration tests
│   └── ...
└── e2e/                          # Future E2E tests
    └── ...
```

## Best Practices

### Configuration

- **Use Node environment** instead of JSDOM for simpler, more reliable testing
- **Be explicit** about which test files to include
- **Keep configuration minimal** to avoid introducing errors
- **Set up proper path aliases** that match your source code structure

### Setup File

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

- Use explicit interfaces instead of `any` for test data

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

// Use type assertions when necessary, but minimize them
const testMessage = createTestMessage(ACTIONS.GET_STATE) as ExtensionMessage;
```

- Use ReturnType for spy objects to maintain type safety:

```typescript
// Properly typed spy objects
let sendMessageSpy: ReturnType<typeof vi.spyOn>;
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

### Testing Messaging

When testing services that use browser messaging:

1. **Use vi.spyOn() to verify method calls**:

```ts
it('should send messages', async () => {
  // Create a spy on the browser API with proper typing
  const spy: ReturnType<typeof vi.spyOn> = vi.spyOn(fakeBrowser.runtime, 'sendMessage')
    .mockImplementation(() => Promise.resolve({ success: true }));
  
  // Call your service method
  const result = await myService.sendMessage({ action: 'TEST' });
  
  // Verify the browser API was called correctly
  expect(spy).toHaveBeenCalledWith({ action: 'TEST' });
  expect(result).toEqual({ success: true });
  
  // Restore the original implementation
  vi.restoreAllMocks();
});
```

2. **Mock implementations for async methods**:

```ts
// Some browser APIs will throw if called without proper listeners
// Use mockImplementation to provide test responses
beforeEach(() => {
  vi.spyOn(fakeBrowser.runtime, 'sendMessage')
    .mockImplementation(() => Promise.resolve({ success: true }));
});

afterEach(() => {
  vi.restoreAllMocks();
});
```

3. **Testing message handlers**:

```ts
it('should register message handlers', () => {
  const handler = vi.fn();
  
  // Register the handler through your service
  myService.registerHandler('TEST_ACTION', handler);
  
  // Test that registration doesn't throw
  expect(() => {
    myService.registerHandler('TEST_ACTION', handler);
    myService.unregisterHandler('TEST_ACTION', handler);
  }).not.toThrow();
  
  // Note: Directly testing handler execution is challenging because
  // we can't easily access the internal listener registered with fakeBrowser
});
```

4. **Handling typed messages**:

When testing services with strongly typed messaging:
- Create helper functions or interfaces for test messages 
- Use type assertions to convert between test types and your application types
- Create test-specific versions of your interfaces when needed for testing flexibility

```typescript
// From your tests:
interface TestMessage {
  action: string;
  data?: unknown;
}

// To create valid messages that work with your typed service:
const message = createTestMessage(ACTIONS.GET_STATE) as ExtensionMessage;
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

### Mocking Browser Events

To test code that handles browser events:

```ts
it('should handle storage changes', async () => {
  // Set up a handler in your code first
  myService.setupStorageWatcher();
  
  // Create a change object like what the browser would send
  const changes = {
    'someKey': { newValue: 'new value', oldValue: 'old value' }
  };
  
  // Get the listeners that were registered
  const storageListeners = fakeBrowser.storage.onChanged.addListener.mock.listeners;
  
  // If you can access the listeners, call them directly
  if (storageListeners && storageListeners.length > 0) {
    storageListeners[0](changes, 'local');
  }
  
  // Or manually trigger the event if supported by fakeBrowser
  // fakeBrowser.storage.local.set({ someKey: 'new value' });
  
  // Verify the expected behavior occurred
  expect(myService.wasUpdated).toBe(true);
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

## Adding New Tests

1. Create a test file in the appropriate test type directory with the same structure as the source file
2. Import `fakeBrowser` from `wxt/testing` if testing browser APIs
3. Import components using the same paths as in the source code (`@/path/to/component` or using the aliases `@/utils`, `@/services`, etc.)
4. Write test cases with descriptive names
5. Reset `fakeBrowser` between tests (automatically done in setup.ts)

## Common Pitfalls to Avoid

- **Don't use JSDOM** unless you specifically need DOM manipulation
- **Don't try to mock fakeBrowser** with Jest/Vitest mock methods like `mockResolvedValue` - use `vi.spyOn()` with `mockImplementation()` instead
- **Don't access internal properties** of fakeBrowser like `.mock.calls` - use spies to verify method calls
- **Don't forget to restore mocks** after tests with `vi.restoreAllMocks()`
- **Don't forget to reset fakeBrowser** between tests with `fakeBrowser.reset()`
- **Don't skip error handling** in tests that may throw exceptions
- **Avoid complex configurations** with unnecessary options
- **Don't try to mock everything** - use the real implementation when possible
- **Don't use `any` types** in tests - define proper interfaces and use type assertions when needed
- **Avoid unnecessary type assertions** - only use them at the boundaries between test code and application code
