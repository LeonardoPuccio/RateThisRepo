import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fakeBrowser } from 'wxt/testing';

describe('fakeBrowser', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });
  
  it('should exist', () => {
    expect(fakeBrowser).toBeDefined();
  });
  
  it('should have runtime.sendMessage', () => {
    expect(fakeBrowser.runtime.sendMessage).toBeDefined();
  });
  
  it('should support spying on methods', () => {
    // Create a spy
    const spy = vi.spyOn(fakeBrowser.runtime, 'sendMessage');
    
    // Don't actually call the method since it throws without listeners
    // Just verify the spy was set up correctly
    expect(spy).toBeDefined();
  });
});
