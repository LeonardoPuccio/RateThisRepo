import { IconHelper } from '@/ui/helpers/IconHelper';

/**
 * Component for displaying the overall score
 */
export class ScoreDisplay {
  private bar: HTMLElement;
  private barContainer: HTMLElement;
  private container: HTMLElement;
  private scoreElement: HTMLElement;
  private scoreLabel: HTMLElement;
  private scorePercentLabel: HTMLElement;

  /**
   * Create a new score display component
   */
  constructor() {
    // Create container with Tailwind classes
    this.container = document.createElement('div');
    this.container.className = 'mt-6 mb-6';

    // Create section header with Tailwind classes
    const header = document.createElement('h3');
    header.className = 'flex items-center text-lg font-semibold mb-3 text-gray-800';
    header.innerHTML = `${IconHelper.getSvgIconString('chart')} <span class="ml-2">Summary</span>`;
    this.container.appendChild(header);

    // Create score container with Tailwind classes
    this.scoreElement = document.createElement('div');
    this.scoreElement.className = 'mb-5';

    // Create score label with Tailwind classes
    this.scoreLabel = document.createElement('div');
    this.scoreLabel.className = 'font-bold mb-2 text-gray-800';
    this.scoreLabel.textContent = 'Quality Score:';
    this.scoreElement.appendChild(this.scoreLabel);

    // Create progress bar container with Tailwind classes
    this.barContainer = document.createElement('div');
    this.barContainer.className = 'w-full h-4 bg-gray-200 rounded overflow-hidden';

    // Create progress bar - use rtr-bar for transitions
    this.bar = document.createElement('div');
    this.bar.className = 'rtr-bar bg-gray-400';
    this.bar.style.width = '0%';
    this.barContainer.appendChild(this.bar);
    this.scoreElement.appendChild(this.barContainer);

    // Create percentage label with Tailwind classes
    this.scorePercentLabel = document.createElement('div');
    this.scorePercentLabel.className = 'mt-1 text-sm text-gray-600';
    this.scorePercentLabel.textContent = '0%';
    this.scoreElement.appendChild(this.scorePercentLabel);

    this.container.appendChild(this.scoreElement);
  }

  /**
   * Get the component's root element
   * @returns The component's DOM element
   */
  public getElement(): HTMLElement {
    return this.container;
  }

  /**
   * Set the score to display
   * @param score Score value (0-100)
   */
  public setScore(score: number | string): void {
    // Convert string to number if needed and handle invalid inputs
    let numericScore: number;

    if (typeof score === 'string') {
      // Parse the string and handle invalid values
      const parsedScore = parseFloat(score);
      numericScore = isNaN(parsedScore) ? 50 : parsedScore; // Default to 50 if invalid
    } else if (typeof score === 'number') {
      numericScore = score;
    } else {
      // If somehow we get an invalid type, default to 50
      numericScore = 50;
    }

    // Ensure score is within range
    const scorePercent = Math.min(100, Math.max(0, numericScore));

    // Update score label with a clean formatted score
    this.scoreLabel.textContent = `Quality Score: ${scorePercent.toFixed(2)}/100`;

    // Determine status based on score
    let status = 'error';
    if (scorePercent >= 80) {
      status = 'success';
    } else if (scorePercent >= 60) {
      status = 'warning';
    }

    // Update bar color using our custom classes
    this.bar.className = `rtr-bar ${status}`;
    this.bar.style.width = `${scorePercent}%`;

    // Update percentage label - also add color based on status
    this.scorePercentLabel.textContent = `${Math.round(scorePercent)}%`;
    this.scorePercentLabel.className = `mt-1 text-sm font-medium rtr-${status}`;
  }
}
