import { AnalysisResult } from '@/interfaces/analysis.interface';
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
    // Create table container with Tailwind classes
    const tableContainer = document.createElement('div');
    tableContainer.className = 'w-full text-black';

    const table = document.createElement('table');
    table.className = 'w-full border-collapse';

    // Check if we have language data
    if (!data.metrics.languages || Object.keys(data.metrics.languages).length === 0) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.className = 'py-3 px-4 text-gray-500 italic';
      cell.textContent = 'No language data available';
      row.appendChild(cell);
      table.appendChild(row);
      tableContainer.appendChild(table);
      return tableContainer;
    }

    // Create header row with Tailwind classes
    const headerRow = document.createElement('tr');
    headerRow.className = 'bg-gray-100 border-b border-gray-200';

    const languageHeader = document.createElement('th');
    languageHeader.className = 'py-2 px-3 text-left font-medium text-gray-700';
    languageHeader.textContent = 'Language';

    const percentageHeader = document.createElement('th');
    percentageHeader.className = 'py-2 px-3 text-left font-medium text-gray-700';
    percentageHeader.textContent = 'Percentage';

    headerRow.appendChild(languageHeader);
    headerRow.appendChild(percentageHeader);
    table.appendChild(headerRow);

    // Sort languages by percentage (descending)
    const sortedLanguages = Object.entries(data.metrics.languages).sort((a, b) => {
      const percentA = parseFloat(a[1]);
      const percentB = parseFloat(b[1]);
      return percentB - percentA;
    });

    // Add language rows with Tailwind classes
    sortedLanguages.forEach(([language, percentage], index) => {
      const row = document.createElement('tr');
      row.className = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

      const langCell = document.createElement('td');
      langCell.className = 'py-2 px-3 text-gray-900';
      langCell.textContent = language;

      const percentCell = document.createElement('td');
      percentCell.className = 'py-2 px-3 text-gray-700';
      percentCell.textContent = percentage;

      row.appendChild(langCell);
      row.appendChild(percentCell);
      table.appendChild(row);
    });

    tableContainer.appendChild(table);
    return tableContainer;
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }
}
