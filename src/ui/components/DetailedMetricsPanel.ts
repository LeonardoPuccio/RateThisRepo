import { AnalysisResult } from '@/interfaces/analysis.interface';
import { IconHelper } from '@/ui/helpers/IconHelper';
import { CategoryScoresPanel } from './metrics/CategoryScoresPanel';
import { InsightsPanel } from './metrics/InsightsPanel';
import { RepositoryMetricsCard } from './metrics/cards/RepositoryMetricsCard';
import { AdvancedMetricsCard } from './metrics/cards/AdvancedMetricsCard';
import { LanguageDistributionCard } from './metrics/cards/LanguageDistributionCard';
import { MethodologyCard } from './metrics/cards/MethodologyCard';
import { debugLog } from '@/utils/config';

/**
 * Component for displaying detailed metrics and insights
 * Acts as a coordinator for the specialized components
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

    // Create main container with Tailwind classes
    this.container = document.createElement('div');
    this.container.className = 'mt-8 space-y-6 text-black';

    // Initialize sub-components
    this.categoryScoresPanel = new CategoryScoresPanel(debugMode);
    this.insightsPanel = new InsightsPanel(debugMode);

    // Create detailed metrics section with Tailwind classes
    this.detailedMetricsSection = document.createElement('div');
    this.detailedMetricsSection.className = 'mt-8 space-y-4';
  }

  /**
   * Set the data to display
   * @param data Analysis result data
   */
  public setData(data: AnalysisResult): void {
    debugLog('ui', 'DetailedMetricsPanel setting data', data);

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

    // Create section header with improved Tailwind classes
    const header = document.createElement('h3');
    header.className = 'flex items-center text-lg font-semibold mb-4 text-black';

    // Fix SVG rendering in header
    const svgIcon = IconHelper.getSvgIconString('code');
    const headerContent = document.createElement('span');
    headerContent.className = 'ml-2';
    headerContent.textContent = 'Detailed Metrics';

    // Add SVG and text to header
    header.innerHTML = svgIcon;
    header.appendChild(headerContent);

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
   * Get the component's root element
   * @returns The component's DOM element
   */
  public getElement(): HTMLElement {
    return this.container;
  }
}
