import { AnalysisResult } from '../../../interfaces/analysis.interface';
import { IconHelper } from '../../helpers/IconHelper';

/**
 * Panel for displaying strengths and improvement recommendations
 */
export class InsightsPanel {
  private container: HTMLElement;
  private isDebugMode: boolean;

  /**
   * Create a new insights panel
   * @param debugMode Enable debug logging
   */
  constructor(debugMode = false) {
    this.isDebugMode = debugMode;
    this.container = document.createElement('div');
  }

  /**
   * Set insights data
   * @param data Analysis result data
   */
  public setData(data: AnalysisResult): void {
    // Clear container
    this.container.innerHTML = '';
    
    // Create section header
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('lightbulb')} Key Insights`;
    this.container.appendChild(header);
    
    // Debug logging
    this.logDebug("Strengths count:", (data.strengths || []).length);
    this.logDebug("Recommendations count:", (data.recommendations || []).length);
    
    // Create a two-column layout for strengths and improvements
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'insights-container';
    
    // Generate default strengths if none are provided or empty
    const strengths = (data.strengths && data.strengths.length > 0)
      ? data.strengths 
      : this.generateDefaultStrengths(data);
    
    // Generate default recommendations if none are provided or empty
    const recommendations = (data.recommendations && data.recommendations.length > 0)
      ? data.recommendations 
      : this.generateDefaultRecommendations(data);
    
    // Add both columns to the container
    insightsContainer.appendChild(this.createStrengthsColumn(strengths));
    insightsContainer.appendChild(this.createImprovementsColumn(recommendations));
    
    this.container.appendChild(insightsContainer);
  }

  /**
   * Generate default strengths when data is missing
   * @param data Analysis result data
   * @returns Array of default strength messages
   */
  private generateDefaultStrengths(data: AnalysisResult): string[] {
    this.logDebug("Generating default strengths");

    // Instead of generating potentially misleading defaults,
    // provide a message that indicates these are placeholders
    return [
      "⚠️ [Placeholder] This repository has basic GitHub features set up",
      "⚠️ [Placeholder] Documentation exists to some degree",
      "⚠️ [Placeholder] Repository structure follows standard practices"
    ];
  }

  /**
   * Generate default recommendations when data is missing
   * @param data Analysis result data
   * @returns Array of default recommendation messages
   */
  private generateDefaultRecommendations(data: AnalysisResult): string[] {
    this.logDebug("Generating default recommendations");

    // Instead of generating potentially misleading defaults,
    // provide a message that indicates these are placeholders
    return [
      "⚠️ [Placeholder] Consider enhancing documentation for better user experience",
      "⚠️ [Placeholder] Improve project sustainability with more community engagement"
    ];
  }

  /**
   * Create strengths column
   * @param strengths Array of strength messages
   * @returns Strengths column element
   */
  private createStrengthsColumn(strengths: string[]): HTMLElement {
    // Create column container
    const strengthsColumn = document.createElement('div');
    strengthsColumn.className = 'insights-column';
    
    // Create card container
    const strengthsCard = document.createElement('div');
    strengthsCard.className = 'card';
    
    // Create card header with icon
    const strengthsHeader = document.createElement('div');
    strengthsHeader.className = 'card-header success';
    strengthsHeader.innerHTML = `${IconHelper.getSvgIconString('check')} Strengths`;
    strengthsCard.appendChild(strengthsHeader);
    
    // Create card body
    const strengthsBody = document.createElement('div');
    strengthsBody.className = 'card-body';
    
    // Create and populate the list
    const strengthsList = document.createElement('ul');
    
    // Ensure we always have content
    const displayStrengths = strengths && strengths.length > 0 
      ? strengths 
      : ["⚠️ [No strengths identified] Analysis could not determine specific strengths"];
    
    // Debug logging
    this.logDebug("Creating strengths list with:", displayStrengths);
    
    // Add each strength as a list item with innerHTML to preserve emojis
    displayStrengths.forEach(strength => {
      this.logDebug("Adding strength:", strength);
      const item = document.createElement('li');
      item.innerHTML = strength;
      strengthsList.appendChild(item);
    });
    
    // Assemble the card
    strengthsBody.appendChild(strengthsList);
    strengthsCard.appendChild(strengthsBody);
    strengthsColumn.appendChild(strengthsCard);
    
    return strengthsColumn;
  }

  /**
   * Create improvements column
   * @param recommendations Array of improvement recommendations
   * @returns Improvements column element
   */
  private createImprovementsColumn(recommendations: string[]): HTMLElement {
    // Create column container
    const improvementsColumn = document.createElement('div');
    improvementsColumn.className = 'insights-column';
    
    // Create card container
    const improvementsCard = document.createElement('div');
    improvementsCard.className = 'card';
    
    // Create card header with icon
    const improvementsHeader = document.createElement('div');
    improvementsHeader.className = 'card-header warning';
    improvementsHeader.innerHTML = `${IconHelper.getSvgIconString('warning')} Areas for Improvement`;
    improvementsCard.appendChild(improvementsHeader);
    
    // Create card body
    const improvementsBody = document.createElement('div');
    improvementsBody.className = 'card-body';
    
    // Create and populate the list
    const improvementsList = document.createElement('ul');
    
    // Ensure we always have content
    const displayRecommendations = recommendations && recommendations.length > 0 
      ? recommendations 
      : ["⚠️ [No recommendations] Analysis could not determine specific areas for improvement"];
    
    // Debug logging
    this.logDebug("Creating improvements list with:", displayRecommendations);
    
    // Add each recommendation as a list item with innerHTML to preserve emojis
    displayRecommendations.forEach(rec => {
      this.logDebug("Adding recommendation:", rec);
      const item = document.createElement('li');
      item.innerHTML = rec;
      improvementsList.appendChild(item);
    });
    
    // Assemble the card
    improvementsBody.appendChild(improvementsList);
    improvementsCard.appendChild(improvementsBody);
    improvementsColumn.appendChild(improvementsCard);
    
    return improvementsColumn;
  }

  /**
   * Conditionally log debug messages
   * @param message The message to log
   * @param data Optional data to log
   */
  private logDebug(message: string, data?: any): void {
    if (this.isDebugMode) {
      if (data) {
        console.log(message, data);
      } else {
        console.log(message);
      }
    }
  }

  /**
   * Get the container element
   * @returns The container DOM element
   */
  public getElement(): HTMLElement {
    return this.container;
  }
}
