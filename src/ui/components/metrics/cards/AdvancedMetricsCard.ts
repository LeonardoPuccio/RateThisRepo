import { AnalysisResult } from '../../../../interfaces/analysis.interface';
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
      'graph'
    );
  }

  /**
   * Create the metrics table element
   * @param data Analysis result data
   * @returns Table element with all metrics
   */
  private createMetricsTable(data: AnalysisResult): HTMLElement {
    const table = document.createElement('table');
    
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
      table.appendChild(row);
    });
    
    return table;
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }
}
