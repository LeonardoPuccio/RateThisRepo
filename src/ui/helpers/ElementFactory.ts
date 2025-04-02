/**
 * Helper class for creating DOM elements
 */
export class ElementFactory {
  /**
   * Create a new DOM element with properties
   * @param tagName HTML tag name
   * @param options Element options
   * @returns HTML element
   */
  public static createElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K,
    options: {
      className?: string;
      id?: string;
      style?: Partial<CSSStyleDeclaration> | string;
      attributes?: Record<string, string>;
      innerHTML?: string;
      textContent?: string;
      children?: Array<HTMLElement | Text | string>;
      onclick?: (e: MouseEvent) => void;
      onmouseover?: (e: MouseEvent) => void;
      onmouseout?: (e: MouseEvent) => void;
    } = {}
  ): HTMLElementTagNameMap[K] {
    // Create element
    const element = document.createElement(tagName);
    
    // Set class
    if (options.className) {
      element.className = options.className;
    }
    
    // Set ID
    if (options.id) {
      element.id = options.id;
    }
    
    // Set style
    if (options.style) {
      if (typeof options.style === 'string') {
        element.style.cssText = options.style;
      } else {
        Object.assign(element.style, options.style);
      }
    }
    
    // Set attributes
    if (options.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        element.setAttribute(key, value);
      }
    }
    
    // Set content
    if (options.innerHTML !== undefined) {
      element.innerHTML = options.innerHTML;
    } else if (options.textContent !== undefined) {
      element.textContent = options.textContent;
    }
    
    // Add children
    if (options.children) {
      options.children.forEach(child => {
        if (typeof child === 'string') {
          element.appendChild(document.createTextNode(child));
        } else {
          element.appendChild(child);
        }
      });
    }
    
    // Add event listeners
    if (options.onclick) {
      element.addEventListener('click', options.onclick);
    }
    if (options.onmouseover) {
      element.addEventListener('mouseover', options.onmouseover);
    }
    if (options.onmouseout) {
      element.addEventListener('mouseout', options.onmouseout);
    }
    
    return element;
  }
  
  /**
   * Create a container div with children
   * @param children Child elements
   * @param className Optional class name
   * @returns Container div element
   */
  public static createContainer(
    children: Array<HTMLElement | Text | string>,
    className?: string
  ): HTMLDivElement {
    return this.createElement('div', {
      className,
      children
    });
  }
  
  /**
   * Create a simple text element
   * @param text Text content
   * @param options Element options
   * @returns Span element
   */
  public static createText(
    text: string,
    options: {
      className?: string;
      style?: Partial<CSSStyleDeclaration> | string;
    } = {}
  ): HTMLSpanElement {
    return this.createElement('span', {
      textContent: text,
      className: options.className,
      style: options.style
    });
  }
  
  /**
   * Create a button element
   * @param text Button text
   * @param onClick Click handler
   * @param options Element options
   * @returns Button element
   */
  public static createButton(
    text: string,
    onClick: (e: MouseEvent) => void,
    options: {
      className?: string;
      style?: Partial<CSSStyleDeclaration> | string;
    } = {}
  ): HTMLButtonElement {
    return this.createElement('button', {
      textContent: text,
      className: options.className,
      style: options.style,
      onclick: onClick
    });
  }
}