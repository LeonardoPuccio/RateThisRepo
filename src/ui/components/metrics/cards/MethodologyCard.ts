import { CollapsibleCard } from '../CollapsibleCard';

/**
 * Card for displaying the scoring methodology
 */
export class MethodologyCard {
  private card: CollapsibleCard;

  /**
   * Create a new methodology card
   */
  constructor() {
    // Create methodology content
    const contentElement = this.createMethodologyContent();
    
    // Create the collapsible card
    this.card = new CollapsibleCard(
      'Scoring Methodology', 
      contentElement, 
      'info',
      true // collapsed by default
    );
  }

  /**
   * Create the methodology content element
   * @returns Content element with methodology description
   */
  private createMethodologyContent(): HTMLElement {
    const content = document.createElement('div');
    
    // Add methodology description
    const overview = document.createElement('p');
    overview.innerHTML = `
      RateThisRepo uses a comprehensive scoring algorithm to evaluate GitHub repositories
      across five key dimensions, with each category contributing 20 points to the total score.
    `;
    content.appendChild(overview);
    
    // Create categories list
    const categoriesList = document.createElement('ul');
    
    // Define the methodology for each category
    const categories = [
      {
        name: 'Popularity (20%)',
        description: 'Based on stars and fork counts, measuring community adoption and interest.'
      },
      {
        name: 'Activity (20%)',
        description: 'Evaluates recency of updates, commit frequency, and ongoing development pace.'
      },
      {
        name: 'Community (20%)',
        description: 'Assesses contributor count, fork usage, and bus factor (knowledge distribution).'
      },
      {
        name: 'Maintenance (20%)',
        description: 'Measures issue resolution rate, PR handling efficiency, and project health.'
      },
      {
        name: 'Documentation (20%)',
        description: 'Evaluates README quality, Wiki presence, website availability, and description completeness.'
      }
    ];
    
    // Add each category to the list
    categories.forEach(category => {
      const item = document.createElement('li');
      const title = document.createElement('strong');
      title.textContent = category.name;
      item.appendChild(title);
      
      const description = document.createElement('span');
      description.textContent = ` - ${category.description}`;
      item.appendChild(description);
      
      categoriesList.appendChild(item);
    });
    
    content.appendChild(categoriesList);
    
    // Add disclaimer
    const disclaimer = document.createElement('p');
    disclaimer.style.fontStyle = 'italic';
    disclaimer.innerHTML = `
      Note: This scoring system provides a quantitative assessment based on publicly available
      repository metrics. While it offers valuable insights into a repository's quality, it
      should be considered alongside qualitative factors like code quality, test coverage,
      and specific project goals.
    `;
    content.appendChild(disclaimer);
    
    return content;
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }
}