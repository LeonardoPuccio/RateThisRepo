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

    // Add strengths column
    insightsContainer.appendChild(this.createStrengthsColumn(data.strengths || []));

    // Check if there are specific recommendations from the analyzer
    if (data.recommendations && data.recommendations.length > 0) {
      // Show actual data-based recommendations
      insightsContainer.appendChild(this.createImprovementsColumn(data.recommendations));
    } else if (parseFloat(data.score) >= 80) {
      // For high-scoring repositories with no recommendations, show a positive message
      insightsContainer.appendChild(this.createPositiveFeedbackColumn());
    } else {
      // No specific recommendations but not a high score
      // Provide some data-driven insights based on the metrics
      insightsContainer.appendChild(this.createDataDrivenInsightsColumn(data));
    }

    this.container.appendChild(insightsContainer);
  }

  /**
   * Create a column with data-driven insights based on repository metrics
   * @param data Analysis result data
   * @returns Insights column element
   */
  private createDataDrivenInsightsColumn(data: AnalysisResult): HTMLElement {
    // Create column container with Tailwind classes
    const column = document.createElement('div');
    column.className = 'flex-1';

    // Create card container with Tailwind classes
    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden';

    // Create card header with icon using Tailwind classes
    const header = document.createElement('div');
    header.className = 'flex items-center px-4 py-3 bg-yellow-50 border-b border-gray-200';

    // Add icon with proper color
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-yellow-600 mr-2';
    iconSpan.innerHTML = IconHelper.getSvgIconString('warning');

    // Add header text
    const headerText = document.createElement('span');
    headerText.className = 'font-medium text-black';
    headerText.textContent = 'Weaknesses';

    // Assemble header
    header.appendChild(iconSpan);
    header.appendChild(headerText);
    card.appendChild(header);

    // Create card body with Tailwind classes
    const body = document.createElement('div');
    body.className = 'px-4 py-3 text-black';

    // Create description text
    const description = document.createElement('p');
    description.className = 'mb-3 text-gray-700';
    description.textContent =
      'Based on our analysis, this repository is performing well in several areas, but there may be opportunities for improvement:';
    body.appendChild(description);

    // Generate data-driven insights
    const insights = this.generateDataDrivenInsights(data);

    // Create and populate the list with Tailwind classes
    const list = document.createElement('ul');
    list.className = 'list-disc pl-5 space-y-2';

    // Add each insight as a list item
    insights.forEach(insight => {
      const item = document.createElement('li');
      item.className = 'text-gray-800';
      item.innerHTML = insight;
      list.appendChild(item);
    });

    // Assemble the card
    body.appendChild(list);
    card.appendChild(body);
    column.appendChild(card);

    return column;
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

    // Add description about how these affect score
    const description = document.createElement('p');
    description.className = 'mb-3 text-gray-700';
    description.textContent =
      "Our analysis identified these specific areas that could improve your repository's quality score:";
    improvementsBody.appendChild(description);

    // Create and populate the list with Tailwind classes
    const improvementsList = document.createElement('ul');
    improvementsList.className = 'list-disc pl-5 space-y-2';

    debugLog('ui', 'Creating improvements list with:', recommendations);

    // Add each recommendation as a list item with innerHTML to preserve emojis
    recommendations.forEach(rec => {
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
   * Create a positive feedback column for high-scoring repositories with no issues
   * @returns Positive feedback column element
   */
  private createPositiveFeedbackColumn(): HTMLElement {
    // Create column container with Tailwind classes
    const column = document.createElement('div');
    column.className = 'flex-1';

    // Create card container with Tailwind classes
    const card = document.createElement('div');
    card.className = 'bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden';

    // Create card header with icon using Tailwind classes
    const header = document.createElement('div');
    header.className = 'flex items-center px-4 py-3 bg-blue-50 border-b border-gray-200';

    // Add icon with proper color
    const iconSpan = document.createElement('span');
    iconSpan.className = 'text-blue-600 mr-2';
    iconSpan.innerHTML = IconHelper.getSvgIconString('check');

    // Add header text
    const headerText = document.createElement('span');
    headerText.className = 'font-medium text-black';
    headerText.textContent = 'Excellent Repository';

    // Assemble header
    header.appendChild(iconSpan);
    header.appendChild(headerText);
    card.appendChild(header);

    // Create card body with Tailwind classes
    const body = document.createElement('div');
    body.className = 'px-4 py-3 text-black';

    // Create and populate the paragraph
    const content = document.createElement('p');
    content.className = 'text-gray-800';
    content.innerHTML =
      "🏆 This repository is well-maintained and follows best practices. We didn't find any specific areas that need improvement. Keep up the great work!";

    // Assemble the card
    body.appendChild(content);
    card.appendChild(body);
    column.appendChild(card);

    return column;
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

    // Create description about strengths
    const description = document.createElement('p');
    description.className = 'mb-3 text-gray-700';
    description.textContent =
      "These positive aspects contribute to your repository's quality score:";
    strengthsBody.appendChild(description);

    // Create and populate the list with Tailwind classes
    const strengthsList = document.createElement('ul');
    strengthsList.className = 'list-disc pl-5 space-y-2';

    // Ensure we always have content
    const displayStrengths =
      strengths.length > 0
        ? strengths
        : ['⚠️ No notable strengths were identified during analysis'];

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
   * Generate data-driven insights based on repository metrics
   * @param data Repository analysis data
   * @returns Array of insight messages
   */
  private generateDataDrivenInsights(data: AnalysisResult): string[] {
    const insights: string[] = [];
    const scoreDetails = data.categories;

    // Find the lowest scoring category
    const sortedCategories = [...scoreDetails].sort(
      (a, b) => parseFloat(a.score) - parseFloat(b.score)
    );

    // Add insight for the lowest category
    if (sortedCategories.length > 0) {
      const lowestCategory = sortedCategories[0];
      const score = parseFloat(lowestCategory.score);

      if (score < 50) {
        insights.push(
          `📊 The <strong>${lowestCategory.name}</strong> score (${lowestCategory.score}) is your lowest metric and significantly affects your overall rating`
        );
      } else if (score < 70) {
        insights.push(
          `📊 Improving your <strong>${lowestCategory.name}</strong> score could have the biggest impact on your overall rating`
        );
      }
    }

    // Check specific metrics for improvement suggestions
    if (!data.hasWebsite) {
      insights.push(
        '🌐 Consider adding a project website or GitHub Pages to enhance repository visibility'
      );
    }

    if (data.metrics.contributors === 1) {
      insights.push(
        '👥 This appears to be a single-contributor project - consider welcoming additional collaborators to improve sustainability'
      );
    }

    // Check commit patterns
    if (data.metrics.daysSinceLastUpdate > 30 && data.metrics.daysSinceLastUpdate < 90) {
      insights.push(
        '⏱️ Repository activity has slowed recently - regular updates help maintain user confidence'
      );
    }

    // Check documentation
    if (data.hasReadme && data.readmeLength < 500) {
      insights.push(
        '📝 The README file is relatively short - consider expanding it with more detailed information'
      );
    }

    // Check for releases
    if (data.metrics.releaseCount === 0) {
      insights.push(
        '🏷️ No formal releases found - creating tagged releases helps users track versions'
      );
    }

    // Issues and PRs
    if (
      data.metrics.openIssues > 5 &&
      data.metrics.issueResolutionRate !== 'N/A' &&
      parseFloat(data.metrics.issueResolutionRate) < 70
    ) {
      insights.push('🔍 Consider addressing open issues to improve your issue resolution rate');
    }

    // If we couldn't generate any insights, add a general one
    if (insights.length === 0) {
      insights.push(
        "📈 This repository is doing well overall, but there's always room for incremental improvements"
      );
    }

    return insights;
  }
}
