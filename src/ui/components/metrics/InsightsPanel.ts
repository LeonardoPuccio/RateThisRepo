import { AnalysisResult } from '@/interfaces/analysis.interface';
import { IconHelper } from '@/ui/helpers/IconHelper';
import { debugLog } from '@/utils/debug';

/**
 * Panel for displaying strengths and improvement recommendations
 */
export class InsightsPanel {
  private container: HTMLElement;

  /**
   * Create a new insights panel
   */
  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'mt-8';
  }

  /**
   * Get the container element
   * @returns The container DOM element
   */
  public getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Set insights data
   * @param data Analysis result data
   */
  public setData(data: AnalysisResult): void {
    // Clear container
    this.container.innerHTML = '';

    // Create section header with Tailwind classes
    const header = document.createElement('h3');
    header.className = 'flex items-center text-lg font-semibold mb-4 text-black';

    // Fix SVG rendering in header
    const svgIcon = IconHelper.getSvgIconString('lightbulb');
    const headerContent = document.createElement('span');
    headerContent.className = 'ml-2';
    headerContent.textContent = 'Key Insights';

    // Add SVG and text to header
    header.innerHTML = svgIcon;
    header.appendChild(headerContent);

    this.container.appendChild(header);

    // Debug logging
    debugLog('ui', 'Strengths count:', (data.strengths || []).length);
    debugLog('ui', 'Recommendations count:', (data.recommendations || []).length);

    // Create a two-column layout for strengths and improvements with Tailwind flex
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'flex flex-col md:flex-row gap-4';

    // Generate default strengths if none are provided or empty
    const strengths =
      data.strengths && data.strengths.length > 0
        ? data.strengths
        : this.generateDefaultStrengths();

    // Generate default recommendations if none are provided or empty
    const recommendations =
      data.recommendations && data.recommendations.length > 0
        ? data.recommendations
        : this.generateDefaultRecommendations();

    // Add both columns to the container
    insightsContainer.appendChild(this.createStrengthsColumn(strengths));
    insightsContainer.appendChild(this.createImprovementsColumn(recommendations));

    this.container.appendChild(insightsContainer);
  }

  /**
   * Create improvements column
   * @param recommendations Array of improvement recommendations
   * @returns Improvements column element
   */
  private createImprovementsColumn(recommendations: string[]): HTMLElement {
    // Create column container with Tailwind classes
    const improvementsColumn = document.createElement('div');
    improvementsColumn.className = 'flex-1';

    // Create card container with Tailwind classes
    const improvementsCard = document.createElement('div');
    improvementsCard.className =
      'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden';

    // Create card header with icon using Tailwind classes
    const improvementsHeader = document.createElement('div');
    improvementsHeader.className =
      'flex items-center px-4 py-3 bg-yellow-50 border-b border-gray-200';

    // Add icon with proper color
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-yellow-600 mr-2';
    iconSpan.innerHTML = IconHelper.getSvgIconString('warning');

    // Add header text
    const headerText = document.createElement('span');
    headerText.className = 'font-medium text-black';
    headerText.textContent = 'Areas for Improvement';

    // Assemble header
    improvementsHeader.appendChild(iconSpan);
    improvementsHeader.appendChild(headerText);
    improvementsCard.appendChild(improvementsHeader);

    // Create card body with Tailwind classes
    const improvementsBody = document.createElement('div');
    improvementsBody.className = 'px-4 py-3 text-black';

    // Create and populate the list with Tailwind classes
    const improvementsList = document.createElement('ul');
    improvementsList.className = 'list-disc pl-5 space-y-2';

    // Ensure we always have content
    const displayRecommendations =
      recommendations && recommendations.length > 0
        ? recommendations
        : ['⚠️ [No recommendations] Analysis could not determine specific areas for improvement'];

    debugLog('ui', 'Creating improvements list with:', displayRecommendations);

    // Add each recommendation as a list item with innerHTML to preserve emojis
    displayRecommendations.forEach(rec => {
      debugLog('ui', 'Adding recommendation:', rec);
      const item = document.createElement('li');
      item.className = 'text-gray-800';
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
   * Create strengths column
   * @param strengths Array of strength messages
   * @returns Strengths column element
   */
  private createStrengthsColumn(strengths: string[]): HTMLElement {
    // Create column container with Tailwind classes
    const strengthsColumn = document.createElement('div');
    strengthsColumn.className = 'flex-1';

    // Create card container with Tailwind classes
    const strengthsCard = document.createElement('div');
    strengthsCard.className =
      'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden';

    // Create card header with icon using Tailwind classes
    const strengthsHeader = document.createElement('div');
    strengthsHeader.className = 'flex items-center px-4 py-3 bg-green-50 border-b border-gray-200';

    // Add icon with proper color
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-green-600 mr-2';
    iconSpan.innerHTML = IconHelper.getSvgIconString('check');

    // Add header text
    const headerText = document.createElement('span');
    headerText.className = 'font-medium text-black';
    headerText.textContent = 'Strengths';

    // Assemble header
    strengthsHeader.appendChild(iconSpan);
    strengthsHeader.appendChild(headerText);
    strengthsCard.appendChild(strengthsHeader);

    // Create card body with Tailwind classes
    const strengthsBody = document.createElement('div');
    strengthsBody.className = 'px-4 py-3 text-black';

    // Create and populate the list with Tailwind classes
    const strengthsList = document.createElement('ul');
    strengthsList.className = 'list-disc pl-5 space-y-2';

    // Ensure we always have content
    const displayStrengths =
      strengths && strengths.length > 0
        ? strengths
        : ['⚠️ [No strengths identified] Analysis could not determine specific strengths'];

    debugLog('ui', 'Creating strengths list with:', displayStrengths);

    // Add each strength as a list item with innerHTML to preserve emojis
    displayStrengths.forEach(strength => {
      debugLog('ui', 'Adding strength:', strength);
      const item = document.createElement('li');
      item.className = 'text-gray-800';
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
   * Generate default recommendations when data is missing
   * @returns Array of default recommendation messages
   */
  private generateDefaultRecommendations(): string[] {
    debugLog('ui', 'Generating default recommendations');

    // Instead of generating potentially misleading defaults,
    // provide a message that indicates these are placeholders
    return [
      '⚠️ [Placeholder] Consider enhancing documentation for better user experience',
      '⚠️ [Placeholder] Improve project sustainability with more community engagement',
    ];
  }

  /**
   * Generate default strengths when data is missing
   * @returns Array of default strength messages
   */
  private generateDefaultStrengths(): string[] {
    debugLog('ui', 'Generating default strengths');

    // Instead of generating potentially misleading defaults,
    // provide a message that indicates these are placeholders
    return [
      '⚠️ [Placeholder] This repository has basic GitHub features set up',
      '⚠️ [Placeholder] Documentation exists to some degree',
      '⚠️ [Placeholder] Repository structure follows standard practices',
    ];
  }
}
