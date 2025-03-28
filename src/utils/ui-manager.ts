import { AnalysisResult, ScoreCategory } from '../interfaces/analysis.interface';

/**
 * Manages UI elements for the repository analysis
 */
export class UIManager {
  /**
   * Add the toggle button to the GitHub interface
   * @param toggleCallback Function to call when button is clicked
   */
  public static addToggleButton(toggleCallback: () => void): void {
    // Check if button already exists
    if (document.getElementById('repo-evaluator-toggle')) {
      return;
    }
    
    // Add styles
    this.addStyles();
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'repo-evaluator-button-container';
    buttonContainer.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
    `;
    
    // Create button
    const button = document.createElement('button');
    button.id = 'repo-evaluator-toggle';
    button.innerHTML = '📊';
    button.title = 'Analyze Repository';
    button.style.cssText = `
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
    const tooltip = document.createElement('div');
    tooltip.id = 'repo-evaluator-tooltip';
    tooltip.textContent = 'Analyze Repository';
    tooltip.style.cssText = `
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
    
    // Show/hide tooltip on hover
    button.onmouseover = () => {
      tooltip.style.opacity = '1';
      tooltip.textContent = button.classList.contains('active') 
        ? 'Hide Repository Analysis' 
        : 'Analyze Repository';
    };
    button.onmouseout = () => {
      tooltip.style.opacity = '0';
    };
    
    // Set click handler
    button.onclick = toggleCallback;
    
    // Append everything
    buttonContainer.appendChild(tooltip);
    buttonContainer.appendChild(button);
    document.body.appendChild(buttonContainer);
  }
  
  /**
   * Add CSS styles to the page
   */
  public static addStyles(): void {
    if (document.getElementById('rate-this-repo-styles')) {
      return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'rate-this-repo-styles';
    styleElement.textContent = `
      @keyframes pulse {
        0% {
          box-shadow: 0 0 0 0 rgba(46, 164, 79, 0.7);
          transform: scale(1);
        }
        50% {
          box-shadow: 0 0 0 10px rgba(46, 164, 79, 0);
          transform: scale(1.05);
        }
        100% {
          box-shadow: 0 0 0 0 rgba(46, 164, 79, 0);
          transform: scale(1);
        }
      }
      #repo-evaluator-toggle:hover {
        background-color: #2c974b;
        transform: scale(1.1);
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
      }
      #repo-evaluator-toggle.active {
        background-color: #d73a49;
        animation: none;
      }
      #repo-evaluator-toggle.active:hover {
        background-color: #cb2431;
      }
      
      #repo-evaluator-panel {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
        color: #24292e;
        line-height: 1.5;
      }
      #repo-evaluator-panel h2 {
        margin-top: 25px;
        margin-bottom: 15px;
        font-size: 20px;
        font-weight: 600;
        border-bottom: 1px solid #eaecef;
        padding-bottom: 8px;
        display: flex;
        align-items: center;
      }
      #repo-evaluator-panel h2 svg, #repo-evaluator-panel h2 span {
        margin-right: 8px;
      }
      #repo-evaluator-panel .bar-container {
        width: 100%;
        background-color: #eee;
        border-radius: 4px;
        height: 14px;
        margin: 8px 0;
      }
      #repo-evaluator-panel .bar {
        height: 100%;
        border-radius: 4px;
      }
      #repo-evaluator-panel .bar.success { background-color: #2cba00; }
      #repo-evaluator-panel .bar.warning { background-color: #f1c40f; }
      #repo-evaluator-panel .bar.error { background-color: #e74c3c; }
      #repo-evaluator-panel .success { color: #2cba00; }
      #repo-evaluator-panel .warning { color: #f1c40f; }
      #repo-evaluator-panel .error { color: #e74c3c; }
      #repo-evaluator-panel .info { color: #0366d6; }
      #repo-evaluator-panel .indicator {
        display: flex;
        align-items: center;
        margin: 8px 0;
        padding: 12px 16px;
        border-radius: 4px;
        background-color: #f6f8fa;
      }
      #repo-evaluator-panel .indicator svg {
        margin-right: 10px;
        flex-shrink: 0;
        width: 16px;
        height: 16px;
      }
      #repo-evaluator-panel .card {
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        margin: 16px 0;
        overflow: hidden;
      }
      #repo-evaluator-panel .card-header {
        background-color: #f6f8fa;
        padding: 12px 16px;
        font-weight: 600;
        border-bottom: 1px solid #e1e4e8;
        display: flex;
        align-items: center;
      }
      #repo-evaluator-panel .card-header svg {
        margin-right: 8px;
      }
      #repo-evaluator-panel .card-body {
        padding: 16px;
      }
      #repo-evaluator-panel .collapsible {
        cursor: pointer;
      }
      #repo-evaluator-panel .collapsible:after {
        content: '▼';
        float: right;
        font-size: 13px;
        color: #586069;
        margin-left: 5px;
      }
      #repo-evaluator-panel .collapsible.collapsed:after {
        content: '▶';
      }
      #repo-evaluator-panel ul {
        margin-top: 8px;
        margin-bottom: 8px;
        padding-left: 30px;
      }
      #repo-evaluator-panel .score-row {
        display: flex;
        margin: 12px 0;
        align-items: center;
      }
      #repo-evaluator-panel .score-label {
        width: 120px;
        font-weight: 600;
      }
      #repo-evaluator-panel .score-bar {
        flex-grow: 1;
        margin: 0 15px;
      }
      #repo-evaluator-panel .score-value {
        width: 60px;
        text-align: right;
      }
      #repo-evaluator-panel .score-desc {
        font-size: 13px;
        color: #586069;
        margin-left: 120px;
        margin-top: 2px;
      }
      #repo-evaluator-panel .insights-container {
        display: flex;
        flex-wrap: wrap;
        gap: 16px;
        margin-top: 16px;
      }
      #repo-evaluator-panel .insights-column {
        flex: 1;
        min-width: 300px;
      }
      #repo-evaluator-panel .footer {
        margin-top: 30px;
        padding-top: 16px;
        border-top: 1px solid #eaecef;
        font-size: 12px;
        color: #586069;
      }
      #repo-evaluator-panel li {
        margin: 8px 0;
        font-weight: 400;
      }
      #repo-evaluator-panel table {
        width: 100%;
        border-collapse: collapse;
      }
      #repo-evaluator-panel table td {
        padding: 6px 8px;
        border-bottom: 1px solid #eaecef;
      }
      #repo-evaluator-panel table tr:last-child td {
        border-bottom: none;
      }
      /* Tooltip styles - with dotted underline approach */
      #repo-evaluator-panel .tooltip-container {
        position: relative;
        display: inline;
        border-bottom: 1px dotted #6c757d;
        cursor: help;
      }
      #repo-evaluator-panel .tooltip-text {
        visibility: hidden;
        position: absolute;
        width: 250px;
        background: rgba(33, 37, 41, 0.9);
        color: #fff;
        border-radius: 4px;
        padding: 8px 12px;
        font-size: 12px;
        line-height: 1.5;
        z-index: 1000;
        bottom: 135%;
        left: 0%;
        transform: translateX(0%);
        opacity: 0;
        transition: opacity 0.3s;
        pointer-events: none;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        font-weight: normal;
        text-align: center;
      }
      #repo-evaluator-panel .tooltip-text::after {
        content: "";
        position: absolute;
        top: 100%;
        left: 10%;
        margin-left: -5px;
        border-width: 5px;
        border-style: solid;
        border-color: rgba(33, 37, 41, 0.9) transparent transparent transparent;
      }
      #repo-evaluator-panel .tooltip-container:hover .tooltip-text {
        visibility: visible;
        opacity: 1;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  /**
   * Create a visual output container for UI display
   */
  public static createOutputUI(): HTMLElement {
    // Remove any existing evaluation panel
    const existingPanel = document.getElementById('repo-evaluator-panel');
    if (existingPanel) {
      existingPanel.remove();
    }
    
    // Create container
    const panel = document.createElement('div');
    panel.id = 'repo-evaluator-panel';
    panel.style.cssText = `
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
    const headerBar = document.createElement('div');
    headerBar.className = 'repo-evaluator-header';
    headerBar.style.cssText = `
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="margin-right: 8px;">
        <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
      </svg>
      <span>RateThisRepo Analysis</span>
    `;
    headerBar.appendChild(headerTitle);
    
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
      panel.remove();
      const toggleButton = document.getElementById('repo-evaluator-toggle');
      if (toggleButton) {
        toggleButton.classList.remove('active');
        toggleButton.title = 'Show Repository Analysis';
      }
    };
    headerBar.appendChild(closeBtn);
    
    // Add header to panel
    panel.appendChild(headerBar);
    
    // Create content container with separate scrolling
    const contentContainer = document.createElement('div');
    contentContainer.style.cssText = `
      width: 100%;
      height: calc(100% - 48px); /* Subtract header height */
      max-height: calc(90vh - 48px);
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
    `;
    panel.appendChild(contentContainer);
    
    // Add drag functionality - only to the header
    let isDragging = false;
    let offsetX = 0, offsetY = 0;
    
    headerBar.addEventListener('mousedown', function(e) {
      isDragging = true;
      offsetX = e.clientX - panel.getBoundingClientRect().left;
      offsetY = e.clientY - panel.getBoundingClientRect().top;
      
      headerBar.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      
      const left = e.clientX - offsetX;
      const top = e.clientY - offsetY;
      
      panel.style.left = left + 'px';
      panel.style.right = 'auto';
      panel.style.top = top + 'px';
    });
    
    document.addEventListener('mouseup', function() {
      if (isDragging) {
        isDragging = false;
        headerBar.style.cursor = 'move';
      }
    });
    
    // Add to page
    document.body.appendChild(panel);
    
    return contentContainer;
  }
  
  /**
   * Display the analysis results in the UI
   * @param resultData Analysis results to display
   * @returns The panel element
   */
  public static displayAnalysisPanel(resultData: AnalysisResult): HTMLElement {
    // Create UI output element
    const outputElement = this.createOutputUI();
    
    // Fill the panel with analysis data
    this.populateAnalysisPanel(outputElement, resultData);
    
    // Return the panel so we can reference it later
    return document.getElementById('repo-evaluator-panel') as HTMLElement;
  }
  
  /**
   * Populate the analysis panel with data
   * @param container The container element
   * @param resultData Analysis results to display
   */
  private static populateAnalysisPanel(container: HTMLElement, resultData: AnalysisResult): void {
    // Helper function for creating SVG icons
    function createSvgIcon(path: string, viewBox = "0 0 16 16"): SVGElement {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "16");
      svg.setAttribute("height", "16");
      svg.setAttribute("viewBox", viewBox);
      svg.setAttribute("fill", "currentColor");
      
      const pathElement = document.createElementNS("http://www.w3.org/2000/svg", "path");
      pathElement.setAttribute("d", path);
      svg.appendChild(pathElement);
      
      return svg;
    }
    
    // SVG paths for icons
    const icons = {
      chart: "M16 14v1H0V0h1v14h15ZM5 13H3V8h2v5Zm4 0H7V3h2v10Zm4 0h-2V6h2v7Z",
      check: "M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z",
      x: "M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.749.749 0 0 1 1.275.326.749.749 0 0 1-.215.734L9.06 8l3.22 3.22a.749.749 0 0 1-.326 1.275.749.749 0 0 1-.734-.215L8 9.06l-3.22 3.22a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z",
      star: "M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z",
      insights: "M8 1.5c-2.363 0-4 1.69-4 3.75 0 .984.424 1.625.984 2.304l.214.253c.223.264.47.556.673.848.284.411.537.896.621 1.49a.75.75 0 0 1-1.484.211c-.04-.282-.163-.547-.37-.847a8.456 8.456 0 0 0-.542-.68c-.084-.1-.173-.205-.268-.32C3.201 7.75 2.5 6.766 2.5 5.25 2.5 2.31 4.863 0 8 0s5.5 2.31 5.5 5.25c0 1.516-.701 2.5-1.328 3.259-.095.115-.184.22-.268.319-.207.245-.383.453-.541.681-.208.3-.33.565-.37.847a.75.75 0 0 1-1.485-.212c.084-.593.337-1.078.621-1.489.203-.292.45-.584.673-.848l.214-.253c.56-.679.984-1.32.984-2.304 0-2.06-1.637-3.75-4-3.75ZM5.75 12h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1 0-1.5ZM6 15.25a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75Z",
      calendar: "M4.75 0a.75.75 0 0 1 .75.75V2h5V.75a.75.75 0 0 1 1.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0 1 13.25 16H2.75A1.75 1.75 0 0 1 1 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 0 1 4.75 0ZM2.5 7.5v6.75c0 .138.112.25.25.25h10.5a.25.25 0 0 0 .25-.25V7.5Zm10.75-4H2.75a.25.25 0 0 0-.25.25V6h11V3.75a.25.25 0 0 0-.25-.25Z",
      repo: "M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z",
      graph: "M1.5 1.75V13.5h13.75a.75.75 0 0 1 0 1.5H.75a.75.75 0 0 1-.75-.75V1.75a.75.75 0 0 1 1.5 0Zm14.28 2.53-5.25 5.25a.75.75 0 0 1-1.06 0L7 7.06 4.28 9.78a.751.751 0 0 1-1.042-.018.751.751 0 0 1-.018-1.042l3.25-3.25a.75.75 0 0 1 1.06 0L10 7.94l4.72-4.72a.751.751 0 0 1 1.042.018.751.751 0 0 1 .018 1.042Z",
      code: "M4.72 3.22a.75.75 0 0 1 1.06 1.06L2.06 8l3.72 3.72a.75.75 0 1 1-1.06 1.06L.47 8.53a.75.75 0 0 1 0-1.06l4.25-4.25Zm6.56 0a.75.75 0 1 0-1.06 1.06L13.94 8l-3.72 3.72a.75.75 0 1 0 1.06 1.06l4.25-4.25a.75.75 0 0 0 0-1.06l-4.25-4.25Z",
      lightbulb: "M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0ZM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0Zm7-3.25v2.992l2.028.812a.75.75 0 0 1-.557 1.392l-2.5-1A.751.751 0 0 1 7 8.25v-3.5a.75.75 0 0 1 1.5 0Z",
      team: "M5.5 3.5a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM2 5.5a3.5 3.5 0 1 1 5.898 2.549 5.508 5.508 0 0 1 3.034 4.084.75.75 0 1 1-1.482.235 4 4 0 0 0-7.9 0 .75.75 0 0 1-1.482-.236A5.507 5.507 0 0 1 3.102 8.05 3.493 3.493 0 0 1 2 5.5ZM11 4a.75.75 0 1 0 0 1.5 1.5 1.5 0 0 1 .666 2.844.75.75 0 0 0-.416.672v.352a.75.75 0 0 0 .574.73c1.2.289 2.162 1.2 2.522 2.372a.75.75 0 1 0 1.434-.44 5.01 5.01 0 0 0-2.56-3.012A3 3 0 0 0 11 4Z",
      tag: "M1 7.775V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 0 1 0 2.474l-5.026 5.026a1.75 1.75 0 0 1-2.474 0l-6.25-6.25A1.752 1.752 0 0 1 1 7.775Zm1.5 0c0 .066.026.13.073.177l6.25 6.25a.25.25 0 0 0 .354 0l5.025-5.025a.25.25 0 0 0 0-.354l-6.25-6.25a.25.25 0 0 0-.177-.073H2.75a.25.25 0 0 0-.25.25ZM6 5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z",
      warning: "M6.457 1.047c.659-1.234 2.427-1.234 3.086 0l6.082 11.378A1.75 1.75 0 0 1 14.082 15H1.918a1.75 1.75 0 0 1-1.543-2.575Zm1.763.707a.25.25 0 0 0-.44 0L1.698 13.132a.25.25 0 0 0 .22.368h12.164a.25.25 0 0 0 .22-.368Zm.53 3.996v2.5a.75.75 0 0 1-1.5 0v-2.5a.75.75 0 0 1 1.5 0ZM9 11a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z",
      link: "M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 0 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z"
    };
    
    // Function to create tooltip
    function createTooltip(text: string, element?: HTMLElement): HTMLElement {
      const container = document.createElement('span');
      container.className = 'tooltip-container';
      
      // Create the tooltip text element
      const tooltip = document.createElement('span');
      tooltip.className = 'tooltip-text';
      tooltip.innerHTML = text;
      
      if (element) {
        // If an element is provided, wrap it in the tooltip container
        container.appendChild(element);
      }
      container.appendChild(tooltip);
      
      return container;
    }
    
    // Create a header with title
    const header = document.createElement('div');
    header.innerHTML = `
      <h2>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="color: #0366d6;">
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>
        </svg>
        Repository Analysis: ${resultData.repoName}
      </h2>
    `;
    container.appendChild(header);
    
    // Description
    const description = document.createElement('div');
    description.className = 'info';
    description.style.fontStyle = 'italic';
    description.textContent = resultData.description || 'No description provided';
    container.appendChild(description);
    
    // Summary section
    const summarySection = document.createElement('div');
    summarySection.innerHTML = `<h2>${createSvgIcon(icons.chart).outerHTML} Summary</h2>`;
    container.appendChild(summarySection);
    
    // Quality score
    const scoreElement = document.createElement('div');
    scoreElement.style.marginBottom = '20px';
    
    const scoreLabel = document.createElement('div');
    scoreLabel.textContent = `Quality Score: ${resultData.score}/100`;
    scoreLabel.style.fontWeight = 'bold';
    scoreLabel.style.marginBottom = '8px';
    scoreElement.appendChild(scoreLabel);
    
    const scorePercent = parseFloat(resultData.score);
    const scoreColorClass = scorePercent >= 80 ? 'success' : scorePercent >= 60 ? 'warning' : 'error';
    
    // Create a progress bar for score
    const barContainer = document.createElement('div');
    barContainer.className = 'bar-container';
    
    const bar = document.createElement('div');
    bar.className = `bar ${scoreColorClass}`;
    bar.style.width = `${scorePercent}%`;
    barContainer.appendChild(bar);
    
    scoreElement.appendChild(barContainer);
    
    const scorePercentLabel = document.createElement('div');
    scorePercentLabel.textContent = `${Math.round(scorePercent)}%`;
    scorePercentLabel.style.marginTop = '4px';
    scoreElement.appendChild(scorePercentLabel);
    
    container.appendChild(scoreElement);
    
    // Health indicators
    const healthSection = document.createElement('div');
    healthSection.innerHTML = `<h2>${createSvgIcon(icons.calendar).outerHTML} Health Indicators</h2>`;
    container.appendChild(healthSection);
    
    // Tooltip content
    const tooltips = {
      busFactor: "The 'bus factor' measures project risk if key contributors leave. A higher number is better, meaning knowledge is well distributed among team members. A lower number indicates high dependency on few contributors.",
      issueResolution: "The percentage of all issues that have been resolved. A higher rate indicates better project maintenance.",
      prMerge: "The percentage of pull requests that were accepted and merged. Shows how open the project is to contributions.",
      stars: "GitHub's way for users to bookmark or show appreciation for a repository. Indicates popularity.",
      forks: "Copies of the repository made by other users. Suggests reuse and adaptation of the code.",
      activity: "Measure of recent updates and development pace based on commits and last update time.",
      maintenance: "Assessment of issue handling, PR management, and project health.",
      documentation: "Quality and completeness of documentation including README, Wiki, and website."
    };
    
    // Create indicators
    const indicators = [
      {
        name: 'Popularity',
        value: `${resultData.metrics.stars} stars, ${resultData.metrics.forks} forks`,
        status: resultData.isPopular,
        tooltip: tooltips.stars + ' ' + tooltips.forks
      },
      {
        name: 'Activity',
        value: resultData.activityMessage,
        status: resultData.isActive,
        tooltip: tooltips.activity
      },
      {
        name: 'Community',
        value: `${resultData.metrics.contributors} contributors, bus factor of ${resultData.metrics.busFactor}`,
        status: resultData.hasCommunity,
        tooltip: tooltips.busFactor
      },
      {
        name: 'Maintenance',
        value: `${resultData.metrics.issueResolutionRate} issue resolution rate`,
        status: resultData.isWellMaintained,
        tooltip: tooltips.issueResolution
      },
      {
        name: 'Documentation',
        value: `${resultData.hasReadme ? `Has README${resultData.readmeLength > 300 ? ' (comprehensive)' : ''}` : 'No README'}, ${resultData.hasWebsite ? 'Has Website' : (resultData.hasWiki ? 'Has Wiki' : 'No Wiki/Website')}`,
        status: (resultData.hasReadme && (resultData.hasWiki || resultData.hasWebsite)) ? true : resultData.isWellDocumented,
        tooltip: tooltips.documentation
      }
    ];
    
    indicators.forEach(indicator => {
      const indicatorElement = document.createElement('div');
      indicatorElement.className = `indicator ${indicator.status ? 'success' : 'error'}`;
      
      indicatorElement.innerHTML = `
        ${indicator.status ? 
          createSvgIcon(icons.check).outerHTML : 
          createSvgIcon(icons.x).outerHTML
        }
      `;
      
      const valueContainer = document.createElement('div');
      valueContainer.style.marginLeft = '10px';
      
      // Create name element
      const nameText = document.createElement('span');
      nameText.style.fontWeight = 'bold';
      nameText.textContent = `${indicator.name}:`;
      
      // Create value element
      const valueText = document.createElement('span');
      valueText.style.marginLeft = '5px';
      valueText.textContent = indicator.value;
      
      // Add tooltip if available
      if (indicator.tooltip) {
        const nameWithTooltip = createTooltip(indicator.tooltip, nameText);
        valueContainer.appendChild(nameWithTooltip);
      } else {
        valueContainer.appendChild(nameText);
      }
      
      valueContainer.appendChild(valueText);
      indicatorElement.appendChild(valueContainer);
      container.appendChild(indicatorElement);
    });
    
    // Detailed scores
    const scoresSection = document.createElement('div');
    scoresSection.innerHTML = `<h2>${createSvgIcon(icons.graph).outerHTML} Detailed Scores</h2>`;
    container.appendChild(scoresSection);
    
    resultData.categories.forEach(category => {
      const scoreRow = document.createElement('div');
      scoreRow.className = 'score-row';
      
      const scoreLabel = document.createElement('div');
      scoreLabel.className = 'score-label';
      scoreLabel.textContent = category.name;
      scoreRow.appendChild(scoreLabel);
      
      const scoreBarContainer = document.createElement('div');
      scoreBarContainer.className = 'score-bar';
      
      const barContainer = document.createElement('div');
      barContainer.className = 'bar-container';
      
      const percent = parseFloat(category.score) / 20 * 100;
      const barColorClass = percent >= 80 ? 'success' : percent >= 60 ? 'warning' : 'error';
      
      const bar = document.createElement('div');
      bar.className = `bar ${barColorClass}`;
      bar.style.width = `${percent}%`;
      barContainer.appendChild(bar);
      
      scoreBarContainer.appendChild(barContainer);
      scoreRow.appendChild(scoreBarContainer);
      
      const scoreValue = document.createElement('div');
      scoreValue.className = 'score-value';
      scoreValue.textContent = `${category.score}/20`;
      scoreRow.appendChild(scoreValue);
      
      container.appendChild(scoreRow);
      
      const scoreDesc = document.createElement('div');
      scoreDesc.className = 'score-desc';
      scoreDesc.textContent = category.description;
      container.appendChild(scoreDesc);
    });
    
    // Key Insights section
    const insightsSection = document.createElement('div');
    insightsSection.innerHTML = `<h2>${createSvgIcon(icons.lightbulb).outerHTML} Key Insights</h2>`;
    container.appendChild(insightsSection);
    
    // Create a two-column layout for strengths and improvements
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'insights-container';
    
    // Strengths column
    if (resultData.strengths && resultData.strengths.length > 0) {
      const strengthsColumn = document.createElement('div');
      strengthsColumn.className = 'insights-column';
      
      const strengthsCard = document.createElement('div');
      strengthsCard.className = 'card';
      
      const strengthsHeader = document.createElement('div');
      strengthsHeader.className = 'card-header success';
      strengthsHeader.innerHTML = `${createSvgIcon(icons.check).outerHTML} Strengths`;
      strengthsCard.appendChild(strengthsHeader);
      
      const strengthsBody = document.createElement('div');
      strengthsBody.className = 'card-body';
      
      const strengthsList = document.createElement('ul');
      resultData.strengths.forEach(strength => {
        const item = document.createElement('li');
        item.innerHTML = strength;
        strengthsList.appendChild(item);
      });
      
      strengthsBody.appendChild(strengthsList);
      strengthsCard.appendChild(strengthsBody);
      strengthsColumn.appendChild(strengthsCard);
      insightsContainer.appendChild(strengthsColumn);
    }
    
    // Areas for improvement column
    if (resultData.recommendations && resultData.recommendations.length > 0) {
      const improvementsColumn = document.createElement('div');
      improvementsColumn.className = 'insights-column';
      
      const improvementsCard = document.createElement('div');
      improvementsCard.className = 'card';
      
      const improvementsHeader = document.createElement('div');
      improvementsHeader.className = 'card-header warning';
      improvementsHeader.innerHTML = `${createSvgIcon(icons.warning).outerHTML} Areas for Improvement`;
      improvementsCard.appendChild(improvementsHeader);
      
      const improvementsBody = document.createElement('div');
      improvementsBody.className = 'card-body';
      
      const improvementsList = document.createElement('ul');
      resultData.recommendations.forEach(rec => {
        const item = document.createElement('li');
        item.innerHTML = rec;
        improvementsList.appendChild(item);
      });
      
      improvementsBody.appendChild(improvementsList);
      improvementsCard.appendChild(improvementsBody);
      improvementsColumn.appendChild(improvementsCard);
      insightsContainer.appendChild(improvementsColumn);
    }
    
    container.appendChild(insightsContainer);
    
    // Detailed metrics
    const metricsSection = document.createElement('div');
    metricsSection.innerHTML = `<h2>${createSvgIcon(icons.code).outerHTML} Detailed Metrics</h2>`;
    container.appendChild(metricsSection);
    
    // Create collapsible sections
    function createCollapsibleCard(title: string, content: HTMLElement, icon: string): HTMLElement {
      const card = document.createElement('div');
      card.className = 'card';
      
      const header = document.createElement('div');
      header.className = 'card-header collapsible collapsed';
      header.innerHTML = `${icon} ${title}`;
      
      const body = document.createElement('div');
      body.className = 'card-body';
      body.style.display = 'none';
      body.appendChild(content);
      
      header.onclick = () => {
        header.classList.toggle('collapsed');
        body.style.display = body.style.display === 'none' ? 'block' : 'none';
      };
      
      card.appendChild(header);
      card.appendChild(body);
      
      return card;
    }
    
    // Repository metrics
    const repoMetricsTable = document.createElement('table');
    
    const repoMetrics = [
      ['Creation Date', resultData.metrics.creationDate],
      ['Last Update', resultData.metrics.lastUpdate],
      ['Repository Age', resultData.metrics.repoAge],
      ['Stars', String(resultData.metrics.stars)],
      ['Forks', String(resultData.metrics.forks)],
      ['Watchers', String(resultData.metrics.watchers)],
      ['Open Issues', String(resultData.metrics.openIssues)],
      ['Closed Issues', String(resultData.metrics.closedIssues)],
      ['Open PRs', String(resultData.metrics.openPRs)],
      ['Closed PRs', String(resultData.metrics.closedPRs)],
      ['Contributors', String(resultData.metrics.contributors)],
      ['Releases', String(resultData.metrics.releaseCount)],
      ['License', resultData.metrics.license],
      ['Has Website', resultData.hasWebsite ? 'Yes' : 'No']
    ];
    
    repoMetrics.forEach(([key, value]) => {
      if (value !== undefined) {
        const row = document.createElement('tr');
        
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        keyCell.style.fontWeight = 'bold';
        keyCell.style.width = '40%';
        
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        repoMetricsTable.appendChild(row);
      }
    });
    
    container.appendChild(createCollapsibleCard(
      'Repository Metrics', 
      repoMetricsTable,
      createSvgIcon(icons.repo).outerHTML
    ));
    
    // Advanced metrics
    const advancedMetricsTable = document.createElement('table');
    
    const advancedMetrics = [
      ['Issue Resolution Rate', resultData.metrics.issueResolutionRate],
      ['PR Merge Rate', resultData.metrics.prMergeRate],
      ['Recent Commits (30 days)', String(resultData.metrics.recentCommits)],
      ['Average Monthly Issues', resultData.metrics.avgIssuesPerMonth],
      ['Bus Factor', String(resultData.metrics.busFactor)],
      ['Avg. Days Between Releases', resultData.metrics.avgReleaseFrequency]
    ];
    
    advancedMetrics.forEach(([key, value]) => {
      if (value !== undefined) {
        const row = document.createElement('tr');
        
        const keyCell = document.createElement('td');
        keyCell.textContent = key;
        keyCell.style.fontWeight = 'bold';
        keyCell.style.width = '40%';
        
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        
        row.appendChild(keyCell);
        row.appendChild(valueCell);
        advancedMetricsTable.appendChild(row);
      }
    });
    
    container.appendChild(createCollapsibleCard(
      'Advanced Metrics', 
      advancedMetricsTable,
      createSvgIcon(icons.graph).outerHTML
    ));
    
    // Language distribution
    if (resultData.metrics.languages && Object.keys(resultData.metrics.languages).length > 0) {
      const langTable = document.createElement('table');
      
      Object.entries(resultData.metrics.languages).forEach(([lang, percent]) => {
        const row = document.createElement('tr');
        
        const langCell = document.createElement('td');
        langCell.textContent = lang;
        langCell.style.fontWeight = 'bold';
        langCell.style.width = '40%';
        
        const percentCell = document.createElement('td');
        percentCell.textContent = percent;
        
        row.appendChild(langCell);
        row.appendChild(percentCell);
        langTable.appendChild(row);
      });
      
      container.appendChild(createCollapsibleCard(
        'Language Distribution', 
        langTable,
        createSvgIcon(icons.code).outerHTML
      ));
    }
    
    // Methodology
    const methodologyDiv = document.createElement('div');
    methodologyDiv.innerHTML = `
      <p>Each category contributes 20 points to the total score of 100:</p>
      <ul>
        <li><b>Popularity (20%):</b> Based on stars using a logarithmic scale</li>
        <li><b>Activity (20%):</b> Evaluates recency of updates and development pace</li>
        <li><b>Community (20%):</b> Measures contributor count, forks, and bus factor</li>
        <li><b>Maintenance (20%):</b> Assesses issue handling, PR management, project health</li>
        <li><b>Documentation (20%):</b> Evaluates quality and completeness of documentation</li>
      </ul>
    `;
    
    container.appendChild(createCollapsibleCard(
      'Scoring Methodology', 
      methodologyDiv,
      createSvgIcon(icons.tag).outerHTML
    ));
    
    // Footer with disclaimer
    const footer = document.createElement('div');
    footer.className = 'footer';
    footer.innerHTML = `
      <p>⚠️ Note: This is an automated evaluation based on repository metrics.</p>
      <p>For a complete assessment, also consider code quality, community engagement, and the project's specific goals.</p>
    `;
    
    container.appendChild(footer);
  }
  
  /**
   * Show loading indicator
   */
  public static showLoading(): void {
    // Implementation for showing loading state
    console.log("Loading repository analysis...");
  }
  
  /**
   * Show error message
   * @param message Error message to display
   */
  public static showError(message: string): void {
    // Implementation for showing error message
    console.error("Repository analysis error:", message);
    
    // Could also create a visual error indicator in the UI
  }
}
