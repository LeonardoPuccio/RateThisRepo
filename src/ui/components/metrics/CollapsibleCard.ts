import { IconHelper } from '@/ui/helpers/IconHelper';

/**
 * Reusable collapsible card component
 */
export class CollapsibleCard {
  private element: HTMLElement;
  private header: HTMLElement;
  private body: HTMLElement;
  private isCollapsed: boolean = false;
  private titleContainer: HTMLElement;
  private titleText: HTMLElement;
  private iconSpan: HTMLElement;
  private chevron: HTMLElement;

  /**
   * Create a new collapsible card
   * @param title Title of the card
   * @param content HTML content to display in the card
   * @param icon Icon to display next to the title
   * @param isCollapsedByDefault Whether the card should be collapsed by default
   */
  constructor(
    title: string,
    content: HTMLElement,
    icon: string, // Use string type to match IconHelper's public methods
    isCollapsedByDefault: boolean = false
  ) {
    this.isCollapsed = isCollapsedByDefault;

    // Create main container with Tailwind classes
    this.element = document.createElement('div');
    this.element.className =
      'bg-white rounded-lg border border-gray-200 shadow-sm mb-4 overflow-hidden';

    // Create header with Tailwind classes
    this.header = document.createElement('div');
    this.header.className = `flex items-center justify-between py-3 px-4 bg-gray-50 cursor-pointer`;

    // Create title container with icon - store reference for toggling
    this.titleContainer = document.createElement('div');
    this.titleContainer.className = 'flex items-center text-black font-medium';

    // Insert icon - store reference (verify icon exists first)
    this.iconSpan = document.createElement('span');
    this.iconSpan.className = 'text-gray-700 mr-2 flex-shrink-0'; // Added flex-shrink-0 to prevent icon shrinking

    // Use the public method for getting SVG strings
    if (IconHelper.hasIcon(icon)) {
      this.iconSpan.innerHTML = IconHelper.getSvgIconString(icon);
    } else {
      console.warn(`Icon "${icon}" not found, using default icon`);
      this.iconSpan.innerHTML = IconHelper.getSvgIconString('repo'); // Default icon
    }

    // Add title text - store reference
    this.titleText = document.createElement('span');
    this.titleText.textContent = title;

    // Assemble title container
    this.titleContainer.appendChild(this.iconSpan);
    this.titleContainer.appendChild(this.titleText);

    // Create chevron for expand/collapse indicator
    this.chevron = document.createElement('span');
    this.chevron.className = 'transform transition-transform duration-200 flex-shrink-0';
    this.chevron.innerHTML = this.isCollapsed
      ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 01.53-.22h6.5a.75.75 0 01.53.22l.5.5a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.72 7.78a.75.75 0 010-1.06l.5-.5z"></path></svg>`
      : `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M7.22 11.22a.75.75 0 001.06 0l3.25-3.25a.75.75 0 000-1.06l-.5-.5a.75.75 0 00-1.06 0L7 9.38 4.03 6.41a.75.75 0 00-1.06 0l-.5.5a.75.75 0 000 1.06l3.25 3.25z"></path></svg>`;

    // Assemble header
    this.header.appendChild(this.titleContainer);
    this.header.appendChild(this.chevron);

    // Create content body with Tailwind classes
    this.body = document.createElement('div');
    this.body.className = 'py-3 px-4 bg-white';

    // Set initial state
    if (this.isCollapsed) {
      this.body.style.display = 'none';
    } else {
      this.header.classList.add('border-b', 'border-gray-200');
    }

    // Append content to body
    this.body.appendChild(content);

    // Add click event to header for toggling
    this.header.addEventListener('click', () => this.toggle());

    // Assemble card
    this.element.appendChild(this.header);
    this.element.appendChild(this.body);
  }

  /**
   * Toggle the card's collapsed state
   */
  public toggle(): void {
    this.isCollapsed = !this.isCollapsed;

    // Update content visibility
    if (this.isCollapsed) {
      this.body.style.display = 'none';
      this.header.classList.remove('border-b', 'border-gray-200');
    } else {
      this.body.style.display = 'block';
      this.header.classList.add('border-b', 'border-gray-200');
    }

    // Update ONLY the chevron - not modifying the title container!
    this.chevron.innerHTML = this.isCollapsed
      ? `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 01.53-.22h6.5a.75.75 0 01.53.22l.5.5a.75.75 0 010 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.72 7.78a.75.75 0 010-1.06l.5-.5z"></path></svg>`
      : `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path fill-rule="evenodd" d="M7.22 11.22a.75.75 0 001.06 0l3.25-3.25a.75.75 0 000-1.06l-.5-.5a.75.75 0 00-1.06 0L7 9.38 4.03 6.41a.75.75 0 00-1.06 0l-.5.5a.75.75 0 000 1.06l3.25 3.25z"></path></svg>`;
  }

  /**
   * Get the card's DOM element
   * @returns Card element
   */
  public getElement(): HTMLElement {
    return this.element;
  }

  /**
   * Set the card's collapsed state
   * @param collapsed Whether the card should be collapsed
   */
  public setCollapsed(collapsed: boolean): void {
    if (this.isCollapsed !== collapsed) {
      this.toggle();
    }
  }

  /**
   * Get whether the card is currently collapsed
   * @returns True if collapsed
   */
  public isCardCollapsed(): boolean {
    return this.isCollapsed;
  }
}
