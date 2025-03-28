import { StyleService } from '../services/StyleService';

/**
 * ToggleButton component responsible for the floating action button
 * that toggles the analysis panel
 */
export class ToggleButton {
  private buttonContainer: HTMLDivElement;
  private button: HTMLButtonElement;
  private tooltip: HTMLDivElement;
  
  /**
   * Create a new toggle button
   * @param toggleCallback Function to call when button is clicked
   */
  constructor(toggleCallback: () => void) {
    // Initialize StyleService
    StyleService.getInstance().addToggleButtonStyles();
    
    // Create button container
    this.buttonContainer = document.createElement('div');
    this.buttonContainer.id = 'repo-evaluator-button-container';
    this.buttonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;
    
    // Create button
    this.button = document.createElement('button');
    this.button.id = 'repo-evaluator-toggle';
    this.button.innerHTML = '📊';
    this.button.title = 'Analyze Repository';
    this.button.style.cssText = `
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #2ea44f;
      color: white;
      border: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pulse 2s infinite;
      transition: all 0.3s ease;
    `;
    
    // Add tooltip that appears on hover
    this.tooltip = document.createElement('div');
    this.tooltip.id = 'repo-evaluator-tooltip';
    this.tooltip.textContent = 'Analyze Repository';
    this.tooltip.style.cssText = `
      position: absolute;
      top: -40px;
      right: 0;
      background-color: #24292e;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      white-space: nowrap;
    `;
    
    this.setupEventListeners(toggleCallback);
    
    // Append elements
    this.buttonContainer.appendChild(this.tooltip);
    this.buttonContainer.appendChild(this.button);
  }
  
  /**
   * Set up event listeners for the button
   * @param toggleCallback Function to call when button is clicked
   */
  private setupEventListeners(toggleCallback: () => void): void {
    // Show/hide tooltip on hover
    this.button.onmouseover = () => {
      this.tooltip.style.opacity = '1';
      this.tooltip.textContent = this.button.classList.contains('active') 
        ? 'Hide Repository Analysis' 
        : 'Analyze Repository';
    };
    
    this.button.onmouseout = () => {
      this.tooltip.style.opacity = '0';
    };
    
    // Set click handler
    this.button.onclick = toggleCallback;
  }
  
  /**
   * Add the button to the DOM
   */
  public appendTo(parent: HTMLElement = document.body): void {
    // Check if button already exists
    if (document.getElementById('repo-evaluator-toggle')) {
      return;
    }
    
    parent.appendChild(this.buttonContainer);
  }
  
  /**
   * Set the active state of the button
   * @param active Whether the button should be in active state
   */
  public setActive(active: boolean): void {
    if (active) {
      this.button.classList.add('active');
      this.button.title = 'Hide Repository Analysis';
    } else {
      this.button.classList.remove('active');
      this.button.title = 'Analyze Repository';
    }
  }
  
  /**
   * Toggle the active state of the button
   */
  public toggleActive(): void {
    this.setActive(!this.button.classList.contains('active'));
  }
}
