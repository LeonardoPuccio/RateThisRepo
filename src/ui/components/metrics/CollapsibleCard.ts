import { IconHelper } from '@ui/helpers/IconHelper';

// Define a type for valid icon names based on the IconHelper
type IconName = keyof typeof IconHelper['ICON_PATHS'];

/**
 * Reusable collapsible card component
 */
export class CollapsibleCard {
  private card: HTMLElement;
  private header: HTMLElement;
  private body: HTMLElement;
  private isCollapsed: boolean = false;

  /**
   * Create a new collapsible card
   * @param title Card title
   * @param content Card content element
   * @param icon Icon name from IconHelper
   * @param isCollapsedByDefault Whether card is initially collapsed
   */
  constructor(
    title: string, 
    content: HTMLElement, 
    icon: IconName,
    isCollapsedByDefault: boolean = false
  ) {
    this.isCollapsed = isCollapsedByDefault;
    
    // Create card container
    this.card = document.createElement('div');
    this.card.className = 'card';
    
    // Create header
    this.header = document.createElement('div');
    this.header.className = `card-header collapsible${this.isCollapsed ? ' collapsed' : ''}`;
    this.header.innerHTML = `${IconHelper.getSvgIconString(icon)} ${title}`;
    
    // Create content body
    this.body = document.createElement('div');
    this.body.className = 'card-body';
    this.body.style.display = this.isCollapsed ? 'none' : 'block';
    this.body.appendChild(content);
    
    // Set up toggle behavior
    this.header.onclick = this.toggle.bind(this);
    
    // Assemble card
    this.card.appendChild(this.header);
    this.card.appendChild(this.body);
  }

  /**
   * Toggle card collapse state
   */
  public toggle(): void {
    this.isCollapsed = !this.isCollapsed;
    this.header.classList.toggle('collapsed');
    this.body.style.display = this.isCollapsed ? 'none' : 'block';
  }

  /**
   * Collapse the card
   */
  public collapse(): void {
    if (!this.isCollapsed) {
      this.toggle();
    }
  }

  /**
   * Expand the card
   */
  public expand(): void {
    if (this.isCollapsed) {
      this.toggle();
    }
  }

  /**
   * Set card content
   * @param content New content element
   */
  public setContent(content: HTMLElement): void {
    this.body.innerHTML = '';
    this.body.appendChild(content);
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card;
  }
}