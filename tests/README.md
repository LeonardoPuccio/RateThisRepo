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
│       └── test-utils.ts           # Shared testing utilities
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

## Testing Utilities

The project provides standardized testing utilities in `tests/unit/utils/test-utils.ts` to help maintain consistent testing patterns:

### Private Member Access

```typescript
// Access a private property without @ts-expect-error
const ui = getPrivateMember(component, 'ui');

// Set a private property without @ts-expect-error
setPrivateMember(component, 'ui', mockUi);
```

### DOM Element Mocking

```typescript
// Set up standard DOM mocks
const { mockBody, mockCreateElement, createElement } = setupDomMocks();

// Shadow DOM mock helpers
const { mockShadowHost, mockShadowUi } = createShadowUiMock();
```

### Silent Logging

Logs are automatically silenced globally in tests through the `tests/setup.ts` file, which mocks the debug utilities module:

```typescript
// This is done globally in tests/setup.ts
vi.mock('@/utils/debug', () => ({
  debugLog: vi.fn(),
  errorLog: vi.fn(),
  logPerformance: vi.fn(),
  logUIState: vi.fn(),
}));
```

If you need to verify that certain logs were called in your tests:

```typescript
import { debugLog, errorLog } from '@/utils/debug';

// Your test
it('should log an error when invalid data is provided', () => {
  // Test your component
  component.processData(null);
  
  // Verify the error was logged with the correct parameters
  expect(errorLog).toHaveBeenCalledWith('component', 'Invalid data provided');
});
```

### Error Testing

```typescript
// Verify an error was logged with the expected parameters
expect(errorLog).toHaveBeenCalledWith('ui', 'Cannot set data: Invalid data provided');
```

## Vitest Module Hoisting

Remember that Vitest hoists `vi.mock()` calls to the top of the file, so define any variables used within mocks before they're referenced:

```typescript
// CORRECT: Define constants before using them in vi.mock()
const BUTTON_CLASSES = {
  ACTIVE: 'rtr-button-active',
  DEFAULT: 'rtr-button-default',
};

// Then use them in vi.mock()
vi.mock('@/ui/styles/button-animations', () => ({
  BUTTON_CLASSES,
}));
```

## GitHub CI/CD Integration

Tests are automatically run on GitHub Actions for:
- Pull requests targeting the main branch
- Push to the main branch
- Manual workflow dispatch

The CI/CD pipeline runs tests with coverage reporting and ensures all tests pass before allowing merges.
