import { AnalysisResult } from '@interfaces/analysis.interface';
import { CollapsibleCard } from '../CollapsibleCard';

/**
 * Card for displaying repository language distribution
 */
export class LanguageDistributionCard {
  private card: CollapsibleCard;

  /**
   * Create a new language distribution card
   * @param data Analysis result data
   */
  constructor(data: AnalysisResult) {
    // Create table with language distribution
    const tableElement = this.createLanguageTable(data);
    
    // Create the collapsible card
    this.card = new CollapsibleCard(
      'Language Distribution', 
      tableElement, 
      'code',
      true // collapsed by default
    );
  }

  /**
   * Check if this card has data to display
   * @param data Analysis result data
   * @returns True if card has data to display
   */
  public static hasData(data: AnalysisResult): boolean {
    return !!(data.metrics.languages && Object.keys(data.metrics.languages).length > 0);
  }

  /**
   * Create the language table element
   * @param data Analysis result data
   * @returns Table element with language distribution
   */
  private createLanguageTable(data: AnalysisResult): HTMLElement {
    const table = document.createElement('table');
    
    // Check if we have language data
    if (!data.metrics.languages || Object.keys(data.metrics.languages).length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.textContent = 'No language data available';
      cell.style.fontStyle = 'italic';
      row.appendChild(cell);
      table.appendChild(row);
      return table;
    }
    
    // Create header row
    const headerRow = document.createElement('tr');
    const languageHeader = document.createElement('th');
    languageHeader.textContent = 'Language';
    const percentageHeader = document.createElement('th');
    percentageHeader.textContent = 'Percentage';
    headerRow.appendChild(languageHeader);
    headerRow.appendChild(percentageHeader);
    table.appendChild(headerRow);
    
    // Sort languages by percentage (descending)
    const sortedLanguages = Object.entries(data.metrics.languages)
      .sort((a, b) => {
        const percentA = parseFloat(a[1]);
        const percentB = parseFloat(b[1]);
        return percentB - percentA;
      });
    
    // Add language rows
    sortedLanguages.forEach(([language, percentage]) => {
      const row = document.createElement('tr');
      
      const langCell = document.createElement('td');
      langCell.textContent = language;
      
      const percentCell = document.createElement('td');
      percentCell.textContent = percentage;
      
      row.appendChild(langCell);
      row.appendChild(percentCell);
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