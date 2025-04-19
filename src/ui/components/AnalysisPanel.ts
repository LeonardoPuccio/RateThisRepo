import { AnalysisResult } from '@/interfaces/analysis.interface';
import { StateManager } from '@/services/StateManager';
import { IconHelper } from '@/ui/helpers/IconHelper';
import { AnalysisPanelMountData } from '@/ui/interfaces/ui-interfaces';
import { DragService } from '@/ui/services/DragService';
import { BUTTON_CLASSES } from '@/ui/styles/button-animations';
import { DEBUG_MODE, debugLog, errorLog } from '@/utils/config';
import { ContentScriptContext } from 'wxt/utils/content-script-context';
import {
  createShadowRootUi,
  ShadowRootContentScriptUi,
} from 'wxt/utils/content-script-ui/shadow-root';

import { DetailedMetricsPanel } from './DetailedMetricsPanel';
import { HealthIndicators } from './HealthIndicators';
import { ScoreDisplay } from './ScoreDisplay';

/**
 * AnalysisPanel component responsible for showing analysis results
 */
export class AnalysisPanel {
  private closeCallback?: () => void;
  private contentContainer!: HTMLElement;
  private ctx: ContentScriptContext;
  private detailedMetricsPanel!: DetailedMetricsPanel;
  private dragService!: DragService;
  private headerBar!: HTMLElement;
  private healthIndicators!: HealthIndicators;
  private internalOverlay: HTMLElement | null = null;
  private scoreDisplay!: ScoreDisplay;
  private ui: null | ShadowRootContentScriptUi<AnalysisPanelMountData> = null;

  /**
   * Create a new analysis panel
   * @param closeCallback Optional callback that will be called when the panel is closed
   * @param ctx ContentScriptContext from WXT, required for proper operation
   */
  constructor(closeCallback: (() => void) | undefined, ctx: ContentScriptContext) {
    this.closeCallback = closeCallback;
    this.ctx = ctx;
    debugLog('ui', 'Creating AnalysisPanel with shadow DOM and Tailwind CSS');
  }

  /**
   * Hide the panel
   */
  public hide(): void {
    if (this.ui?.shadowHost) {
      this.ui.shadowHost.style.display = 'none';
    }
  }

  /**
   * Initialize the UI components
   * Must be called after construction and before using the panel
   */
  public async initialize(): Promise<void> {
    try {
      // Create the shadow root UI using WXT's API
      this.ui = await createShadowRootUi(this.ctx, {
        anchor: 'body',
        mode: 'open',
        name: 'repo-evaluator-panel',
        onMount: (container, shadow, shadowHost) => {
          debugLog('ui', 'Mounting AnalysisPanel UI');

          // Add component base class
          container.classList.add(BUTTON_CLASSES.COMPONENT);

          // Apply fixed positioning to the host element
          shadowHost.style.position = 'fixed';
          shadowHost.style.top = '0';
          shadowHost.style.left = '0';
          shadowHost.style.width = '100vw';
          shadowHost.style.height = '100vh';
          shadowHost.style.pointerEvents = 'none'; // Let events pass through by default
          shadowHost.style.zIndex = '10000';
          shadowHost.style.overflow = 'visible';

          // Create an internal overlay inside the shadow DOM (replacing the global one)
          this.internalOverlay = document.createElement('div');
          this.internalOverlay.style.position = 'absolute';
          this.internalOverlay.style.top = '0';
          this.internalOverlay.style.left = '0';
          this.internalOverlay.style.width = '100%';
          this.internalOverlay.style.height = '100%';
          this.internalOverlay.style.pointerEvents = 'none'; // Let events pass through by default

          // Create the panel container (will be positioned in the overlay)
          const panelContainer = document.createElement('div');
          panelContainer.className =
            'bg-white rounded-lg shadow-lg overflow-hidden text-gray-800 font-sans';
          panelContainer.style.pointerEvents = 'auto'; // Make the panel capture events
          panelContainer.style.position = 'absolute';
          panelContainer.style.top = '20px';
          panelContainer.style.right = '20px';
          panelContainer.style.width = 'auto';
          panelContainer.style.maxWidth = '800px';
          panelContainer.style.maxHeight = '90vh';
          panelContainer.style.overflow = 'hidden'; // Prevent horizontal overflow
          panelContainer.style.overflowX = 'hidden'; // Prevent horizontal overflow

          // Create panel elements
          this.createPanelElements(panelContainer);

          // Add the panel container to the overlay
          this.internalOverlay.appendChild(panelContainer);

          // Add the overlay to the container
          container.appendChild(this.internalOverlay);

          // Setup drag functionality on the panel container
          this.dragService = new DragService(panelContainer, this.headerBar);

          // Add ID for legacy compatibility
          container.id = 'repo-evaluator-panel';

          // Critical: Add wheel event handler to the panel
          panelContainer.addEventListener(
            'wheel',
            e => {
              // Always stop propagation to prevent events reaching the page
              e.stopPropagation();

              // Check if we're in the scrollable content container
              const isInContent = this.contentContainer.contains(e.target as Node);

              if (isInContent) {
                // Only allow scrolling within the content container
                const isScrollingUp = e.deltaY < 0;
                const isScrollingDown = e.deltaY > 0;
                const isAtTop = this.contentContainer.scrollTop === 0;
                const isAtBottom =
                  Math.abs(
                    this.contentContainer.scrollHeight -
                      this.contentContainer.scrollTop -
                      this.contentContainer.clientHeight
                  ) < 1;

                // Prevent default only when at boundaries
                if ((isScrollingUp && isAtTop) || (isScrollingDown && isAtBottom)) {
                  e.preventDefault();
                }
              } else {
                // Not in content container, prevent default scrolling behavior
                e.preventDefault();
              }
            },
            { passive: false }
          );

          return {
            contentContainer: this.contentContainer,
            panelContainer,
          };
        },
        position: 'inline',
      });

      debugLog('ui', 'AnalysisPanel UI initialized successfully');
    } catch (error) {
      errorLog('ui', 'Error initializing AnalysisPanel:', error);
      throw error;
    }
  }

  /**
   * Mount the panel to the DOM
   * Using correct WXT mounting methodology
   */
  public async mount(): Promise<void> {
    // Ensure UI is initialized
    if (!this.ui) {
      await this.initialize();
    }

    // Mount the UI using WXT's mount method
    try {
      this.ui?.mount();
      debugLog('ui', 'AnalysisPanel mounted successfully');
    } catch (error) {
      errorLog('ui', 'Error mounting AnalysisPanel UI:', error);
      throw error;
    }
  }

  /**
   * Remove the panel from the DOM
   */
  public remove(): void {
    if (this.ui) {
      this.ui.remove();
      this.ui = null;
    }
  }

  /**
   * Populate the panel with analysis data
   * @param resultData Analysis results to display
   */
  public setData(resultData: AnalysisResult): void {
    if (!this.contentContainer) {
      errorLog('ui', 'Cannot set data: Panel not initialized');
      return;
    }

    if (!resultData) {
      errorLog('ui', 'Cannot set data: Invalid data provided');
      return;
    }

    // Clear previous content
    this.contentContainer.innerHTML = '';

    // Create a header with repository title
    const header = document.createElement('div');
    const headerHtml = `
      <h2 class="flex items-center text-xl font-semibold mt-6 mb-4 pb-2 border-b border-gray-200 text-gray-800">
        ${IconHelper.getSvgIconString('repo')}
        <span class="ml-2">Repository Analysis: ${resultData.repoName}</span>
      </h2>
    `;
    header.innerHTML = headerHtml;
    this.contentContainer.appendChild(header);

    // Description
    const description = document.createElement('div');
    description.className = 'italic text-gray-600 mb-4';
    description.textContent = resultData.description || 'No description provided';
    this.contentContainer.appendChild(description);

    // Add score display
    this.scoreDisplay.setScore(parseFloat(resultData.score));
    this.contentContainer.appendChild(this.scoreDisplay.getElement());

    // Add health indicators
    this.healthIndicators.setData(resultData);
    this.contentContainer.appendChild(this.healthIndicators.getElement());

    // Add detailed metrics panel
    this.detailedMetricsPanel.setData(resultData);
    this.contentContainer.appendChild(this.detailedMetricsPanel.getElement());

    // Add footer with disclaimer
    const footer = document.createElement('div');
    footer.className = 'mt-6 pt-4 border-t border-gray-200 text-xs text-gray-600';
    footer.innerHTML = `
      <p class="mb-1">⚠️ Note: This is an automated evaluation based on repository metrics.</p>
      <p>For a complete assessment, also consider code quality, community engagement, and the project's specific goals.</p>
    `;

    this.contentContainer.appendChild(footer);
  }

  /**
   * Show the panel
   */
  public show(): void {
    if (this.ui?.shadowHost) {
      this.ui.shadowHost.style.display = 'block';
    }
  }

  /**
   * Toggle the panel visibility
   */
  public toggle(): void {
    if (this.ui?.shadowHost) {
      if (this.ui.shadowHost.style.display === 'none') {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  /**
   * Create panel elements inside the shadow DOM
   */
  private createPanelElements(uiContainer: HTMLElement): void {
    // Create header/title bar for dragging
    this.headerBar = document.createElement('div');
    this.headerBar.className =
      'bg-gray-100 border-b border-gray-200 rounded-t-lg p-3 flex items-center justify-between cursor-move select-none';

    // Create title for the header
    const headerTitle = document.createElement('div');
    headerTitle.className = 'font-semibold text-sm flex items-center text-gray-800';

    // Add icon to title
    headerTitle.innerHTML = `
      ${IconHelper.getSvgIconString('repo')}
      <span class="ml-2">RateThisRepo Analysis</span>
    `;
    this.headerBar.appendChild(headerTitle);

    // Add a close button with Tailwind classes
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.className =
      'w-6 h-6 text-lg leading-6 text-center cursor-pointer text-gray-600 bg-gray-100/80 rounded-full transition-all hover:bg-gray-200 hover:text-gray-800';
    closeBtn.setAttribute('aria-label', 'Close panel');

    // Set close button behavior
    closeBtn.onclick = () => {
      // First update state in StateManager
      const stateManager = StateManager.getInstance();
      stateManager.setPanelVisibility(false).catch(error => {
        errorLog('ui', 'Error closing panel via X button:', error);
      });

      // Call the close callback if provided
      if (this.closeCallback) {
        this.closeCallback();
      }
    };

    this.headerBar.appendChild(closeBtn);

    // Add header to panel
    uiContainer.appendChild(this.headerBar);

    // Create content container with separate scrolling using Tailwind classes
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'w-full bg-white p-5 overflow-y-auto box-border';
    this.contentContainer.style.overflowX = 'hidden'; // Prevent horizontal scrolling
    this.contentContainer.style.pointerEvents = 'auto'; // Ensure it can capture events

    // Apply max-height using inline style since Tailwind doesn't have exact values
    this.contentContainer.style.height = 'calc(100% - 48px)';
    this.contentContainer.style.maxHeight = 'calc(90vh - 48px)';

    uiContainer.appendChild(this.contentContainer);

    // Initialize sub-components
    this.scoreDisplay = new ScoreDisplay();
    this.healthIndicators = new HealthIndicators();
    this.detailedMetricsPanel = new DetailedMetricsPanel(DEBUG_MODE);
  }
}
