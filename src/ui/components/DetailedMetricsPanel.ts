import { AnalysisResult } from '@interfaces/analysis.interface';
import { IconHelper } from '@ui/helpers/IconHelper';
import { CategoryScoresPanel } from './metrics/CategoryScoresPanel';
import { InsightsPanel } from './metrics/InsightsPanel';
import { RepositoryMetricsCard } from './metrics/cards/RepositoryMetricsCard';
import { AdvancedMetricsCard } from './metrics/cards/AdvancedMetricsCard';
import { LanguageDistributionCard } from './metrics/cards/LanguageDistributionCard';
import { MethodologyCard } from './metrics/cards/MethodologyCard';

/**
 * Component for displaying detailed metrics and insights
 * Now acts as a coordinator for the specialized components
 */
export class DetailedMetricsPanel {
  private container: HTMLElement;
  private categoryScoresPanel: CategoryScoresPanel;
  private insightsPanel: InsightsPanel;
  private detailedMetricsSection: HTMLElement;
  private isDebugMode: boolean;

  /**
   * Create a new detailed metrics panel
   * @param debugMode Enable debug logging
   */
  constructor(debugMode = false) {
    this.isDebugMode = debugMode;
    
    // Create main container
    this.container = document.createElement('div');
    
    // Initialize sub-components
    this.categoryScoresPanel = new CategoryScoresPanel(debugMode);
    this.insightsPanel = new InsightsPanel(debugMode);
    this.detailedMetricsSection = document.createElement('div');
  }

  /**
   * Set the data to display
   * @param data Analysis result data
   */
  public setData(data: AnalysisResult): void {
    // Debug logging
    this.logDebug("DetailedMetricsPanel received data:", data);
    
    // Clear previous content
    this.container.innerHTML = '';
    
    // Set category scores data
    this.categoryScoresPanel.setData(data.categories);
    this.container.appendChild(this.categoryScoresPanel.getElement());
    
    // Set insights data
    this.insightsPanel.setData(data);
    this.container.appendChild(this.insightsPanel.getElement());
    
    // Create and add detailed metrics section
    this.createDetailedMetricsSection(data);
    this.container.appendChild(this.detailedMetricsSection);
  }

  /**
   * Create detailed metrics section with collapsible cards
   * @param data Analysis result data
   */
  private createDetailedMetricsSection(data: AnalysisResult): void {
    // Clear previous content
    this.detailedMetricsSection.innerHTML = '';
    
    // Create section header
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('code')} Detailed Metrics`;
    this.detailedMetricsSection.appendChild(header);
    
    // Add repository metrics card
    const repoMetricsCard = new RepositoryMetricsCard(data);
    this.detailedMetricsSection.appendChild(repoMetricsCard.getElement());
    
    // Add advanced metrics card
    const advancedMetricsCard = new AdvancedMetricsCard(data);
    this.detailedMetricsSection.appendChild(advancedMetricsCard.getElement());
    
    // Add language distribution card if data available
    if (LanguageDistributionCard.hasData(data)) {
      const languageCard = new LanguageDistributionCard(data);
      this.detailedMetricsSection.appendChild(languageCard.getElement());
    }
    
    // Add methodology card
    const methodologyCard = new MethodologyCard();
    this.detailedMetricsSection.appendChild(methodologyCard.getElement());
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
}