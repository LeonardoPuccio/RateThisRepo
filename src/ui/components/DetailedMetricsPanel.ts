import { AnalysisResult, ScoreCategory } from '../../interfaces/analysis.interface';
import { IconHelper } from '../helpers/IconHelper';

/**
 * Component for displaying detailed metrics and insights
 */
export class DetailedMetricsPanel {
  private container: HTMLElement;
  private categoriesContainer: HTMLElement;
  private insightsContainer: HTMLElement;
  private detailedMetricsContainer: HTMLElement;
  private isDebugMode: boolean = false;

  /**
   * Create a new detailed metrics panel
   */
  constructor(debugMode = false) {
    // Set debug mode
    this.isDebugMode = debugMode;

    // Create main container using direct DOM creation
    this.container = document.createElement('div');
    
    // Initialize sub-containers with direct DOM creation
    this.categoriesContainer = document.createElement('div');
    this.insightsContainer = document.createElement('div');
    this.detailedMetricsContainer = document.createElement('div');
  }

  /**
   * Set the data to display
   * @param data Analysis result data
   */
  public setData(data: AnalysisResult): void {
    // Debug logging
    this.logDebug("DetailedMetricsPanel received data:", data);
    this.logDebug("Strengths:", data.strengths);
    this.logDebug("Recommendations:", data.recommendations);
    
    // Clear previous content
    this.container.innerHTML = '';
    
    // Add category scores section
    this.addCategoriesSection(data.categories);
    this.container.appendChild(this.categoriesContainer);
    
    // Add insights section
    this.addInsightsSection(data);
    this.container.appendChild(this.insightsContainer);
    
    // Add detailed metrics section
    this.addDetailedMetricsSection(data);
    this.container.appendChild(this.detailedMetricsContainer);
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
   * Add the component to a parent element
   * @param parent Parent element
   */
  public appendTo(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }

  /**
   * Add the detailed score categories section
   * @param categories Score categories data
   */
  private addCategoriesSection(categories: ScoreCategory[]): void {
    // Clear previous content
    this.categoriesContainer.innerHTML = '';
    
    // Create section header using direct DOM creation
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('graph')} Detailed Scores`;
    this.categoriesContainer.appendChild(header);
    
    // Create score rows for each category
    categories.forEach(category => {
      // Create score row container
      const scoreRow = document.createElement('div');
      scoreRow.className = 'score-row';
      
      // Create label with text content explicitly set
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
      
      // Create score value with text content explicitly set
      const scoreValue = document.createElement('div');
      scoreValue.className = 'score-value';
      scoreValue.textContent = `${category.score}/20`;
      scoreRow.appendChild(scoreValue);
      
      this.categoriesContainer.appendChild(scoreRow);
      
      // Create description with text content explicitly set
      const scoreDesc = document.createElement('div');
      scoreDesc.className = 'score-desc';
      scoreDesc.textContent = category.description || this.getCategoryDefaultDescription(category.name);
      this.categoriesContainer.appendChild(scoreDesc);
    });
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
   * Add the insights section (strengths and improvements)
   * @param data Analysis result data
   */
  private addInsightsSection(data: AnalysisResult): void {
    // Clear previous content
    this.insightsContainer.innerHTML = '';
    
    // Create section header using direct DOM creation
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('lightbulb')} Key Insights`;
    this.insightsContainer.appendChild(header);
    
    // Create a two-column layout for strengths and improvements
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'insights-container';
    
    // Debug logging
    this.logDebug("Before fallbacks - strengths:", (data.strengths || []).length);
    this.logDebug("Before fallbacks - recommendations:", (data.recommendations || []).length);
    
    // Generate default strengths if none are provided or empty
    const strengths = (data.strengths && data.strengths.length > 0)
      ? data.strengths 
      : this.generateDefaultStrengths(data);
    
    // Generate default recommendations if none are provided or empty
    const recommendations = (data.recommendations && data.recommendations.length > 0)
      ? data.recommendations 
      : this.generateDefaultRecommendations(data);
    
    // Debug logging
    this.logDebug("After fallbacks - strengths:", strengths.length);
    this.logDebug("After fallbacks - recommendations:", recommendations.length);
    
    // Add both columns to the container
    insightsContainer.appendChild(this.createStrengthsColumn(strengths));
    insightsContainer.appendChild(this.createImprovementsColumn(recommendations));
    
    this.insightsContainer.appendChild(insightsContainer);
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
   * Add detailed metrics section with collapsible cards
   * @param data Analysis result data
   */
  private addDetailedMetricsSection(data: AnalysisResult): void {
    // Clear previous content
    this.detailedMetricsContainer.innerHTML = '';
    
    // Create section header using direct DOM creation
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('code')} Detailed Metrics`;
    this.detailedMetricsContainer.appendChild(header);
    
    // Add repository metrics card
    this.detailedMetricsContainer.appendChild(
      this.createRepositoryMetricsCard(data)
    );
    
    // Add advanced metrics card
    this.detailedMetricsContainer.appendChild(
      this.createAdvancedMetricsCard(data)
    );
    
    // Add language distribution card
    if (data.metrics.languages && Object.keys(data.metrics.languages).length > 0) {
      this.detailedMetricsContainer.appendChild(
        this.createLanguageDistributionCard(data)
      );
    }
    
    // Add methodology card
    this.detailedMetricsContainer.appendChild(
      this.createMethodologyCard()
    );
  }

  /**
   * Create a collapsible card
   * @param title Card title
   * @param content Card content element
   * @param icon SVG icon string
   * @returns Collapsible card element
   */
  private createCollapsibleCard(title: string, content: HTMLElement, icon: string): HTMLElement {
    const card = document.createElement('div');
    card.className = 'card';
    
    const header = document.createElement('div');
    header.className = 'card-header collapsible';
    header.innerHTML = `${icon} ${title}`;
    
    const body = document.createElement('div');
    body.className = 'card-body';
    body.style.display = 'block';
    body.appendChild(content);
    
    header.onclick = () => {
      header.classList.toggle('collapsed');
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
    };
    
    card.appendChild(header);
    card.appendChild(body);
    
    return card;
  }

  /**
   * Create repository metrics card
   * @param data Analysis result data
   * @returns Repository metrics card
   */
  private createRepositoryMetricsCard(data: AnalysisResult): HTMLElement {
    const repoMetricsTable = document.createElement('table');
    
    // Define metrics with fallbacks for missing data
    const repoMetrics = [
      ['Creation Date', data.metrics.creationDate || '[Not available]'],
      ['Last Update', data.metrics.lastUpdate || (data.metrics.daysSinceLastUpdate ? `${data.metrics.daysSinceLastUpdate} days ago` : '[Not available]')],
      ['Repository Age', data.metrics.repoAge || '[Not available]'],
      ['Stars', data.metrics.stars !== undefined ? String(data.metrics.stars) : '[Not available]'],
      ['Forks', data.metrics.forks !== undefined ? String(data.metrics.forks) : '[Not available]'],
      ['Watchers', data.metrics.watchers !== undefined ? String(data.metrics.watchers) : '[Not available]'],
      ['Open Issues', data.metrics.openIssues !== undefined ? String(data.metrics.openIssues) : '[Not available]'],
      ['Closed Issues', data.metrics.closedIssues !== undefined ? String(data.metrics.closedIssues) : '[Not available]'],
      ['Open PRs', data.metrics.openPRs !== undefined ? String(data.metrics.openPRs) : '[Not available]'],
      ['Closed PRs', data.metrics.closedPRs !== undefined ? String(data.metrics.closedPRs) : '[Not available]'],
      ['Contributors', data.metrics.contributors !== undefined ? String(data.metrics.contributors) : '[Not available]'],
      ['Releases', data.metrics.releaseCount !== undefined ? String(data.metrics.releaseCount) : '[Not available]'],
      ['License', data.metrics.license || '[Not specified]'],
      ['Has Website', data.hasWebsite !== undefined ? (data.hasWebsite ? 'Yes' : 'No') : '[Not determined]']
    ];
    
    // Add all metrics to the table
    repoMetrics.forEach(([key, value]) => {
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
    });
    
    return this.createCollapsibleCard(
      'Repository Metrics', 
      repoMetricsTable,
      IconHelper.getSvgIconString('repo')
    );
  }

  /**
   * Create advanced metrics card
   * @param data Analysis result data
   * @returns Advanced metrics card
   */
  private createAdvancedMetricsCard(data: AnalysisResult): HTMLElement {
    const advancedMetricsTable = document.createElement('table');
    
    // Define advanced metrics with fallbacks
    const advancedMetrics = [
      ['Issue Resolution Rate', data.metrics.issueResolutionRate || '[Not available]'],
      ['PR Merge Rate', data.metrics.prMergeRate || '[Not available]'],
      ['Recent Commits (30 days)', data.metrics.recentCommits !== undefined ? String(data.metrics.recentCommits) : '[Not available]'],
      ['Average Monthly Issues', data.metrics.avgIssuesPerMonth || '[Not available]'],
      ['Bus Factor', data.metrics.busFactor !== undefined ? String(data.metrics.busFactor) : '[Not available]'],
      ['Avg. Days Between Releases', data.metrics.avgReleaseFrequency || '[Not available]']
    ];
    
    // Add all metrics to the table
    advancedMetrics.forEach(([key, value]) => {
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
    });
    
    return this.createCollapsibleCard(
      'Advanced Metrics', 
      advancedMetricsTable,
      IconHelper.getSvgIconString('graph')
    );
  }

  /**
   * Create language distribution card
   * @param data Analysis result data 
   * @returns Language distribution card
   */
  private createLanguageDistributionCard(data: AnalysisResult): HTMLElement {
    const langTable = document.createElement('table');
    
    // Check if we have language data
    const languages = data.metrics.languages || {};
    
    // If we have language data, display it properly
    if (Object.keys(languages).length > 0) {
      Object.entries(languages).forEach(([lang, percent]) => {
        const row = document.createElement('tr');
        
        const langCell = document.createElement('td');
        langCell.textContent = lang;
        langCell.style.fontWeight = 'bold';
        langCell.style.width = '40%';
        
        const percentCell = document.createElement('td');
        percentCell.textContent = percent || '0%';
        
        row.appendChild(langCell);
        row.appendChild(percentCell);
        langTable.appendChild(row);
      });
    } else {
      // If no language data, show a placeholder row
      const row = document.createElement('tr');
      
      const langCell = document.createElement('td');
      langCell.textContent = '[Language information not available]';
      langCell.style.fontWeight = 'normal';
      langCell.style.width = '100%';
      langCell.colSpan = 2;
      
      row.appendChild(langCell);
      langTable.appendChild(row);
    }
    
    return this.createCollapsibleCard(
      'Language Distribution', 
      langTable,
      IconHelper.getSvgIconString('code')
    );
  }

  /**
   * Create methodology card
   * @returns Methodology card
   */
  private createMethodologyCard(): HTMLElement {
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
    
    return this.createCollapsibleCard(
      'Scoring Methodology', 
      methodologyDiv,
      IconHelper.getSvgIconString('tag')
    );
  }
}
