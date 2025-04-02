import { ScoreCategory } from '../../../interfaces/analysis.interface';
import { IconHelper } from '../../helpers/IconHelper';

/**
 * Panel for displaying category scores with progress bars
 */
export class CategoryScoresPanel {
  private container: HTMLElement;
  private isDebugMode: boolean;

  /**
   * Create a new category scores panel
   * @param debugMode Enable debug logging
   */
  constructor(debugMode = false) {
    this.isDebugMode = debugMode;
    this.container = document.createElement('div');
  }

  /**
   * Set category data
   * @param categories Score categories data
   */
  public setData(categories: ScoreCategory[]): void {
    // Clear container
    this.container.innerHTML = '';
    
    // Create section header
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('graph')} Detailed Scores`;
    this.container.appendChild(header);
    
    // Create score rows for each category
    categories.forEach(category => {
      this.addCategoryRow(category);
    });
  }

  /**
   * Add a single category row with score visualization
   * @param category Category data
   */
  private addCategoryRow(category: ScoreCategory): void {
    // Create score row container
    const scoreRow = document.createElement('div');
    scoreRow.className = 'score-row';
    
    // Create label
    const scoreLabel = document.createElement('div');
    scoreLabel.className = 'score-label';
    scoreLabel.textContent = category.name;
    scoreRow.appendChild(scoreLabel);
    
    // Create score bar
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
    
    // Create score value
    const scoreValue = document.createElement('div');
    scoreValue.className = 'score-value';
    scoreValue.textContent = `${category.score}/20`;
    scoreRow.appendChild(scoreValue);
    
    this.container.appendChild(scoreRow);
    
    // Create description
    const scoreDesc = document.createElement('div');
    scoreDesc.className = 'score-desc';
    scoreDesc.textContent = category.description || this.getCategoryDefaultDescription(category.name);
    this.container.appendChild(scoreDesc);
  }

  /**
   * Get a default description for a category if none is provided
   * @param categoryName Category name
   * @returns Default description text
   */
  private getCategoryDefaultDescription(categoryName: string): string {
    const descriptions: Record<string, string> = {
      'Popularity': 'Based on star count and community adoption',
      'Activity': 'Based on recency of updates and development pace',
      'Community': 'Based on contributor count, forks, and bus factor',
      'Maintenance': 'Based on issue resolution, PR handling, and project structure',
      'Documentation': 'Based on README quality, website/wiki presence, and overall project documentation'
    };
    
    return descriptions[categoryName] || 'Score based on repository metrics';
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