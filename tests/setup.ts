import { beforeEach, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Reset the fake browser before each test
beforeEach(() => {
  fakeBrowser.reset();
});

// Global mock for debug utilities to silence logs in all tests
vi.mock('@/utils/debug', () => ({
  debugLog: vi.fn(),
  errorLog: vi.fn(),
  logPerformance: vi.fn(),
  logUIState: vi.fn(),
}));
