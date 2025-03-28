/**
 * Helper class for creating DOM elements
 */
export class ElementFactory {
  /**
   * Create an HTML element with optional attributes and children
   * @param tagName HTML tag name
   * @param attributes Attributes to set on the element
   * @param children Child elements or text content
   * @returns The created HTML element
   */
  public static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    attributes?: Record<string, string>,
    children?: (HTMLElement | string)[]
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    
    // Set attributes
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'style' && typeof value === 'string') {
          element.style.cssText = value;
        } else if (key === 'className') {
          element.className = value;
        } else {
          element.setAttribute(key, value);
        }
      });
    }
    
    // Add children
    if (children) {
      children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
    
    return element;
  }
  
  /**
   * Create a div element
   * @param className CSS class name
   * @param style Inline CSS style
   * @param children Child elements or text content
   * @returns The created div element
   */
  public static createDiv(
    className?: string,
    style?: string,
    children?: (HTMLElement | string)[]
  ): HTMLDivElement {
    return this.createElement('div', 
      { 
        className: className || '', 
        style: style || '' 
      }, 
      children
    );
  }
  
  /**
   * Create a button element
   * @param text Button text
   * @param className CSS class name
   * @param onClick Click event handler
   * @returns The created button element
   */
  public static createButton(
    text: string,
    className?: string,
    onClick?: (e: MouseEvent) => void
  ): HTMLButtonElement {
    const button = this.createElement('button', 
      { 
        className: className || '' 
      }, 
      [text]
    );
    
    if (onClick) {
      button.addEventListener('click', onClick);
    }
    
    return button;
  }
  
  /**
   * Create a tooltip element
   * @param text Tooltip text
   * @param element Element to attach tooltip to
   * @returns Element with tooltip
   */
  public static createTooltip(text: string, element?: HTMLElement): HTMLElement {
    const container = this.createElement('span', 
      { 
        className: 'tooltip-container' 
      }
    );
    
    // Create the tooltip text element
    const tooltip = this.createElement('span', 
      { 
        className: 'tooltip-text' 
      }, 
      [text]
    );
    
    if (element) {
      // If an element is provided, wrap it in the tooltip container
      container.appendChild(element);
    }
    container.appendChild(tooltip);
    
    return container;
  }
  
  /**
   * Create a progress bar
   * @param percentage Percentage value (0-100)
   * @param className Optional CSS class
   * @returns Progress bar element
   */
  public static createProgressBar(percentage: number, className?: string): HTMLElement {
    const barContainer = this.createElement('div', 
      { className: 'bar-container' }
    );
    
    const scorePercent = Math.min(100, Math.max(0, percentage));
    const scoreColorClass = scorePercent >= 80 ? 'success' : 
                           scorePercent >= 60 ? 'warning' : 'error';
    
    const bar = this.createElement('div', 
      { 
        className: `bar ${scoreColorClass} ${className || ''}`,
        style: `width: ${scorePercent}%` 
      }
    );
    
    barContainer.appendChild(bar);
    return barContainer;
  }
}
