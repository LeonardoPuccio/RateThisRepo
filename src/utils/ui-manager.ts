import { AnalysisResult } from '../interfaces/analysis.interface';
import { ToggleButton } from '../ui/components/ToggleButton';
import { AnalysisPanel } from '../ui/components/AnalysisPanel';
import { StyleService } from '../ui/services/StyleService';

/**
 * Manages UI elements for the repository analysis
 */
export class UIManager {
  private static toggleButton: ToggleButton;
  private static analysisPanel: AnalysisPanel;
  
  /**
   * Add the toggle button to the GitHub interface
   * @param toggleCallback Function to call when button is clicked
   */
  public static addToggleButton(toggleCallback: () => void): void {
    // Initialize StyleService to add all styles
    StyleService.getInstance().addAllStyles();
    
    // Create toggle button
    this.toggleButton = new ToggleButton(toggleCallback);
    this.toggleButton.appendTo();
  }
  
  /**
   * Display the analysis results in the UI
   * @param resultData Analysis results to display
   * @returns The panel element
   */
  public static displayAnalysisPanel(resultData: AnalysisResult): HTMLElement {
    // Create analysis panel if it doesn't exist
    if (!this.analysisPanel) {
      this.analysisPanel = new AnalysisPanel();
    }
    
    // Set data and display the panel
    this.analysisPanel.setData(resultData);
    this.analysisPanel.appendTo();
    
    // Set toggle button to active state
    if (this.toggleButton) {
      this.toggleButton.setActive(true);
    }
    
    // Return the panel element for reference
    return document.getElementById('repo-evaluator-panel') as HTMLElement;
  }
  
  /**
   * Show loading indicator
   */
  public static showLoading(): void {
    console.log("Loading repository analysis...");
    // Could implement a loading indicator in the future
  }
  
  /**
   * Show error message
   * @param message Error message to display
   */
  public static showError(message: string): void {
    console.error("Repository analysis error:", message);
    // Could implement a visual error indicator in the future
  }
}
