import { beforeEach, describe, expect, it } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

describe('Browser Storage', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should store and retrieve values', async () => {
    await fakeBrowser.storage.local.set({ testKey: 'testValue' });
    const result = await fakeBrowser.storage.local.get('testKey');
    expect(result).toEqual({ testKey: 'testValue' });
  });
});
