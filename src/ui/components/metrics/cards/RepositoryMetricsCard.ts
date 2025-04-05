import { AnalysisResult } from '@/interfaces/analysis.interface';
import { CollapsibleCard } from '../CollapsibleCard';

/**
 * Card for displaying basic repository metrics
 */
export class RepositoryMetricsCard {
  private card: CollapsibleCard;

  /**
   * Create a new repository metrics card
   * @param data Analysis result data
   */
  constructor(data: AnalysisResult) {
    // Create table with repository metrics
    const tableElement = this.createMetricsTable(data);
    
    // Create the collapsible card
    this.card = new CollapsibleCard(
      'Repository Metrics', 
      tableElement, 
      'repo'
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