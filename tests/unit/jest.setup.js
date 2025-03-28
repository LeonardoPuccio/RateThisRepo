// Mock the Chrome API
global.chrome = {
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    sendMessage: jest.fn(),
    onInstalled: {
      addListener: jest.fn()
    },
    openOptionsPage: jest.fn()
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn()
    }
  }
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
