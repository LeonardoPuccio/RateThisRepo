import { AnalysisResult } from '@interfaces/analysis.interface';
import { CollapsibleCard } from '../CollapsibleCard';

/**
 * Card for displaying advanced repository metrics
 */
export class AdvancedMetricsCard {
  private card: CollapsibleCard;

  /**
   * Create a new advanced metrics card
   * @param data Analysis result data
   */
  constructor(data: AnalysisResult) {
    // Create table with advanced metrics
    const tableElement = this.createMetricsTable(data);
    
    // Create the collapsible card
    this.card = new CollapsibleCard(
      'Advanced Metrics', 
      tableElement, 
      'code',
      true // collapsed by default
    );
  }

  /**
   * Create the metrics table element
   * @param data Analysis result data
   * @returns Table element with all metrics
   */
  private createMetricsTable(data: AnalysisResult): HTMLElement {
    const table = document.createElement('table');
    
    // Define metrics with fallbacks for missing data
    const advancedMetrics = [
      ['Issue Resolution Rate', data.metrics.issueResolutionRate || 'N/A'],
      ['PR Merge Rate', data.metrics.prMergeRate || 'N/A'],
      ['Recent Commits', data.metrics.recentCommits !== undefined ? String(data.metrics.recentCommits) : 'N/A'],
      ['Bus Factor', data.metrics.busFactor !== undefined ? String(data.metrics.busFactor) : 'N/A'],
      ['Avg Issues Per Month', data.metrics.avgIssuesPerMonth || 'N/A'],
      ['Avg Release Frequency', data.metrics.avgReleaseFrequency 
        ? `${data.metrics.avgReleaseFrequency} days` 
        : 'N/A'],
      ['README Score', (data.readmeLength && data.hasReadme) 
        ? this.getReadmeQualityLabel(data.readmeLength) 
        : data.hasReadme ? 'Basic' : 'No README'],
      ['Has Wiki', data.hasWiki ? 'Yes' : 'No'],
      ['Has Website', data.hasWebsite ? 'Yes' : 'No']
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
      table.appendChild(row);
    });
    
    return table;
  }
  
  /**
   * Get a qualitative label for README length
   * @param length README length in characters
   * @returns Quality label string
   */
  private getReadmeQualityLabel(length: number): string {
    if (length > 3000) return "Comprehensive (Excellent)";
    if (length > 1000) return "Detailed (Good)";
    if (length > 500) return "Adequate";
    if (length > 300) return "Basic";
    return "Minimal";
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }
}