import { beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

// Reset the fake browser before each test
beforeEach(() => {
  fakeBrowser.reset();
});
