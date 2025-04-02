import { AnalysisResult } from '@interfaces/analysis.interface';
import { IconHelper } from '@ui/helpers/IconHelper';

/**
 * Component for displaying health indicators
 */
export class HealthIndicators {
  private container: HTMLElement;
  private indicatorsContainer: HTMLElement;
  
  // Tooltip content for different metrics
  private static readonly TOOLTIPS = {
    busFactor: "The 'bus factor' measures project risk if key contributors leave. A higher number is better, meaning knowledge is well distributed among team members. A lower number indicates high dependency on few contributors.",
    issueResolution: "The percentage of all issues that have been resolved. A higher rate indicates better project maintenance.",
    prMerge: "The percentage of pull requests that were accepted and merged. Shows how open the project is to contributions.",
    stars: "GitHub's way for users to bookmark or show appreciation for a repository. Indicates popularity.",
    forks: "Copies of the repository made by other users. Suggests reuse and adaptation of the code.",
    activity: "Measure of recent updates and development pace based on commits and last update time.",
    maintenance: "Assessment of issue handling, PR management, and project health.",
    documentation: "Quality and completeness of documentation including README, Wiki, and website."
  };
  
  /**
   * Create a new health indicators component
   */
  constructor() {
    // Create main container
    this.container = document.createElement('div');
    
    // Create section header - using direct DOM creation for consistency
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('calendar')} Health Indicators`;
    this.container.appendChild(header);
    
    // Create indicators container
    this.indicatorsContainer = document.createElement('div');
    this.container.appendChild(this.indicatorsContainer);
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
        value: this.getPopularityMessage(data),
        status: data.isPopular,
        tooltip: HealthIndicators.TOOLTIPS.stars + ' ' + HealthIndicators.TOOLTIPS.forks
      },
      {
        name: 'Activity',
        value: data.activityMessage || this.getActivityMessage(data),
        status: data.isActive,
        tooltip: HealthIndicators.TOOLTIPS.activity
      },
      {
        name: 'Community',
        value: this.getCommunityMessage(data),
        status: data.hasCommunity,
        tooltip: HealthIndicators.TOOLTIPS.busFactor
      },
      {
        name: 'Maintenance',
        value: this.getMaintenanceMessage(data),
        status: data.isWellMaintained,
        tooltip: HealthIndicators.TOOLTIPS.issueResolution
      },
      {
        name: 'Documentation',
        value: this.getDocumentationMessage(data),
        status: (data.hasReadme && (data.hasWiki || data.hasWebsite)) ? true : data.isWellDocumented,
        tooltip: HealthIndicators.TOOLTIPS.documentation
      }
    ];
    
    // Add each indicator
    indicators.forEach(indicator => {
      // Create indicator container
      const indicatorElement = document.createElement('div');
      indicatorElement.className = `indicator ${indicator.status ? 'success' : 'error'}`;
      
      // Add icon using innerHTML for proper rendering
      const iconHtml = indicator.status ? 
        IconHelper.getSvgIconString('check') : 
        IconHelper.getSvgIconString('x');
      
      indicatorElement.innerHTML = iconHtml;
      
      // Create value container separately
      const valueContainer = document.createElement('div');
      valueContainer.style.marginLeft = '10px';
      
      // Create name and value elements
      let nameElement;
      
      if (indicator.tooltip) {
        const tooltipContainer = document.createElement('span');
        tooltipContainer.className = 'tooltip-container';
        
        const nameSpan = document.createElement('span');
        nameSpan.style.fontWeight = 'bold';
        nameSpan.textContent = `${indicator.name}:`;
        
        tooltipContainer.appendChild(nameSpan);
        
        const tooltipText = document.createElement('span');
        tooltipText.className = 'tooltip-text';
        tooltipText.innerHTML = indicator.tooltip;
        
        tooltipContainer.appendChild(tooltipText);
        nameElement = tooltipContainer;
      } else {
        nameElement = document.createElement('span');
        nameElement.style.fontWeight = 'bold';
        nameElement.textContent = `${indicator.name}:`;
      }
      
      const valueText = document.createElement('span');
      valueText.style.marginLeft = '5px';
      valueText.textContent = indicator.value;
      
      // Assemble everything
      valueContainer.appendChild(nameElement);
      valueContainer.appendChild(valueText);
      indicatorElement.appendChild(valueContainer);
      
      this.indicatorsContainer.appendChild(indicatorElement);
    });
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
   * Generate documentation message with fallbacks
   * @param data Analysis result data
   * @returns Formatted documentation message
   */
  private getDocumentationMessage(data: AnalysisResult): string {
    const readmeStatus = data.hasReadme 
      ? `Has README${data.readmeLength > 300 ? ' (comprehensive)' : ''}` 
      : 'No README';
    
    const extendedDocs = data.hasWebsite 
      ? 'Has Website' 
      : (data.hasWiki ? 'Has Wiki' : 'No Wiki/Website');
    
    return `${readmeStatus}, ${extendedDocs}`;
  }
  
  /**
   * Add the component to a parent element
   * @param parent Parent element
   */
  public appendTo(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }
}