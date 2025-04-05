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

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import { WxtVitest } from 'wxt/testing';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [WxtVitest()],
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['./tests/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '~': resolve(__dirname, './src'),
    },
  },
});
```

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
3. Import components using the same paths as in the source code (`@/path/to/component`)
4. Write test cases with descriptive names
5. Reset `fakeBrowser` between tests (automatically done in setup.ts)

## Common Pitfalls to Avoid

- Don't use JSDOM unless you specifically need DOM manipulation
- Avoid complex configurations with unnecessary options
- Don't try to mock everything - use the real implementation when possible
- Don't forget to reset state between tests
