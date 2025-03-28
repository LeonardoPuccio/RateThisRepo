import { CollapsibleCard } from '../CollapsibleCard';

/**
 * Card for displaying scoring methodology information
 */
export class MethodologyCard {
  private card: CollapsibleCard;

  /**
   * Create a new methodology card
   */
  constructor() {
    // Create the methodology content
    const contentElement = this.createContentElement();
    
    // Create the collapsible card
    this.card = new CollapsibleCard(
      'Scoring Methodology', 
      contentElement, 
      'tag'
    );
  }

  /**
   * Create the content element with methodology description
   * @returns Content element for the card
   */
  private createContentElement(): HTMLElement {
    const contentElement = document.createElement('div');
    contentElement.innerHTML = `
      <p>Each category contributes 20 points to the total score of 100:</p>
      <ul>
        <li><b>Popularity (20%):</b> Based on stars using a logarithmic scale</li>
        <li><b>Activity (20%):</b> Evaluates recency of updates and development pace</li>
        <li><b>Community (20%):</b> Measures contributor count, forks, and bus factor</li>
        <li><b>Maintenance (20%):</b> Assesses issue handling, PR management, project health</li>
        <li><b>Documentation (20%):</b> Evaluates quality and completeness of documentation</li>
      </ul>
    `;
    
    return contentElement;
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }
}
