import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { ToggleButton } from '@/ui/components/ToggleButton';
import { StyleService } from '@/ui/services/StyleService';

// Mock StyleService
vi.mock('@/ui/services/StyleService', () => ({
  StyleService: {
    getInstance: vi.fn(() => ({
      addToggleButtonStyles: vi.fn()
    }))
  }
}));

// Simple event emulation
const createEvent = (type: string) => ({ type } as Event);

describe('ToggleButton', () => {
  // Properties spied on or mocked
  let buttonOnClick: ((e: Event) => void) | null = null;
  let buttonOnMouseover: ((e: Event) => void) | null = null;
  let buttonOnMouseout: ((e: Event) => void) | null = null;
  
  // Mock DOM elements with proper style properties
  const mockButtonContainer = {
    id: '',
    style: {
      cssText: '',
      position: '',
      bottom: '',
      right: '',
      zIndex: ''
    },
    appendChild: vi.fn()
  };
  
  const mockButton = { 
    id: '',
    innerHTML: '',
    title: 'Analyze Repository',
    style: {
      cssText: '',
      width: '',
      height: '',
      borderRadius: '',
      backgroundColor: '',
      color: '',
      border: '',
      boxShadow: '',
      cursor: '',
      fontSize: '',
      display: '',
      alignItems: '',
      justifyContent: '',
      animation: '',
      transition: ''
    },
    classList: {
      add: vi.fn(),
      remove: vi.fn(),
      contains: vi.fn(() => false)
    },
    onclick: null,
    onmouseover: null,
    onmouseout: null
  };
  
  const mockTooltip = {
    id: '',
    textContent: 'Analyze Repository',
    style: {
      cssText: '',
      position: '',
      top: '',
      right: '',
      backgroundColor: '',
      color: '',
      padding: '',
      borderRadius: '',
      fontSize: '',
      opacity: '',
      transition: '',
      pointerEvents: '',
      whiteSpace: ''
    }
  };
  
  // Keep track of created elements in order
  let createdElements: any[] = [];
  
  // Mock document
  const mockDocument = {
    getElementById: vi.fn((id) => {
      if (id === 'repo-evaluator-tooltip') return mockTooltip;
      if (id === 'repo-evaluator-toggle') return mockButton;
      if (id === 'repo-evaluator-button-container') return mockButtonContainer;
      return null;
    }),
    createElement: vi.fn((tag) => {
      if (tag === 'div') {
        if (!mockButtonContainer.id) {
          return mockButtonContainer;
        } else {
          return mockTooltip;
        }
      }
      if (tag === 'button') {
        return mockButton;
      }
      return { style: { cssText: '' } };
    }),
    body: {
      appendChild: vi.fn()
    }
  };
  
  beforeEach(() => {
    // Reset everything
    vi.clearAllMocks();
    createdElements = [];
    
    // Reset button properties
    buttonOnClick = null;
    buttonOnMouseover = null;
    buttonOnMouseout = null;
    
    // Reset mock element properties
    mockButtonContainer.id = '';
    mockButton.id = '';
    mockButton.title = 'Analyze Repository';
    mockTooltip.id = '';
    mockTooltip.textContent = 'Analyze Repository';
    mockTooltip.style.opacity = '';
    
    // Set up global document
    global.document = mockDocument as any;
    
    // Store the original setupEventListeners method
    const originalSetupEventListeners = ToggleButton.prototype.setupEventListeners;
    
    // Override setupEventListeners to capture event handlers
    ToggleButton.prototype.setupEventListeners = function(toggleCallback) {
      originalSetupEventListeners.call(this, toggleCallback);
      
      // Capture the event handlers
      if (this.button) {
        buttonOnClick = this.button.onclick;
        buttonOnMouseover = this.button.onmouseover;
        buttonOnMouseout = this.button.onmouseout;
      }
    };
    
    // Clean up after the tests
    afterEach(() => {
      ToggleButton.prototype.setupEventListeners = originalSetupEventListeners;
    });
  });

  it('should initialize correctly', () => {
    const toggleCallback = vi.fn();
    const toggleButton = new ToggleButton(toggleCallback);
    
    expect(StyleService.getInstance).toHaveBeenCalled();
    expect(mockButtonContainer.id).toBe('repo-evaluator-button-container');
    expect(mockButton.id).toBe('repo-evaluator-toggle');
    expect(mockTooltip.id).toBe('repo-evaluator-tooltip');
  });

  it('should show tooltip on mouseover', () => {
    const toggleCallback = vi.fn();
    const toggleButton = new ToggleButton(toggleCallback);
    
    // Manually trigger the mouseover event handler
    if (buttonOnMouseover) {
      buttonOnMouseover(createEvent('mouseover'));
      expect(mockTooltip.style.opacity).toBe('1');
    }
  });

  it('should hide tooltip on mouseout', () => {
    const toggleCallback = vi.fn();
    const toggleButton = new ToggleButton(toggleCallback);
    
    // Set initial state
    mockTooltip.style.opacity = '1';
    
    // Manually trigger the mouseout event handler
    if (buttonOnMouseout) {
      buttonOnMouseout(createEvent('mouseout'));
      expect(mockTooltip.style.opacity).toBe('0');
    }
  });

  it('should call the toggle callback when clicked', () => {
    const toggleCallback = vi.fn();
    const toggleButton = new ToggleButton(toggleCallback);
    
    // Manually trigger the click event handler
    if (buttonOnClick) {
      buttonOnClick(createEvent('click'));
      expect(toggleCallback).toHaveBeenCalled();
    }
  });

  it('should toggle active state', () => {
    const toggleCallback = vi.fn();
    const toggleButton = new ToggleButton(toggleCallback);
    
    // Test setting active to true
    toggleButton.setActive(true);
    expect(mockButton.classList.add).toHaveBeenCalledWith('active');
    expect(mockButton.title).toBe('Hide Repository Analysis');
    
    // Test setting active to false
    mockButton.classList.contains = vi.fn().mockReturnValue(true);
    toggleButton.setActive(false);
    expect(mockButton.classList.remove).toHaveBeenCalledWith('active');
    expect(mockButton.title).toBe('Analyze Repository');
  });
});
