import { ToggleButtonMountData } from '@/ui/interfaces/ui-interfaces';
import { BUTTON_CLASSES, combineClasses } from '@/ui/styles/button-animations';
import { debugLog, errorLog, logUIState } from '@/utils/debug';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import {
  createShadowRootUi,
  ShadowRootContentScriptUi,
} from 'wxt/utils/content-script-ui/shadow-root';

/**
 * ToggleButton component responsible for the floating action button
 * that toggles the analysis panel
 */
export class ToggleButton {
  private button!: HTMLButtonElement;
  private ctx: ContentScriptContext;
  private toggleCallback: () => void;
  private tooltip!: HTMLDivElement;
  private ui: null | ShadowRootContentScriptUi<ToggleButtonMountData> = null;

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
        anchor: 'body',
        mode: 'open',
        name: 'repo-evaluator-button',
        onMount: (container, shadow, shadowHost) => {
          debugLog('ui', 'Mounting ToggleButton UI in shadow DOM');

          // Add component base class to the container for proper styling in shadow DOM
          container.classList.add(BUTTON_CLASSES.COMPONENT);

          // Note: We use direct styles for position-critical elements to ensure
          // consistent positioning across browsers and to avoid CSS cascade issues
          shadowHost.style.position = 'fixed';
          shadowHost.style.bottom = '0';
          shadowHost.style.right = '0';
          shadowHost.style.width = '100px';
          shadowHost.style.height = '100px';
          shadowHost.style.zIndex = '9999';
          shadowHost.style.overflow = 'visible';
          shadowHost.style.pointerEvents = 'none';

          // Create button container with group class for CSS-only tooltip functionality
          const buttonContainer = document.createElement('div');
          buttonContainer.className = combineClasses(
            ['group p-[10px] pointer-events-auto'],
            [BUTTON_CLASSES.CONTAINER]
          );

          // Direct positioning is used for exact placement
          buttonContainer.style.position = 'absolute';
          buttonContainer.style.bottom = '20px';
          buttonContainer.style.right = '20px';

          // Tooltip uses group-hover pattern for CSS-only hover effects
          this.tooltip = document.createElement('div');
          this.tooltip.className = combineClasses(
            [
              'absolute -top-10 right-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200',
            ],
            [BUTTON_CLASSES.TOOLTIP]
          );
          this.tooltip.textContent = 'Analyze Repository';

          // Button styling uses a combination of Tailwind and custom animation classes
          this.button = document.createElement('button');
          this.button.className = combineClasses(
            // Tailwind utility classes
            [
              'w-12 h-12 text-xl rounded-full border-none cursor-pointer',
              'flex items-center justify-center text-white',
              'transition-all duration-200',
            ],
            // Custom animation/state class
            [BUTTON_CLASSES.DEFAULT]
          );

          this.button.innerHTML = '📊';
          this.button.setAttribute('aria-label', 'Analyze Repository');

          // Only add click handler - tooltips use CSS hover instead of JS events
          this.button.addEventListener('click', this.handleClick.bind(this));

          // Prevent wheel events to avoid scrolling the page when hovering over the button
          buttonContainer.addEventListener(
            'wheel',
            e => {
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
            button: this.button,
            buttonContainer,
            container,
            tooltip: this.tooltip,
          };
        },
        position: 'inline',
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
      // Log UI state after mounting for debugging
      setTimeout(() => logUIState('button-mounted'), 100);
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
      debugLog('ui', 'Removing ToggleButton');
      this.ui.remove();
      this.ui = null;
      // Log UI state after removing for debugging
      setTimeout(() => logUIState('button-removed'), 100);
    }
  }

  /**
   * Set whether the button should appear active (panel is open)
   * @param active Whether button should be active
   */
  public setActive(active: boolean): void {
    if (this.button) {
      debugLog('ui', `Setting ToggleButton active state to: ${active}`);

      // Toggle classes for animation states
      if (active) {
        this.button.classList.remove(BUTTON_CLASSES.DEFAULT);
        this.button.classList.add(BUTTON_CLASSES.ACTIVE);
      } else {
        this.button.classList.remove(BUTTON_CLASSES.ACTIVE);
        this.button.classList.add(BUTTON_CLASSES.DEFAULT);
      }

      // Log UI state after state change for debugging
      setTimeout(() => logUIState(`button-state-changed-${active ? 'active' : 'inactive'}`), 100);
    }
  }

  /**
   * Handle button click
   */
  private handleClick(): void {
    debugLog('ui', 'ToggleButton clicked');
    if (this.toggleCallback) {
      this.toggleCallback();
    }
  }
}
