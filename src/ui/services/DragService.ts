/**
 * Service to handle draggable elements
 */
export class DragService {
  private element: HTMLElement;
  private handle: HTMLElement;
  private isDragging: boolean = false;
  private offsetX: number = 0;
  private offsetY: number = 0;
  
  /**
   * Create a new drag service
   * @param element The element to make draggable
   * @param handle The handle element for dragging (if different from element)
   */
  constructor(element: HTMLElement, handle?: HTMLElement) {
    this.element = element;
    this.handle = handle || element;
    this.setupEventListeners();
  }
  
  /**
   * Set up event listeners for dragging
   */
  private setupEventListeners(): void {
    this.handle.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    
    // Add visual cue for draggable element
    this.handle.style.cursor = 'move';
    this.handle.style.userSelect = 'none';
  }
  
  /**
   * Handle mouse down event
   * @param e Mouse event
   */
  private onMouseDown(e: MouseEvent): void {
    this.isDragging = true;
    this.offsetX = e.clientX - this.element.getBoundingClientRect().left;
    this.offsetY = e.clientY - this.element.getBoundingClientRect().top;
    
    this.handle.style.cursor = 'grabbing';
  }
  
  /**
   * Handle mouse move event
   * @param e Mouse event
   */
  private onMouseMove(e: MouseEvent): void {
    if (!this.isDragging) return;
    
    const left = e.clientX - this.offsetX;
    const top = e.clientY - this.offsetY;
    
    this.element.style.left = left + 'px';
    this.element.style.right = 'auto';
    this.element.style.top = top + 'px';
  }
  
  /**
   * Handle mouse up event
   */
  private onMouseUp(): void {
    if (this.isDragging) {
      this.isDragging = false;
      this.handle.style.cursor = 'move';
    }
  }
  
  /**
   * Disable dragging
   */
  public disable(): void {
    this.handle.removeEventListener('mousedown', this.onMouseDown.bind(this));
    this.handle.style.cursor = 'default';
  }
  
  /**
   * Enable dragging
   */
  public enable(): void {
    this.handle.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.handle.style.cursor = 'move';
  }
}