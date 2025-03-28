import { AnalysisResult } from '../../interfaces/analysis.interface';
import { StyleService } from '../services/StyleService';
import { DragService } from '../services/DragService';
import { DetailedMetricsPanel } from './DetailedMetricsPanel';
import { HealthIndicators } from './HealthIndicators';
import { ScoreDisplay } from './ScoreDisplay';
import { IconHelper } from '../helpers/IconHelper';

// Debug mode flag - set to true only during development
const DEBUG_MODE = false;

/**
 * AnalysisPanel component responsible for showing analysis results
 */
export class AnalysisPanel {
  // Using definite assignment assertion (!) to tell TypeScript these will be initialized
  private panel!: HTMLElement;
  private contentContainer!: HTMLElement;
  private headerBar!: HTMLElement;
  private dragService: DragService;
  private scoreDisplay!: ScoreDisplay;
  private healthIndicators!: HealthIndicators;
  private detailedMetricsPanel!: DetailedMetricsPanel;
  
  /**
   * Create a new analysis panel
   */
  constructor() {
    // Initialize StyleService
    StyleService.getInstance().addPanelStyles();
    
    // Create panel elements
    this.createPanelElements();
    
    // Setup drag functionality
    this.dragService = new DragService(this.panel, this.headerBar);
  }
  
  /**
   * Create panel elements
   */
  private createPanelElements(): void {
    // Create container with direct DOM manipulation
    this.panel = document.createElement('div');
    this.panel.id = 'repo-evaluator-panel';
    this.panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 80%;
      max-width: 800px;
      max-height: 90vh;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.2);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
      overflow: hidden;
      color: #24292e;
    `;
    
    // Create header/title bar for dragging
    this.headerBar = document.createElement('div');
    this.headerBar.className = 'repo-evaluator-header';
    this.headerBar.style.cssText = `
      padding: 12px 15px;
      background-color: #f6f8fa;
      border-bottom: 1px solid #e1e4e8;
      border-radius: 8px 8px 0 0;
      cursor: move;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
    `;
    
    // Create title for the header
    const headerTitle = document.createElement('div');
    headerTitle.style.cssText = `
      font-weight: 600;
      font-size: 14px;
      color: #24292e;
      display: flex;
      align-items: center;
    `;
    
    // Add icon to title
    headerTitle.innerHTML = `
      ${IconHelper.getSvgIconString('repo')}
      <span style="margin-left: 8px;">RateThisRepo Analysis</span>
    `;
    this.headerBar.appendChild(headerTitle);
    
    // Add a close button
    const closeBtn = document.createElement('div');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      width: 24px;
      height: 24px;
      font-size: 18px;
      line-height: 24px;
      text-align: center;
      cursor: pointer;
      color: #586069;
      background: rgba(240, 240, 240, 0.8);
      border-radius: 50%;
      transition: all 0.2s ease;
    `;
    
    closeBtn.onmouseover = () => {
      closeBtn.style.backgroundColor = '#e0e0e0';
      closeBtn.style.color = '#24292e';
    };
    
    closeBtn.onmouseout = () => {
      closeBtn.style.backgroundColor = 'rgba(240, 240, 240, 0.8)';
      closeBtn.style.color = '#586069';
    };
    
    // Set close button behavior
    closeBtn.onclick = () => {
      this.hide();
      // Update toggle button state
      const toggleButton = document.getElementById('repo-evaluator-toggle');
      if (toggleButton) {
        toggleButton.classList.remove('active');
        toggleButton.title = 'Show Repository Analysis';
      }
    };
    
    this.headerBar.appendChild(closeBtn);
    
    // Add header to panel
    this.panel.appendChild(this.headerBar);
    
    // Create content container with separate scrolling
    this.contentContainer = document.createElement('div');
    this.contentContainer.style.cssText = `
      width: 100%;
      height: calc(100% - 48px); /* Subtract header height */
      max-height: calc(90vh - 48px);
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    `;
    
    this.panel.appendChild(this.contentContainer);
    
    // Initialize sub-components with debug mode
    this.scoreDisplay = new ScoreDisplay();
    this.healthIndicators = new HealthIndicators();
    this.detailedMetricsPanel = new DetailedMetricsPanel(DEBUG_MODE);
  }
  
  /**
   * Populate the panel with analysis data
   * @param resultData Analysis results to display
   */
  public setData(resultData: AnalysisResult): void {
    // Clear previous content
    this.contentContainer.innerHTML = '';
    
    // Create a header with repository title
    const header = document.createElement('div');
    header.innerHTML = `
      <h2>
        ${IconHelper.getSvgIconString('repo')}
        Repository Analysis: ${resultData.repoName}
      </h2>
    `;
    this.contentContainer.appendChild(header);
    
    // Description
    const description = document.createElement('div');
    description.className = 'info';
    description.style.fontStyle = 'italic';
    description.textContent = resultData.description || 'No description provided';
    this.contentContainer.appendChild(description);
    
    // Add score display
    this.scoreDisplay.setScore(parseFloat(resultData.score));
    this.scoreDisplay.appendTo(this.contentContainer);
    
    // Add health indicators
    this.healthIndicators.setData(resultData);
    this.healthIndicators.appendTo(this.contentContainer);
    
    // Add detailed metrics panel
    this.detailedMetricsPanel.setData(resultData);
    this.detailedMetricsPanel.appendTo(this.contentContainer);
    
    // Add footer with disclaimer
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
      <p>⚠️ Note: This is an automated evaluation based on repository metrics.</p>
      <p>For a complete assessment, also consider code quality, community engagement, and the project's specific goals.</p>
    `;
    
    this.contentContainer.appendChild(footer);
  }
  
  /**
   * Add the panel to the DOM
   */
  public appendTo(parent: HTMLElement = document.body): void {
    // Remove any existing panel
    this.remove();
    
    // Add to page
    parent.appendChild(this.panel);
  }
  
  /**
   * Remove the panel from the DOM
   */
  public remove(): void {
    const existingPanel = document.getElementById('repo-evaluator-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
  }
  
  /**
   * Show the panel
   */
  public show(): void {
    this.panel.style.display = 'block';
  }
  
  /**
   * Hide the panel
   */
  public hide(): void {
    this.panel.style.display = 'none';
  }
  
  /**
   * Toggle the panel visibility
   */
  public toggle(): void {
    if (this.panel.style.display === 'none') {
      this.show();
    } else {
      this.hide();
    }
  }
}
