# RateThisRepo Tests

This directory contains tests for the RateThisRepo Chrome extension.

## Structure

The test directory structure mirrors the source code structure:

```
tests/
├── unit/             # Unit tests for individual components
│   ├── utils/        # Tests for utility functions
│   │   ├── repository-analyzer.test.ts
│   │   ├── score-calculator.test.ts
│   │   └── github-api.test.ts
│   ├── analysis/     # Tests for analysis components
│   │   └── insights/ # Tests for insight generators
│   │       ├── strengths-analyzer.test.ts
│   │       └── recommendations-analyzer.test.ts
│   └── jest.setup.js # Global Chrome API mocking
├── integration/      # Tests for integration between components (future)
└── e2e/              # End-to-end tests (future)
```

## Running Tests

To run the tests:

```bash
npm run test
```

## Writing Tests

### Unit Tests

Unit tests should:
- Test a single function or class
- Mock external dependencies
- Be fast and independent
- Follow the Arrange-Act-Assert pattern

Example:

```typescript
describe('MyClass', () => {
  test('myMethod should return expected value', () => {
    // Arrange
    const instance = new MyClass();
    const input = 'test';
    
    // Act
    const result = instance.myMethod(input);
    
    // Assert
    expect(result).toBe('expected value');
  });
});
```

### Chrome API Mocking

The Chrome API is mocked globally in `jest.setup.js`. You can override specific mock implementations in your test files if needed:

```typescript
// Override chrome.storage.sync.get for this test
(chrome.storage.sync.get as jest.Mock).mockImplementation((key, callback) => {
  callback({ customKey: 'customValue' });
});
```

### Best Practices

1. **Test behaviors, not implementation details**
   Test what the code does, not how it does it. Focus on inputs and outputs.

2. **Use descriptive test names**
   Test names should describe the expected behavior in a readable form.

3. **One assertion per test**
   When possible, keep tests focused on testing one thing. This makes it easier to identify what failed.

4. **Arrange-Act-Assert pattern**
   Structure tests with clear separation between setup, execution, and verification.

5. **Use beforeEach for common setup**
   If multiple tests share the same setup, use `beforeEach` to avoid duplication.

6. **Keep tests independent**
   Tests should not depend on each other. Each test should be able to run on its own.

7. **Mock external dependencies**
   Use Jest's mocking capabilities to isolate the code being tested.

## Test Coverage

We aim for high test coverage, but focus on testing critical paths and complex logic rather than simple getters/setters.

To run tests with coverage:

```bash
npm run test -- --coverage
```
