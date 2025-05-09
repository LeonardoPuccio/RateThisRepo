import {
  createShadowRootUi,
  ShadowRootContentScriptUi,
} from 'wxt/utils/content-script-ui/shadow-root';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import { debugLog, errorLog } from '@/utils/config';
import { ToggleButtonMountData } from '@/ui/interfaces/ui-interfaces';
import { BUTTON_CLASSES } from '@/ui/styles/button-animations';

/**
 * ToggleButton component responsible for the floating action button
 * that toggles the analysis panel
 */
export class ToggleButton {
  private ui: ShadowRootContentScriptUi<ToggleButtonMountData> | null = null;
  private button!: HTMLButtonElement;
  private tooltip!: HTMLDivElement;
  private toggleCallback: () => void;
  private ctx: ContentScriptContext;

  /**
   * Create a new toggle button
   * @param toggleCallback Function to call when button is clicked
   * @param ctx ContentScriptContext from WXT, required for proper operation
   */
  constructor(toggleCallback: () => void, ctx: ContentScriptContext) {
    this.toggleCallback = toggleCallback;
    this.ctx = ctx;
    debugLog('ui', 'Creating ToggleButton with shadow DOM and Tailwind CSS');
  }

  /**
   * Initialize the UI components
   * Must be called before mounting the button
   */
  public async initialize(): Promise<void> {
    try {
      // Create the shadow root UI using WXT's API
      this.ui = await createShadowRootUi(this.ctx, {
        name: 'repo-evaluator-button',
        position: 'inline',
        anchor: 'body',
        mode: 'open',
        onMount: (container, shadow, shadowHost) => {
          debugLog('ui', 'Mounting ToggleButton UI in shadow DOM');

          // Add component class to the container for proper styling in shadow DOM
          container.classList.add(BUTTON_CLASSES.COMPONENT);

          // Apply fixed positioning to the shadow host element
          shadowHost.style.position = 'fixed';
          shadowHost.style.bottom = '0';
          shadowHost.style.right = '0';
          shadowHost.style.width = '100px'; // Just enough to cover the button area
          shadowHost.style.height = '100px';
          shadowHost.style.zIndex = '9999';
          shadowHost.style.overflow = 'visible';
          shadowHost.style.pointerEvents = 'none'; // Let events pass through by default

          // Create button container with padding for animation expansion
          const buttonContainer = document.createElement('div');
          buttonContainer.className = `relative ${BUTTON_CLASSES.CONTAINER}`;
          buttonContainer.style.pointerEvents = 'auto'; // Make sure button captures events
          buttonContainer.style.position = 'absolute';
          buttonContainer.style.bottom = '20px';
          buttonContainer.style.right = '20px';
          buttonContainer.style.padding = '10px'; // Accommodate animation expansion

          // Create tooltip with our standardized classes
          this.tooltip = document.createElement('div');
          this.tooltip.className = BUTTON_CLASSES.TOOLTIP;
          this.tooltip.textContent = 'Analyze Repository';
          this.tooltip.style.top = '-40px'; // Position tooltip above button
          this.tooltip.style.right = '0';

          // Create the button element using Tailwind classes + our custom classes
          this.button = document.createElement('button');
          this.button.className = [
            // Tailwind utility classes
            'w-12 h-12 text-xl rounded-full border-none cursor-pointer',
            'flex items-center justify-center text-white',
            'transition-all duration-200',
            // Our custom animation/state class
            BUTTON_CLASSES.DEFAULT,
          ].join(' ');

          this.button.innerHTML = '📊';
          this.button.setAttribute('aria-label', 'Analyze Repository');

          // Add event listeners
          this.button.addEventListener('click', this.handleClick.bind(this));
          this.button.addEventListener('mouseover', this.showTooltip.bind(this));
          this.button.addEventListener('mouseout', this.hideTooltip.bind(this));

          // Critical: Add wheel event handler to the button container
          buttonContainer.addEventListener(
            'wheel',
            e => {
              // Always stop propagation and prevent default for button area
              e.stopPropagation();
              e.preventDefault();
            },
            { passive: false }
          );

          // Assemble components
          buttonContainer.appendChild(this.tooltip);
          buttonContainer.appendChild(this.button);
          container.appendChild(buttonContainer);

          // Return DOM references for later cleanup
          return {
            container,
            button: this.button,
            tooltip: this.tooltip,
            buttonContainer,
          };
        },
      });

      debugLog('ui', 'ToggleButton UI initialization complete');
    } catch (error) {
      errorLog('ui', 'Error initializing ToggleButton:', error);
      throw error;
    }
  }

  /**
   * Mount the button to the DOM
   */
  public async mount(): Promise<void> {
    if (!this.ui) {
      await this.initialize();
    }

    // Mount the UI using WXT's mount method
    try {
      this.ui?.mount();
      debugLog('ui', 'ToggleButton mounted successfully');
    } catch (error) {
      errorLog('ui', 'Error mounting ToggleButton UI:', error);
      throw error;
    }
  }

  /**
   * Remove the button from the DOM
   */
  public remove(): void {
    if (this.ui) {
      this.ui.remove();
      this.ui = null;
    }
  }

  /**
   * Set whether the button should appear active (panel is open)
   * @param active Whether button should be active
   */
  public setActive(active: boolean): void {
    if (this.button) {
      // Make sure to toggle classes correctly for animation using our constants
      if (active) {
        this.button.classList.remove(BUTTON_CLASSES.DEFAULT);
        this.button.classList.add(BUTTON_CLASSES.ACTIVE);
      } else {
        this.button.classList.remove(BUTTON_CLASSES.ACTIVE);
        this.button.classList.add(BUTTON_CLASSES.DEFAULT);
      }
    }
  }

  /**
   * Show the tooltip
   */
  private showTooltip(): void {
    if (this.tooltip) {
      this.tooltip.classList.add(BUTTON_CLASSES.TOOLTIP_VISIBLE);
    }
  }

  /**
   * Hide the tooltip
   */
  private hideTooltip(): void {
    if (this.tooltip) {
      this.tooltip.classList.remove(BUTTON_CLASSES.TOOLTIP_VISIBLE);
    }
  }

  /**
   * Handle button click
   */
  private handleClick(): void {
    if (this.toggleCallback) {
      this.toggleCallback();
    }
  }
}
