import { AnalysisResult } from '@/interfaces/analysis.interface';
import { IconHelper } from '@/ui/helpers/IconHelper';

/**
 * Component for displaying health indicators
 */
export class HealthIndicators {
  // Tooltip content for different metrics
  private static readonly TOOLTIPS = {
    activity:
      'Measure of recent updates and development pace based on commits and last update time.',
    busFactor:
      "The 'bus factor' measures project risk if key contributors leave. A higher number is better, meaning knowledge is well distributed among team members. A lower number indicates high dependency on few contributors.",
    documentation: 'Quality and completeness of documentation including README, Wiki, and website.',
    forks:
      'Copies of the repository made by other users. Suggests reuse and adaptation of the code.',
    issueResolution:
      'The percentage of all issues that have been resolved. A higher rate indicates better project maintenance.',
    maintenance: 'Assessment of issue handling, PR management, and project health.',
    prMerge:
      'The percentage of pull requests that were accepted and merged. Shows how open the project is to contributions.',
    stars:
      "GitHub's way for users to bookmark or show appreciation for a repository. Indicates popularity.",
  };
  private container: HTMLElement;

  private indicatorsContainer: HTMLElement;

  /**
   * Create a new health indicators component
   */
  constructor() {
    // Create main container
    this.container = document.createElement('div');
    this.container.className = 'mt-8';

    // Create section header with Tailwind classes
    const header = document.createElement('h3');
    header.className = 'flex items-center text-lg font-semibold mb-4 text-gray-900';

    // Fix SVG rendering in header
    const svgIcon = IconHelper.getSvgIconString('calendar');
    const headerContent = document.createElement('span');
    headerContent.className = 'ml-2';
    headerContent.textContent = 'Health Indicators';

    // Add SVG and text to header
    header.innerHTML = svgIcon;
    header.appendChild(headerContent);

    this.container.appendChild(header);

    // Create indicators container
    this.indicatorsContainer = document.createElement('div');
    this.indicatorsContainer.className = 'space-y-3';
    this.container.appendChild(this.indicatorsContainer);
  }

  /**
   * Get the component's root element
   * @returns The component's DOM element
   */
  public getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Set the data to display
   * @param data Analysis result data
   */
  public setData(data: AnalysisResult): void {
    // Clear previous indicators
    this.indicatorsContainer.innerHTML = '';

    // Create indicators with fallbacks for missing data
    const indicators = [
      {
        name: 'Popularity',
        status: data.isPopular,
        tooltip: HealthIndicators.TOOLTIPS.stars + ' ' + HealthIndicators.TOOLTIPS.forks,
        value: this.getPopularityMessage(data),
      },
      {
        name: 'Activity',
        status: data.isActive,
        tooltip: HealthIndicators.TOOLTIPS.activity,
        value: data.activityMessage || this.getActivityMessage(data),
      },
      {
        name: 'Community',
        status: data.hasCommunity,
        tooltip: HealthIndicators.TOOLTIPS.busFactor,
        value: this.getCommunityMessage(data),
      },
      {
        name: 'Maintenance',
        status: data.isWellMaintained,
        tooltip: HealthIndicators.TOOLTIPS.issueResolution,
        value: this.getMaintenanceMessage(data),
      },
      {
        name: 'Documentation',
        status: data.hasReadme && (data.hasWiki || data.hasWebsite) ? true : data.isWellDocumented,
        tooltip: HealthIndicators.TOOLTIPS.documentation,
        value: this.getDocumentationMessage(data),
      },
    ];

    // Add each indicator
    indicators.forEach(indicator => {
      // Create indicator container with Tailwind classes
      const indicatorElement = document.createElement('div');

      // Set base classes
      indicatorElement.className = `flex items-center p-3 rounded-md mb-3 ${
        indicator.status ? 'bg-[#34d39933] border-green-400' : 'bg-[#ef44441a] border-red-500'
      } border-l-4 border-solid text-gray-900`;

      // Add icon
      const iconSpan = document.createElement('span');
      iconSpan.className = 'flex-shrink-0 text-current';

      if (indicator.status) {
        // Success icon
        iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#2ea44f" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7 10L9 12L13 8" stroke="#2ea44f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      } else {
        // Error icon
        iconSpan.innerHTML = `<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="#d73a49" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 8L8 12" stroke="#d73a49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M8 8L12 12" stroke="#d73a49" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`;
      }

      indicatorElement.appendChild(iconSpan);

      // Create value container with improved spacing
      const valueContainer = document.createElement('div');
      valueContainer.className = 'ml-4 flex-1';

      // Create name element with tooltip
      let nameElement;

      if (indicator.tooltip) {
        // Create a tooltip container using Tailwind classes
        const tooltipContainer = document.createElement('div');
        tooltipContainer.className = 'relative inline-block group'; // 'group' for hover effects

        const nameSpan = document.createElement('span');
        nameSpan.className = 'font-semibold text-gray-900';
        nameSpan.textContent = `${indicator.name}:`;

        tooltipContainer.appendChild(nameSpan);

        // Create tooltip with Tailwind classes
        const tooltipText = document.createElement('div');
        tooltipText.className =
          'invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-0 w-64 p-2 mb-1 rounded z-10 bg-gray-800 text-white text-sm';
        tooltipText.innerHTML = indicator.tooltip;

        // Add a tooltip arrow
        const tooltipArrow = document.createElement('div');
        tooltipArrow.className =
          'absolute top-full left-4 border-4 border-solid border-transparent border-t-gray-800';
        tooltipText.appendChild(tooltipArrow);

        tooltipContainer.appendChild(tooltipText);
        nameElement = tooltipContainer;
      } else {
        nameElement = document.createElement('span');
        nameElement.className = 'font-semibold text-gray-900';
        nameElement.textContent = `${indicator.name}:`;
      }

      const valueText = document.createElement('span');
      valueText.className = 'ml-1 text-gray-700';
      valueText.textContent = indicator.value;

      // Assemble everything
      valueContainer.appendChild(nameElement);
      valueContainer.appendChild(valueText);
      indicatorElement.appendChild(valueContainer);

      this.indicatorsContainer.appendChild(indicatorElement);
    });
  }

  /**
   * Generate activity message with fallbacks
   * @param data Analysis result data
   * @returns Formatted activity message
   */
  private getActivityMessage(data: AnalysisResult): string {
    const days = data.metrics.daysSinceLastUpdate || 0;
    const commits = data.metrics.recentCommits || 0;

    let message = `Last updated ${days} ${days === 1 ? 'day' : 'days'} ago`;

    if (commits > 0) {
      message += `, ${commits} recent ${commits === 1 ? 'commit' : 'commits'}`;
    } else {
      message += days < 30 ? ', but no recent commits' : ', no recent activity';
    }

    return message;
  }

  /**
   * Generate community message with fallbacks
   * @param data Analysis result data
   * @returns Formatted community message
   */
  private getCommunityMessage(data: AnalysisResult): string {
    const contributors = data.metrics.contributors || 1;
    const busFactor = data.metrics.busFactor || 1;

    return `${contributors} ${contributors === 1 ? 'contributor' : 'contributors'}, bus factor of ${busFactor}`;
  }

  /**
   * Generate documentation message with fallbacks
   * @param data Analysis result data
   * @returns Formatted documentation message
   */
  private getDocumentationMessage(data: AnalysisResult): string {
    const readmeStatus = data.hasReadme
      ? `Has README${data.readmeLength > 300 ? ' (comprehensive)' : ''}`
      : 'No README';

    const extendedDocs = data.hasWebsite ? 'Has Website' : 'No Wiki/Website';

    return `${readmeStatus}, ${extendedDocs}`;
  }

  /**
   * Generate maintenance message with fallbacks
   * @param data Analysis result data
   * @returns Formatted maintenance message
   */
  private getMaintenanceMessage(data: AnalysisResult): string {
    // Default to a readable message if issueResolutionRate is missing
    const issueRate = data.metrics.issueResolutionRate || 'N/A';

    // Add more context if we have open/closed issues
    if (data.metrics.openIssues !== undefined && data.metrics.closedIssues !== undefined) {
      const openIssues = data.metrics.openIssues || 0;
      const closedIssues = data.metrics.closedIssues || 0;
      return `${issueRate} issue resolution rate (${closedIssues}/${closedIssues + openIssues})`;
    }

    return `${issueRate} issue resolution rate`;
  }

  /**
   * Generate popularity message with fallbacks
   * @param data Analysis result data
   * @returns Formatted popularity message
   */
  private getPopularityMessage(data: AnalysisResult): string {
    const stars = data.metrics.stars || 0;
    const forks = data.metrics.forks || 0;
    return `${stars} ${stars === 1 ? 'star' : 'stars'}, ${forks} ${forks === 1 ? 'fork' : 'forks'}`;
  }
}
