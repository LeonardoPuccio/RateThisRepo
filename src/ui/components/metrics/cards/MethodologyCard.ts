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
      'lightbulb',
      true // collapsed by default
    );
  }

  /**
   * Get the card element
   * @returns The card DOM element
   */
  public getElement(): HTMLElement {
    return this.card.getElement();
  }

  /**
   * Create the methodology content element
   * @returns Content element with methodology description
   */
  private createMethodologyContent(): HTMLElement {
    // Create container with Tailwind classes
    const content = document.createElement('div');
    content.className = 'space-y-4 text-black';

    // Add methodology description with Tailwind classes
    const overview = document.createElement('p');
    overview.className = 'text-gray-800';
    overview.innerHTML = `
      RateThisRepo uses a comprehensive scoring algorithm to evaluate GitHub repositories
      across five key dimensions, with each category contributing 20 points to the total score.
    `;
    content.appendChild(overview);

    // Create categories list with Tailwind classes
    const categoriesList = document.createElement('ul');
    categoriesList.className = 'space-y-2 pl-5 list-disc';

    // Define the methodology for each category
    const categories = [
      {
        description: 'Based on stars and fork counts, measuring community adoption and interest.',
        name: 'Popularity (20%)',
      },
      {
        description:
          'Evaluates recency of updates, commit frequency, and ongoing development pace.',
        name: 'Activity (20%)',
      },
      {
        description:
          'Assesses contributor count, fork usage, and bus factor (knowledge distribution).',
        name: 'Community (20%)',
      },
      {
        description: 'Measures issue resolution rate, PR handling efficiency, and project health.',
        name: 'Maintenance (20%)',
      },
      {
        description:
          'Evaluates README quality, Wiki presence, website availability, and description completeness.',
        name: 'Documentation (20%)',
      },
    ];

    // Add each category to the list with Tailwind classes
    categories.forEach(category => {
      const item = document.createElement('li');
      item.className = 'text-gray-800';

      const title = document.createElement('strong');
      title.className = 'font-medium';
      title.textContent = category.name;
      item.appendChild(title);

      const description = document.createElement('span');
      description.textContent = ` - ${category.description}`;
      item.appendChild(description);

      categoriesList.appendChild(item);
    });

    content.appendChild(categoriesList);

    // Add disclaimer with Tailwind classes
    const disclaimer = document.createElement('p');
    disclaimer.className = 'italic text-gray-600 mt-4';
    disclaimer.innerHTML = `
      Note: This scoring system provides a quantitative assessment based on publicly available
      repository metrics. While it offers valuable insights into a repository's quality, it
      should be considered alongside qualitative factors like code quality, test coverage,
      and specific project goals.
    `;
    content.appendChild(disclaimer);

    return content;
  }
}
