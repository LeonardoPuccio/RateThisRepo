import { AnalysisResult } from '../../../../interfaces/analysis.interface';
import { CollapsibleCard } from '../CollapsibleCard';

/**
 * Card for displaying language distribution information
 */
export class LanguageDistributionCard {
  private card: CollapsibleCard;

  /**
   * Create a new language distribution card
   * @param data Analysis result data
   */
  constructor(data: AnalysisResult) {
    // Create table with language data
    const tableElement = this.createLanguageTable(data);
    
    // Create the collapsible card
    this.card = new CollapsibleCard(
      'Language Distribution', 
      tableElement, 
      'code'
    );
  }

  /**
   * Create the language table element
   * @param data Analysis result data
   * @returns Table element with language data
   */
  private createLanguageTable(data: AnalysisResult): HTMLElement {
    const table = document.createElement('table');
    
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
        table.appendChild(row);
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
      table.appendChild(row);
    }
    
    return table;
  }

  /**
   * Check if there's language data to display
   * @param data Analysis result data
   * @returns True if there's language data to display
   */
  public static hasData(data: AnalysisResult): boolean {
    return data.metrics.languages !== undefined && 
           Object.keys(data.metrics.languages || {}).length > 0;
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }
}
