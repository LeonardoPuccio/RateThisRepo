/**
 * Service to manage styles for the extension
 */
export class StyleService {
  private static instance: StyleService;
  private styleElement: HTMLStyleElement | null = null;
  
  // Private constructor for singleton pattern
  private constructor() {}
  
  /**
   * Get the StyleService instance
   */
  public static getInstance(): StyleService {
    if (!StyleService.instance) {
      StyleService.instance = new StyleService();
    }
    return StyleService.instance;
  }
  
  /**
   * Create or get the style element
   */
  private getStyleElement(): HTMLStyleElement {
    if (!this.styleElement) {
      this.styleElement = document.getElementById('rate-this-repo-styles') as HTMLStyleElement;
      
      if (!this.styleElement) {
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'rate-this-repo-styles';
        document.head.appendChild(this.styleElement);
      }
    }
    
    return this.styleElement;
  }
  
  /**
   * Add CSS to the style element
   * @param css CSS string to add
   */
  public addStyle(css: string): void {
    const styleElement = this.getStyleElement();
    styleElement.textContent += css;
  }
  
  /**
   * Add styles for the toggle button
   */
  public addToggleButtonStyles(): void {
    this.addStyle(`
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
    `);
  }
  
  /**
   * Add panel styles
   */
  public addPanelStyles(): void {
    this.addStyle(`
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
    `);
  }
  
  /**
   * Add all styles needed for the extension
   */
  public addAllStyles(): void {
    this.addToggleButtonStyles();
    this.addPanelStyles();
  }
}
