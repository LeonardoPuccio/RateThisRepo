import { IconHelper } from '@ui/helpers/IconHelper';

/**
 * Component for displaying the overall score
 */
export class ScoreDisplay {
  private container: HTMLElement;
  private scoreElement: HTMLElement;
  private scoreLabel: HTMLElement;
  private barContainer: HTMLElement;
  private bar: HTMLElement;
  private scorePercentLabel: HTMLElement;
  
  /**
   * Create a new score display component
   */
  constructor() {
    // Create container with direct DOM manipulation
    this.container = document.createElement('div');
    
    // Create section header
    const header = document.createElement('h2');
    header.innerHTML = `${IconHelper.getSvgIconString('chart')} Summary`;
    this.container.appendChild(header);
    
    // Create score container
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.marginBottom = '20px';
    
    // Create score label
    this.scoreLabel = document.createElement('div');
    this.scoreLabel.style.fontWeight = 'bold';
    this.scoreLabel.style.marginBottom = '8px';
    this.scoreLabel.textContent = 'Quality Score:';
    this.scoreElement.appendChild(this.scoreLabel);
    
    // Create progress bar container
    this.barContainer = document.createElement('div');
    this.barContainer.className = 'bar-container';
    
    // Create progress bar
    this.bar = document.createElement('div');
    this.bar.className = 'bar';
    this.bar.style.width = '0%';
    this.barContainer.appendChild(this.bar);
    this.scoreElement.appendChild(this.barContainer);
    
    // Create percentage label
    this.scorePercentLabel = document.createElement('div');
    this.scorePercentLabel.style.marginTop = '4px';
    this.scorePercentLabel.textContent = '0%';
    this.scoreElement.appendChild(this.scorePercentLabel);
    
    this.container.appendChild(this.scoreElement);
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
    
    // Update bar color
    const scoreColorClass = scorePercent >= 80 ? 'success' : 
                           scorePercent >= 60 ? 'warning' : 'error';
    
    this.bar.className = `bar ${scoreColorClass}`;
    this.bar.style.width = `${scorePercent}%`;
    
    // Update percentage label
    this.scorePercentLabel.textContent = `${Math.round(scorePercent)}%`;
  }
  
  /**
   * Add the component to a parent element
   * @param parent Parent element
   */
  public appendTo(parent: HTMLElement): void {
    parent.appendChild(this.container);
  }
}