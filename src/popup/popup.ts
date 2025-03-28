import { AnalysisResult } from '../interfaces/analysis.interface';

document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  const notGithubMessage = document.getElementById('not-github') as HTMLElement;
  const githubContent = document.getElementById('github-content') as HTMLElement;
  const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
  const showPanelBtn = document.getElementById('show-panel-btn') as HTMLButtonElement;
  const recentSummary = document.getElementById('recent-summary') as HTMLElement;
  const optionsBtn = document.getElementById('options-btn') as HTMLButtonElement;
  
  // Check if we're on a GitHub repository page
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const url = tabs[0].url || '';
    const isGitHubRepo = isGitHubRepoPage(url);
    
    if (isGitHubRepo) {
      notGithubMessage.classList.add('hidden');
      githubContent.classList.remove('hidden');
      
      // Load any recent analysis data
      loadRecentAnalysis();
    } else {
      notGithubMessage.classList.remove('hidden');
      githubContent.classList.add('hidden');
    }
  });
  
  // Set up button click handlers
  analyzeBtn.addEventListener('click', function() {
    runAnalysis();
  });
  
  showPanelBtn.addEventListener('click', function() {
    showAnalysisPanel();
  });
  
  optionsBtn.addEventListener('click', function() {
    // Open options page if needed
    chrome.runtime.openOptionsPage();
  });
  
  // Functions to handle GitHub repository analysis
  function isGitHubRepoPage(url: string): boolean {
    // Check if URL is a GitHub repository page
    // Format: https://github.com/username/repo
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname !== 'github.com') return false;
      
      const pathParts = urlObj.pathname.split('/').filter(p => p);
      return pathParts.length >= 2;
    } catch (e) {
      return false;
    }
  }
  
  function runAnalysis(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      // Send message to background script to initiate analysis
      chrome.runtime.sendMessage({ action: "analyzeRepo" });
      
      // Show a loading indicator
      analyzeBtn.textContent = "Analyzing...";
      analyzeBtn.disabled = true;
      
      // After a delay, check for results or enable "Show Panel" button
      setTimeout(function() {
        loadRecentAnalysis();
        analyzeBtn.textContent = "Analyze Repository";
        analyzeBtn.disabled = false;
      }, 2000);
    });
  }
  
  function showAnalysisPanel(): void {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs[0].id) {
        // Send message to content script to show the panel
        chrome.tabs.sendMessage(tabs[0].id, { action: "showPanel" });
      }
    });
  }
  
  function loadRecentAnalysis(): void {
    chrome.storage.local.get('repoAnalysis', function(data) {
      if (data.repoAnalysis) {
        displayRecentAnalysis(data.repoAnalysis as AnalysisResult);
      }
    });
  }
  
  function displayRecentAnalysis(analysis: AnalysisResult): void {
    // Show the recent analysis section
    recentSummary.classList.remove('hidden');
    showPanelBtn.classList.remove('hidden');
    
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
      { name: 'Activity', status: analysis.isActive, value: `Updated ${analysis.metrics.daysSinceLastUpdate} days ago` },
      { name: 'Documentation', status: analysis.isWellDocumented, value: analysis.hasReadme ? 'Has README' : 'No README' }
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
});
