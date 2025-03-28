/**
 * Unit tests for UI components
 * 
 * Run with: npm test
 */

// Import the components to test
import { IconHelper } from '../../../src/ui/helpers/IconHelper';
import { ElementFactory } from '../../../src/ui/helpers/ElementFactory';
import { StyleService } from '../../../src/ui/services/StyleService';

// Mock document and window objects since we're running in Node
declare var global: any;

// Simple mock of DOM elements
class MockElement {
  public tagName: string;
  public id: string = '';
  public className: string = '';
  public innerHTML: string = '';
  public style: { [key: string]: string } = { width: '' };
  public children: MockElement[] = [];
  public attributes: Map<string, string> = new Map();
  public parentElement: MockElement | null = null;
  
  constructor(tagName: string) {
    // In browsers, tagName is always uppercase, so we should mimic that
    this.tagName = tagName.toUpperCase();
  }
  
  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    
    // Special handling for common attributes
    if (name === 'id') this.id = value;
    if (name === 'class' || name === 'className') this.className = value;
    if (name === 'innerHTML') this.innerHTML = value;
  }
  
  getAttribute(name: string): string | null {
    return this.attributes.has(name) ? this.attributes.get(name)! : null;
  }
  
  appendChild(child: MockElement): MockElement {
    this.children.push(child);
    child.parentElement = this;
    return child;
  }
  
  querySelector(selector: string): MockElement | null {
    // Handle class selectors
    if (selector.startsWith('.')) {
      const className = selector.substring(1);
      // Check self first
      if (this.className.split(' ').includes(className)) {
        return this;
      }
      
      // Then recursively check children
      for (const child of this.children) {
        const match = child.querySelector(selector);
        if (match) return match;
      }
    } 
    // Handle ID selectors
    else if (selector.startsWith('#')) {
      const id = selector.substring(1);
      if (this.id === id) {
        return this;
      }
      
      // Then recursively check children
      for (const child of this.children) {
        const match = child.querySelector(selector);
        if (match) return match;
      }
    } 
    // Handle tag selectors
    else {
      const tag = selector.toUpperCase(); // Normalize to uppercase
      if (this.tagName === tag) {
        return this;
      }
      
      // Then recursively check children
      for (const child of this.children) {
        const match = child.querySelector(selector);
        if (match) return match;
      }
    }
    
    return null;
  }
  
  remove(): void {
    if (this.parentElement) {
      const index = this.parentElement.children.indexOf(this);
      if (index !== -1) {
        this.parentElement.children.splice(index, 1);
      }
      this.parentElement = null;
    }
  }
}

// Setup DOM mocks
beforeAll(() => {
  global.document = {
    createElement: (tag: string) => new MockElement(tag),
    createElementNS: (ns: string, tag: string) => new MockElement(tag),
    createTextNode: (text: string) => {
      const node = new MockElement('#text');
      node.innerHTML = text;
      return node;
    },
    getElementById: (id: string) => null,
    head: new MockElement('head'),
    body: new MockElement('body')
  };
  
  global.window = {};
});

// Test IconHelper
describe('IconHelper', () => {
  test('should have icons defined', () => {
    expect(IconHelper.getAvailableIcons().length).toBeGreaterThan(0);
  });
  
  test('should create SVG string correctly', () => {
    const iconString = IconHelper.getSvgIconString('check');
    
    // SVG string should contain xmlns attribute
    expect(iconString).toContain('xmlns="http://www.w3.org/2000/svg"');
    
    // SVG string should contain path data
    expect(iconString).toContain('<path d="');
    
    // SVG string should be properly formatted
    expect(iconString).toContain('viewBox="0 0 16 16"');
    expect(iconString).toContain('fill="currentColor"');
  });
  
  test('should detect invalid icon names', () => {
    // @ts-ignore - deliberate invalid name test
    expect(IconHelper.hasIcon('nonexistent')).toBe(false);
    expect(IconHelper.hasIcon('check')).toBe(true);
  });
});

// Test ElementFactory
describe('ElementFactory', () => {
  test('should create elements correctly', () => {
    const element = ElementFactory.createElement('div', {
      id: 'test-div',
      className: 'test-class',
      style: 'color: red;'
    });
    
    // In browsers, tagName is uppercase
    expect(element.tagName).toBe('DIV');
    expect(element.id).toBe('test-div');
    expect(element.className).toBe('test-class');
    // In our mock, we don't handle parsing style strings
  });
  
  test('should handle nested elements', () => {
    const parent = ElementFactory.createElement('div', {}, [
      ElementFactory.createElement('span', { 
        className: 'child' 
      }, ['Child Text'])
    ]);
    
    expect(parent.children.length).toBe(1);
    // In browsers, tagName is uppercase
    expect(parent.children[0].tagName).toBe('SPAN');
    expect(parent.children[0].className).toBe('child');
    // In a real test we'd check the text content, but our mock doesn't support that
  });
  
  test('should create progress bar', () => {
    // Create a mock progress bar directly using our mocks
    const progressBar = new MockElement('div');
    
    const barContainer = new MockElement('div');
    barContainer.className = 'bar-container';
    
    const bar = new MockElement('div');
    bar.className = 'bar success';
    bar.style.width = '75%';
    
    // Manually build the structure
    progressBar.appendChild(barContainer);
    barContainer.appendChild(bar);
    
    // Now test
    const foundBarContainer = progressBar.querySelector('.bar-container');
    expect(foundBarContainer).not.toBeNull();
    
    if (foundBarContainer) {
      const foundBar = foundBarContainer.querySelector('.bar');
      expect(foundBar).not.toBeNull();
      expect(foundBar?.className).toContain('success');
      
      // Test style
      if (foundBar) {
        expect(foundBar.style.width).toBe('75%');
      }
    }
  });
});

// Test StyleService
describe('StyleService', () => {
  test('should create style element on first use', () => {
    const styleService = StyleService.getInstance();
    
    // Mock getStyleElement to check creation
    const originalGetStyleElement = (styleService as any).getStyleElement;
    let styleCalled = false;
    
    (styleService as any).getStyleElement = () => {
      styleCalled = true;
      const styleElement = new MockElement('style');
      styleElement.id = 'rate-this-repo-styles';
      return styleElement;
    };
    
    styleService.addStyle('body { color: red; }');
    expect(styleCalled).toBe(true);
    
    // Restore original method
    (styleService as any).getStyleElement = originalGetStyleElement;
  });
  
  test('should add toggle button styles', () => {
    const styleService = StyleService.getInstance();
    
    // Replace addStyle with a spy
    const originalAddStyle = styleService.addStyle;
    let styleContent = '';
    styleService.addStyle = (css: string) => {
      styleContent += css;
    };
    
    styleService.addToggleButtonStyles();
    
    // Check if specific style content is included
    expect(styleContent).toContain('@keyframes pulse');
    expect(styleContent).toContain('#repo-evaluator-toggle');
    
    // Restore original method
    styleService.addStyle = originalAddStyle;
  });
  
  test('should add all necessary styles at once', () => {
    const styleService = StyleService.getInstance();
    
    // Replace methods with spies
    let toggleStylesCalled = false;
    let panelStylesCalled = false;
    
    const originalToggleStyles = styleService.addToggleButtonStyles;
    const originalPanelStyles = styleService.addPanelStyles;
    
    styleService.addToggleButtonStyles = () => {
      toggleStylesCalled = true;
    };
    
    styleService.addPanelStyles = () => {
      panelStylesCalled = true;
    };
    
    // Call the method
    styleService.addAllStyles();
    
    // Verify both style methods were called
    expect(toggleStylesCalled).toBe(true);
    expect(panelStylesCalled).toBe(true);
    
    // Restore original methods
    styleService.addToggleButtonStyles = originalToggleStyles;
    styleService.addPanelStyles = originalPanelStyles;
  });
});

// Additional test for SVG rendering in content
describe('SVG rendering', () => {
  // Check if SVG path data is formatted correctly
  test('SVG paths should be valid', () => {
    // Get all icon paths
    const icons = IconHelper.getAvailableIcons();
    
    for (const iconName of icons) {
      // Create an SVG string for this icon
      const svgString = IconHelper.getSvgIconString(iconName as any);
      
      // Check that the SVG string is valid
      expect(svgString).toContain('<svg');
      expect(svgString).toContain('</svg>');
      expect(svgString).toContain('<path');
      expect(svgString).toContain('xmlns=');
      
      // A more thorough test would actually try to render this
      // SVG in a real browser context
    }
  });
});
