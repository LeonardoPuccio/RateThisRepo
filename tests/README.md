# RateThisRepo Testing Documentation

This document provides an overview of the testing strategy for the RateThisRepo extension, particularly focusing on the WXT migration-related components.

## Test Structure

The tests are organized following the project's structure:

```
tests/
├── setup.ts                        # Test setup and environment configuration
├── unit/                           # Unit tests for individual components
│   ├── analysis/                   # Tests for analysis modules
│   ├── core/                       # Tests for core functionality 
│   ├── entrypoints/               # Tests for extension entrypoints
│   ├── services/                   # Tests for service modules
│   │   ├── MessageService.test.ts  # Tests for the message passing service
│   │   ├── StateManager.test.ts    # Tests for state management
│   │   ├── StorageService.test.ts  # Basic storage service tests
│   │   └── StorageServiceLifecycle.test.ts # Advanced lifecycle tests for storage
│   ├── ui/                         # Tests for UI components
│   │   ├── components/             # Tests for individual UI components
│   │   │   ├── AnalysisPanel.test.ts  # Tests for the main analysis panel
│   │   │   └── ToggleButton.test.ts   # Tests for the toggle button
│   │   ├── integration/            # Tests for UI integration aspects
│   │   │   ├── ShadowDomEvents.test.ts   # Tests for Shadow DOM event isolation
│   │   │   └── ShadowDomTailwind.test.ts # Tests for Shadow DOM + Tailwind integration
│   │   └── ThemeCompatibility.test.ts # Tests for GitHub theme compatibility
│   └── utils/                      # Tests for utility functions
└── basic.test.ts                   # Basic smoke tests
```

## Key Test Areas

### 1. Shadow DOM Integration

The Shadow DOM integration tests verify that:
- Shadow DOM is properly set up using WXT's `createShadowRootUi`
- Tailwind CSS classes are correctly applied within Shadow DOM
- Events are properly isolated to prevent leakage
- Wheel and scroll events are handled correctly for overlay UIs
- Content script context is used properly to prevent memory leaks

### 2. Service Worker Lifecycle

The service worker lifecycle tests ensure:
- State is persisted across service worker terminations
- Storage watchers are properly registered and cleaned up
- Error handling works correctly for storage operations
- The extension can handle large data objects without performance issues
- Lifecycle events (startup, suspend) are handled properly

### 3. Theme Compatibility

Theme compatibility tests verify that:
- UI components work correctly with GitHub's light theme
- UI components are compatible with dark theme
- UI components maintain accessibility with high contrast theme
- Responsive layout works across different screen sizes

### 4. State Management

State management tests verify:
- The StateManager functions as a singleton
- Events are properly emitted and handled
- State changes are persisted to storage
- Event listeners are properly cleaned up

## Running Tests

To run all tests:

```
pnpm test
```

To run a specific test file:

```
pnpm test tests/unit/ui/components/AnalysisPanel.test.ts
```

To run tests with coverage:

```
pnpm test:coverage
```

## Testing Best Practices

When writing tests for RateThisRepo, follow these guidelines:

1. **Test WXT-specific features**: Make sure to test WXT-specific APIs like `createShadowRootUi`, `cssInjectionMode`, and content script context.

2. **Mock WXT modules properly**: Always mock WXT modules before importing components that use them to avoid hoisting issues.

3. **Test Shadow DOM integration**: Shadow DOM is critical for proper UI isolation on GitHub pages.

4. **Verify Tailwind classes**: Use class name checks to ensure Tailwind utility classes are properly applied.

5. **Test cross-browser compatibility**: Though vitest runs in Node, write tests that would ensure compatibility across browsers.

6. **Clean up resources**: Ensure all tests clean up resources properly, especially event listeners and watchers.

7. **Test service worker lifecycle**: Verify that the extension handles service worker termination and restart correctly.

8. **Test UI across themes**: Ensure UI components work correctly with all GitHub themes.

## Testing WXT Components with Shadow DOM

Testing components that use WXT's Shadow DOM integration requires special considerations:

### Mocking Strategy

1. **Create Shared Mock References**: Define mock objects at the module level to ensure consistent references:

```javascript
// Create mock objects at the module level
const mockScoreDisplay = {
  setScore: vi.fn(),
  getElement: vi.fn(() => createElementMock())
};

// Use these in your mocks
vi.mock('@/ui/components/ScoreDisplay', () => ({
  ScoreDisplay: vi.fn().mockImplementation(() => mockScoreDisplay)
}));
```

2. **Properly Mock DOM Elements**: DOM element mocks need all the properties your component accesses:

```javascript
function createElementMock() {
  return {
    style: {
      position: '',
      top: '',
      zIndex: '',
      // Include all style properties used in your component
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn()
    },
    // Include all DOM properties and methods used
    appendChild: vi.fn(),
    innerHTML: '',
    // ... other properties
  };
}
```

3. **Mock ShadowRootUi**: Create a proper mock for WXT's shadow root UI:

```javascript
const mockShadowUi = {
  mount: vi.fn(),
  remove: vi.fn(),
  shadowHost: { style: { display: 'block' } }
};

vi.mock('wxt/utils/content-script-ui/shadow-root', () => ({
  createShadowRootUi: vi.fn().mockResolvedValue(mockShadowUi)
}));
```

### Testing Approach

For complex components like those using Shadow DOM, use an incremental testing approach:

1. **Start with Import Tests**: Verify that the component can be imported without errors:

```javascript
describe('Basic Import', () => {
  it('should import correctly', async () => {
    const { MyComponent } = await import('@/path/to/MyComponent');
    expect(MyComponent).toBeDefined();
  });
});
```

2. **Test Simple Methods First**: Test methods that don't require complex initialization:

```javascript
describe('Basic Methods', () => {
  // Test methods that don't rely on initialization
});
```

3. **Use Direct Property Injection**: For methods that require initialized state, inject the properties directly:

```javascript
describe('UI methods with mocked state', () => {
  beforeEach(() => {
    // @ts-ignore - setting private properties for testing
    component.ui = mockShadowUi;
  });
  
  it('should show correctly', () => {
    component.show();
    expect(mockShadowUi.shadowHost.style.display).toBe('block');
  });
});
```

4. **Test Critical Paths**: Focus on testing the most important functionality first.

### Testing Error Handling

To test error handling in components, especially when the actual implementation would throw errors before your checks:

1. **Method Mocking Approach**:

```javascript
// Save original method implementation
const originalMethod = component.someMethod;

// Create a mock that handles the error case first
// @ts-ignore - we're mocking the method
component.someMethod = vi.fn().mockImplementation((input) => {
  // Early validation
  if (!input) {
    mockErrorLog('ui', 'Error message');
    return;
  }
  // Call original implementation for valid inputs
  return originalMethod.call(component, input);
});

// Now test with invalid input
component.someMethod(null);
expect(mockErrorLog).toHaveBeenCalled();
```

2. **Handling TypeScript Errors**:

When testing components with TypeScript, you'll often need to use type assertions for accessing private members:

```typescript
// For accessing private properties
// @ts-ignore - accessing private property for testing
expect(component.privateProperty).toBeNull();

// For setting private properties
// @ts-ignore - setting private property for testing
component.privateProperty = mockValue;

// When passing known invalid values to test error handling
// @ts-ignore - deliberately passing null to test error handling
component.method(null);
```

This approach allows testing error paths while working around TypeScript's type checking.

### Handling Hoisting Issues

Vitest hoists `vi.mock()` calls to the top of the file, which can cause issues with variable initialization:

```javascript
// BAD: This will cause "Cannot access variable before initialization"
vi.mock('some-module', () => ({
  someFunction: () => mockVariable
}));
const mockVariable = { foo: 'bar' };

// GOOD: Define variables first, then use vi.mock()
const mockVariable = { foo: 'bar' };
vi.mock('some-module', () => ({
  someFunction: () => mockVariable
}));
```

### Testing DOM Manipulations

When testing methods that manipulate the DOM:

1. Use `Object.defineProperty` for complex properties:

```javascript
Object.defineProperty(element, 'innerHTML', {
  set: vi.fn(),
  get: vi.fn(() => '')
});
```

2. Store references to methods that might be nullified during the test:

```javascript
const removeChildMock = vi.fn();
// Use this reference in expectations even after the element is removed
```

## GitHub CI/CD Integration

Tests are automatically run on GitHub Actions for:
- Pull requests targeting the main branch
- Push to the main branch
- Manual workflow dispatch

The CI/CD pipeline runs tests with coverage reporting and ensures all tests pass before allowing merges.
