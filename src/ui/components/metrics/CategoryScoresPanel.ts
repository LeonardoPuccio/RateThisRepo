import { ScoreCategory } from '@/interfaces/analysis.interface';
import { IconHelper } from '@/ui/helpers/IconHelper';
import { debugLog } from '@/utils/config';

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
    this.container.className = 'mt-6';
  }

  /**
   * Set category data
   * @param categories Score categories data
   */
  public setData(categories: ScoreCategory[]): void {
    // Debug logging
    debugLog('ui', 'CategoryScoresPanel setting data', categories);

    // Clear container
    this.container.innerHTML = '';

    // Create section header with Tailwind classes
    const header = document.createElement('h3');
    header.className = 'flex items-center text-lg font-semibold mb-4 text-gray-800';
    header.innerHTML = `${IconHelper.getSvgIconString('graph')} <span class="ml-2">Detailed Scores</span>`;
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
    // Create score row container with improved contrast
    const scoreRow = document.createElement('div');
    scoreRow.className = 'mb-3';

    // Create a flex container for name and score
    const nameScoreContainer = document.createElement('div');
    nameScoreContainer.className = 'flex justify-between items-center mb-1';

    // Create category name with proper contrast
    const nameElement = document.createElement('div');
    nameElement.className = 'font-semibold text-black';
    nameElement.textContent = category.name;
    nameScoreContainer.appendChild(nameElement);

    // Create score value with proper contrast
    const scoreValue = document.createElement('div');
    scoreValue.className = 'text-black font-medium';
    scoreValue.textContent = `${category.score}/20`;
    nameScoreContainer.appendChild(scoreValue);

    // Add the name-score container to the row
    scoreRow.appendChild(nameScoreContainer);

    // Create score bar with Tailwind classes and our custom bar class
    const barContainer = document.createElement('div');
    barContainer.className = 'w-full h-4 bg-gray-200 rounded overflow-hidden mb-2';

    const percent = (parseFloat(category.score) / 20) * 100;

    const bar = document.createElement('div');
    // Use our rtr-bar class with the appropriate status
    let statusClass = 'error';
    if (percent >= 80) {
      statusClass = 'success';
    } else if (percent >= 60) {
      statusClass = 'warning';
    }

    bar.className = `rtr-bar ${statusClass}`;
    bar.style.width = `${percent}%`;
    barContainer.appendChild(bar);
    scoreRow.appendChild(barContainer);

    // Create description with better contrast
    const scoreDesc = document.createElement('div');
    scoreDesc.className = 'text-gray-700 text-sm';
    scoreDesc.textContent =
      category.description || this.getCategoryDefaultDescription(category.name);

    // Add everything to container
    this.container.appendChild(scoreRow);
    this.container.appendChild(scoreDesc);

    // Add spacer after each category except the last one
    const spacer = document.createElement('div');
    spacer.className = 'mb-6';
    this.container.appendChild(spacer);
  }

  /**
   * Get a default description for a category if none is provided
   * @param categoryName Category name
   * @returns Default description text
   */
  private getCategoryDefaultDescription(categoryName: string): string {
    const descriptions: Record<string, string> = {
      Popularity: 'Based on star count and community adoption',
      Activity: 'Based on recency of updates and development pace',
      Community: 'Based on contributor count, forks, and bus factor',
      Maintenance: 'Based on issue resolution, PR handling, and project structure',
      Documentation:
        'Based on README quality, website/wiki presence, and overall project documentation',
    };

    return descriptions[categoryName] || 'Score based on repository metrics';
  }

  /**
   * Get the container element
   * @returns The container DOM element
   */
  public getElement(): HTMLElement {
    return this.container;
  }
}
