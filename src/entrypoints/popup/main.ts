import { AnalysisResult } from '@/interfaces/analysis.interface';
import { DEBUG_MODE } from '@/utils/config';
import { ACTIONS, STORAGE_KEYS } from '@/utils/constants';

document.addEventListener('DOMContentLoaded', function () {
  // Get DOM elements
  const notGithubMessage = document.getElementById('not-github') as HTMLElement;
  const githubContent = document.getElementById('github-content') as HTMLElement;
  const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
  const showPanelBtn = document.getElementById('show-panel-btn') as HTMLButtonElement;
  const recentSummary = document.getElementById('recent-summary') as HTMLElement;
  const optionsBtn = document.getElementById('options-btn') as HTMLButtonElement;

  // UI State
  let isPanelVisible = false;
  let hasAnalysisData = false;

  // Check if we're on a GitHub repository page
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url || '';
    const isGitHubRepo = isGitHubRepoPage(url);

    if (isGitHubRepo) {
      notGithubMessage.classList.add('hidden');
      githubContent.classList.remove('hidden');

      // Load state immediately when popup opens
      loadStateFromStorage();
    } else {
      notGithubMessage.classList.remove('hidden');
      githubContent.classList.add('hidden');
    }
  });

  // Set up button click handlers
  analyzeBtn.addEventListener('click', function () {
    runAnalysis();
  });

  showPanelBtn.addEventListener('click', function () {
    toggleAnalysisPanel();
  });

  optionsBtn.addEventListener('click', function () {
    // Open options page
    browser.runtime.openOptionsPage();
  });

  // Functions to handle GitHub repository analysis
  function isGitHubRepoPage(url: string): boolean {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'github.com') return false;

      const pathParts = urlObj.pathname.split('/').filter(p => p);
      return pathParts.length >= 2;
    } catch (e) {
      return false;
    }
  }

  /**
   * Load state from storage and update the UI
   */
  function loadStateFromStorage(): void {
    browser.storage.local.get(
      [STORAGE_KEYS.PANEL_VISIBLE, STORAGE_KEYS.HAS_ANALYSIS_DATA, STORAGE_KEYS.REPO_ANALYSIS],
      function (result) {
        // Update panel visibility state
        if (result[STORAGE_KEYS.PANEL_VISIBLE] !== undefined) {
          isPanelVisible = result[STORAGE_KEYS.PANEL_VISIBLE];
        }

        // Update analysis data state
        if (result[STORAGE_KEYS.HAS_ANALYSIS_DATA] !== undefined) {
          hasAnalysisData = result[STORAGE_KEYS.HAS_ANALYSIS_DATA];
        }

        // Display analysis data if available
        if (result[STORAGE_KEYS.REPO_ANALYSIS]) {
          displayRecentAnalysis(result[STORAGE_KEYS.REPO_ANALYSIS]);
        }

        // Update UI based on state
        updateUIBasedOnState();
      }
    );
  }

  /**
   * Update the UI based on current state
   */
  function updateUIBasedOnState(): void {
    // Show/hide analysis panel button
    if (hasAnalysisData) {
      showPanelBtn.classList.remove('hidden');
    } else {
      showPanelBtn.classList.add('hidden');
    }

    // Update panel button text
    updatePanelButtonText();
  }

  /**
   * Run the repository analysis
   */
  function runAnalysis(): void {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id) {
        // Show loading indicator
        analyzeBtn.textContent = 'Analyzing...';
        analyzeBtn.disabled = true;

        // Send message to content script
        browser.tabs.sendMessage(tabs[0].id, { action: ACTIONS.ANALYZE_REPO }, function (response) {
          // After a delay, reload state to show results
          setTimeout(function () {
            loadStateFromStorage();

            // Reset button
            analyzeBtn.textContent = 'Analyze Repository';
            analyzeBtn.disabled = false;
          }, 2000);
        });
      }
    });
  }

  /**
   * Toggle the analysis panel visibility
   */
  function toggleAnalysisPanel(): void {
    browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0].id) {
        // Determine action based on current state
        const action = isPanelVisible ? ACTIONS.HIDE_PANEL : ACTIONS.SHOW_PANEL;

        // Send message to content script
        browser.tabs.sendMessage(tabs[0].id, { action }, function (response) {
          if (response && response.success) {
            // Update local state
            isPanelVisible = response.isPanelVisible;

            // Update UI
            updateUIBasedOnState();
          } else {
            // If failed, refresh state from storage
            loadStateFromStorage();
          }
        });
      }
    });
  }

  /**
   * Update the panel button text based on panel visibility
   */
  function updatePanelButtonText(): void {
    showPanelBtn.textContent = isPanelVisible ? 'Hide Analysis Panel' : 'Show Analysis Panel';
  }

  /**
   * Display analysis results in the popup
   */
  function displayRecentAnalysis(analysis: AnalysisResult): void {
    // Show the recent analysis section
    recentSummary.classList.remove('hidden');

    // Fill in the data
    const repoNameElement = document.querySelector('.repo-name');
    const scoreValueElement = document.querySelector('.score-value');

    if (repoNameElement) repoNameElement.textContent = analysis.repoName;
    if (scoreValueElement) scoreValueElement.textContent = analysis.score + '/100';

    // Update progress bar
    const progressBar = document.querySelector('.progress-bar') as HTMLElement | null;
    if (progressBar) {
      const score = parseFloat(analysis.score);
      progressBar.style.width = score + '%';

      // Set color based on score
      if (score >= 80) {
        progressBar.className = 'progress-bar bg-success';
      } else if (score >= 60) {
        progressBar.className = 'progress-bar bg-warning';
      } else {
        progressBar.className = 'progress-bar bg-error';
      }
    }

    // Add indicators
    const indicators = document.querySelector('.indicators');
    if (!indicators) return;

    indicators.innerHTML = '';

    // Add top 3 indicators
    const indicatorsToShow = [
      { name: 'Popularity', status: analysis.isPopular, value: `${analysis.metrics.stars} stars` },
      {
        name: 'Activity',
        status: analysis.isActive,
        value: `Updated ${analysis.metrics.daysSinceLastUpdate} days ago`,
      },
      {
        name: 'Documentation',
        status: analysis.isWellDocumented,
        value: analysis.hasReadme ? 'Has README' : 'No README',
      },
    ];

    indicatorsToShow.forEach(ind => {
      const indicator = document.createElement('div');
      indicator.className = 'indicator';

      const iconClass = ind.status ? 'indicator-success' : 'indicator-error';
      const iconSymbol = ind.status ? '✓' : '✗';

      indicator.innerHTML = `
        <div class="indicator-icon ${iconClass}">${iconSymbol}</div>
        <div class="indicator-label">
          <strong>${ind.name}:</strong> ${ind.value}
        </div>
      `;

      indicators.appendChild(indicator);
    });
  }

  // Listen for storage changes to update UI in real-time
  browser.storage.onChanged.addListener(function (changes, namespace) {
    if (namespace === 'local') {
      let stateChanged = false;

      // Check if panel visibility changed
      if (changes[STORAGE_KEYS.PANEL_VISIBLE]) {
        isPanelVisible = changes[STORAGE_KEYS.PANEL_VISIBLE].newValue;
        stateChanged = true;
      }

      // Check if analysis data availability changed
      if (changes[STORAGE_KEYS.HAS_ANALYSIS_DATA]) {
        hasAnalysisData = changes[STORAGE_KEYS.HAS_ANALYSIS_DATA].newValue;
        stateChanged = true;
      }

      // Check if the analysis data itself changed
      if (changes[STORAGE_KEYS.REPO_ANALYSIS] && changes[STORAGE_KEYS.REPO_ANALYSIS].newValue) {
        displayRecentAnalysis(changes[STORAGE_KEYS.REPO_ANALYSIS].newValue);
      }

      // Update UI if needed
      if (stateChanged) {
        updateUIBasedOnState();
      }
    }
  });
});
