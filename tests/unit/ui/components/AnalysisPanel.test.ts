import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AnalysisPanel } from '@/ui/components/AnalysisPanel';
import { StyleService } from '@/ui/services/StyleService';
import { DragService } from '@/ui/services/DragService';
import { StateManager } from '@/services/StateManager';
import { AnalysisResult } from '@/interfaces/analysis.interface';

// Track the panel's display state
const panelStyleState = {
  displayValue: '',
};

// Create mock close button with event handling
const mockCloseButton = {
  innerHTML: '✕',
  style: {},
  onclick: null,
  onmouseover: null,
  onmouseout: null,
};

// Create mock header bar that returns the close button when queried
const mockHeaderBar = {
  className: 'repo-evaluator-header',
  style: {},
  appendChild: vi.fn(),
  querySelector: vi.fn(() => mockCloseButton),
};

// Create mock content container
const mockContentContainer = {
  innerHTML: '',
  appendChild: vi.fn(),
  style: {},
};

// Create mock panel with proper style tracking
const mockPanel = {
  id: 'repo-evaluator-panel',
  style: {
    get display() {
      return panelStyleState.displayValue;
    },
    set display(value) {
      panelStyleState.displayValue = value;
    },
    cssText: '',
  },
  appendChild: vi.fn(),
  querySelector: vi.fn(() => mockCloseButton),
  remove: vi.fn(),
};

// Track element creation to return different elements
let elementCreationCount = 0;
const getNextElement = () => {
  elementCreationCount++;
  if (elementCreationCount === 1) return mockPanel;
  if (elementCreationCount === 2) return mockHeaderBar;
  if (elementCreationCount === 3)
    return {
      style: {},
      innerHTML: '',
      appendChild: vi.fn(),
    };
  if (elementCreationCount === 4) return mockCloseButton;
  if (elementCreationCount === 5) return mockContentContainer;
  return { style: {}, appendChild: vi.fn() };
};

// Mock document
const mockDocument = {
  getElementById: vi.fn(id => {
    if (id === 'repo-evaluator-panel') return mockPanel;
    return null;
  }),
  createElement: vi.fn(() => getNextElement()),
  body: {
    appendChild: vi.fn(),
  },
};

// Mock global document
vi.stubGlobal('document', mockDocument);

// Mock StyleService
const mockAddPanelStyles = vi.fn();
vi.mock('@/ui/services/StyleService', () => ({
  StyleService: {
    getInstance: vi.fn(() => ({
      addPanelStyles: mockAddPanelStyles,
    })),
  },
}));

// Mock DragService constructor
vi.mock('@/ui/services/DragService', () => ({
  DragService: vi.fn(),
}));

// Mock StateManager
const mockSetPanelVisibility = vi.fn().mockResolvedValue(undefined);
vi.mock('@/services/StateManager', () => ({
  StateManager: {
    getInstance: vi.fn(() => ({
      setPanelVisibility: mockSetPanelVisibility,
    })),
  },
}));

// Mock ScoreDisplay component
const mockSetScore = vi.fn();
const mockScoreAppendTo = vi.fn();
vi.mock('@/ui/components/ScoreDisplay', () => ({
  ScoreDisplay: vi.fn(() => ({
    setScore: mockSetScore,
    appendTo: mockScoreAppendTo,
  })),
}));

// Mock HealthIndicators component
const mockSetData = vi.fn();
const mockHealthAppendTo = vi.fn();
vi.mock('@/ui/components/HealthIndicators', () => ({
  HealthIndicators: vi.fn(() => ({
    setData: mockSetData,
    appendTo: mockHealthAppendTo,
  })),
}));

// Mock DetailedMetricsPanel component
const mockDetailedSetData = vi.fn();
const mockDetailedAppendTo = vi.fn();
vi.mock('@/ui/components/DetailedMetricsPanel', () => ({
  DetailedMetricsPanel: vi.fn(() => ({
    setData: mockDetailedSetData,
    appendTo: mockDetailedAppendTo,
  })),
}));

// Mock IconHelper
vi.mock('@/ui/helpers/IconHelper', () => ({
  IconHelper: {
    getSvgIconString: vi.fn().mockReturnValue('<svg></svg>'),
  },
}));

// Mock config
vi.mock('@/utils/config', () => ({
  DEBUG_MODE: false,
  errorLog: vi.fn(),
}));

// Create a mock AnalysisResult
const createMockAnalysisResult = (): AnalysisResult => ({
  repoName: 'test-repo',
  repoOwner: 'test-owner',
  repositoryId: 12345,
  repositoryUrl: 'https://github.com/test-owner/test-repo',
  description: 'Test repository description',
  score: '75.5',
  metrics: {
    popularity: { stars: 100, watchers: 50, forks: 30, score: '80' },
    activity: { commits: 200, lastCommit: '2023-01-01', score: '70' },
    community: { contributors: 5, issues: 10, score: '65' },
    maintenance: { openIssues: 5, closedIssues: 15, score: '85' },
    documentation: { readme: true, hasReadme: true, score: '90' },
  },
  insights: {
    strengths: ['Good documentation', 'Active community'],
    recommendations: ['Improve issue response time'],
  },
  repository: {
    name: 'test-repo',
    owner: { login: 'test-owner' },
    stargazers_count: 100,
    watchers_count: 50,
    forks_count: 30,
    open_issues_count: 5,
    description: 'Test repository description',
    url: 'https://github.com/test-owner/test-repo',
    created_at: '2022-01-01T00:00:00Z',
    updated_at: '2023-01-01T00:00:00Z',
    pushed_at: '2023-01-01T00:00:00Z',
  },
});

describe('AnalysisPanel', () => {
  let analysisPanel: AnalysisPanel;
  const closeCallback = vi.fn();

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Reset state
    elementCreationCount = 0;
    panelStyleState.displayValue = '';

    // Create panel instance
    analysisPanel = new AnalysisPanel(closeCallback);
  });

  it('should initialize StyleService and create panel elements', () => {
    // Verify StyleService was initialized
    expect(StyleService.getInstance).toHaveBeenCalled();
    expect(mockAddPanelStyles).toHaveBeenCalled();

    // Verify DragService was initialized
    expect(DragService).toHaveBeenCalled();
  });

  it('should append panel to DOM', () => {
    // Reset getElementById to return null (panel doesn't exist)
    document.getElementById = vi.fn().mockReturnValueOnce(null);

    analysisPanel.appendTo(document.body);
    expect(document.body.appendChild).toHaveBeenCalled();
  });

  it('should set data and populate panel', () => {
    const mockData = createMockAnalysisResult();
    analysisPanel.setData(mockData);

    // Verify content container was cleared
    expect(mockContentContainer.innerHTML).toBe('');

    // Verify score display was updated
    expect(mockSetScore).toHaveBeenCalledWith(parseFloat(mockData.score));
    expect(mockScoreAppendTo).toHaveBeenCalledWith(mockContentContainer);

    // Verify health indicators were updated
    expect(mockSetData).toHaveBeenCalledWith(mockData);
    expect(mockHealthAppendTo).toHaveBeenCalledWith(mockContentContainer);

    // Verify detailed metrics were updated
    expect(mockDetailedSetData).toHaveBeenCalledWith(mockData);
    expect(mockDetailedAppendTo).toHaveBeenCalledWith(mockContentContainer);
  });

  it('should handle close button click', () => {
    // Directly execute the onclick handler of the close button
    mockCloseButton.onclick?.({} as any);

    // Verify StateManager.setPanelVisibility was called
    expect(mockSetPanelVisibility).toHaveBeenCalledWith(false);

    // Verify closeCallback was called
    expect(closeCallback).toHaveBeenCalled();
  });

  it('should remove panel from DOM', () => {
    // Reset getElementById to return the mock panel
    document.getElementById = vi.fn().mockReturnValueOnce(mockPanel);

    analysisPanel.remove();

    // Verify getElementById was called with the panel ID
    expect(document.getElementById).toHaveBeenCalledWith('repo-evaluator-panel');

    // Verify panel.remove was called
    expect(mockPanel.remove).toHaveBeenCalled();
  });

  it('should control panel visibility', () => {
    // Directly test the methods that control visibility

    // Hide
    analysisPanel.hide();
    expect(panelStyleState.displayValue).toBe('none');

    // Show
    analysisPanel.show();
    expect(panelStyleState.displayValue).toBe('block');

    // Toggle to hide
    analysisPanel.toggle();
    expect(panelStyleState.displayValue).toBe('none');

    // Toggle to show
    analysisPanel.toggle();
    expect(panelStyleState.displayValue).toBe('block');
  });

  it('should not create multiple panels when appendTo is called multiple times', () => {
    // First append
    document.getElementById = vi.fn().mockReturnValueOnce(null); // Panel doesn't exist
    analysisPanel.appendTo(document.body);
    expect(document.body.appendChild).toHaveBeenCalled();

    // Reset mock
    vi.clearAllMocks();

    // Second append
    document.getElementById = vi.fn().mockReturnValueOnce(mockPanel); // Panel exists
    analysisPanel.appendTo(document.body);

    // Verify remove was called
    expect(mockPanel.remove).toHaveBeenCalled();

    // Verify appendChild was called again
    expect(document.body.appendChild).toHaveBeenCalled();
  });
});
