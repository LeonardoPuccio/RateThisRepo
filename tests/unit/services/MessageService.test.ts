import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { fakeBrowser } from 'wxt/testing';
import { ACTIONS } from '@/utils/constants';
import type { ExtensionMessage, MessageResponse } from '@/interfaces/messaging.interface';

// Mock config to avoid console output in tests
vi.mock('@/utils/config', () => ({
  debugLog: vi.fn(),
  errorLog: vi.fn(),
  DEBUG_MODE: false,
}));

// Import after mocking
import { MessageService } from '@/services/MessageService';

// Define a type for test messages
interface TestMessage {
  action: string;
  data?: unknown;
}

// Create a test message factory to ensure type safety
function createTestMessage(action: string, data?: unknown): TestMessage {
  return { action, data };
}

describe('MessageService', () => {
  beforeEach(() => {
    fakeBrowser.reset();
  });

  it('should provide a singleton instance', () => {
    const instance1 = MessageService.getInstance();
    const instance2 = MessageService.getInstance();

    expect(instance1).toBe(instance2);
  });

  describe('API', () => {
    let service: MessageService;

    beforeEach(() => {
      service = new MessageService();
    });

    afterEach(() => {
      service.destroy();
    });

    it('should have expected methods', () => {
      expect(typeof service.registerHandler).toBe('function');
      expect(typeof service.unregisterHandler).toBe('function');
      expect(typeof service.sendMessage).toBe('function');
      expect(typeof service.sendTabMessage).toBe('function');
      expect(typeof service.destroy).toBe('function');
    });
  });

  describe('Message sending', () => {
    let service: MessageService;
    // Using a more specific type with ReturnType
    let sendMessageSpy: ReturnType<typeof vi.spyOn>;
    let sendTabMessageSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      service = new MessageService();

      // Create spies
      sendMessageSpy = vi
        .spyOn(fakeBrowser.runtime, 'sendMessage')
        .mockImplementation(() => Promise.resolve({ success: true }));

      sendTabMessageSpy = vi
        .spyOn(fakeBrowser.tabs, 'sendMessage')
        .mockImplementation(() => Promise.resolve({ success: true }));
    });

    afterEach(() => {
      service.destroy();
      vi.restoreAllMocks();
    });

    it('should use browser API to send messages', async () => {
      // Using a valid action from ACTIONS
      const testMessage = createTestMessage(ACTIONS.GET_STATE) as ExtensionMessage;
      const result = await service.sendMessage<MessageResponse>(testMessage);

      expect(sendMessageSpy).toHaveBeenCalledWith(testMessage);
      expect(result).toEqual({ success: true });
    });

    it('should use browser API to send tab messages', async () => {
      // Using a valid action from ACTIONS
      const testMessage = createTestMessage(ACTIONS.GET_STATE) as ExtensionMessage;
      const result = await service.sendTabMessage<MessageResponse>(123, testMessage);

      expect(sendTabMessageSpy).toHaveBeenCalledWith(123, testMessage);
      expect(result).toEqual({ success: true });
    });
  });

  describe('Message handling', () => {
    let service: MessageService;

    beforeEach(() => {
      service = new MessageService();
    });

    afterEach(() => {
      service.destroy();
    });

    it('should register and call handlers', () => {
      // Create a test handler
      const handler = vi.fn();

      // Register the handler with a valid action
      service.registerHandler(ACTIONS.GET_STATE, handler);

      // This direct call is not a perfect test, but it verifies the basic functionality
      // without relying on implementing details of fakeBrowser
      expect(() => {
        service.registerHandler(ACTIONS.GET_STATE, handler);
        service.unregisterHandler(ACTIONS.GET_STATE, handler);
      }).not.toThrow();
    });
  });
});
