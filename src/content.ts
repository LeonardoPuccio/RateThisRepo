import { RepositoryAnalyzer } from './utils/repository-analyzer';
import { UIManager } from './utils/ui-manager';

// Global state
let isPanelVisible = false;
let currentPanel: HTMLElement | null = null;
let repoAnalysisData: any = null;

// Listen for messages from the extension
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.action === "analyzeRepo") {
    // Execute the main analysis function
    analyzeRepository();
  } else if (message.action === "showPanel") {
    // Show the panel if we have data
    if (repoAnalysisData && !isPanelVisible) {
      currentPanel = UIManager.displayAnalysisPanel(repoAnalysisData);
      isPanelVisible = true;
      updateToggleButton(true);
    }
  }
  // Always return true for async response
  return true;
});

// Check if we're on a GitHub repository page and add button if needed
function initializeOnGitHub(): void {
  // Only run on GitHub repository pages
  if (window.location.href.includes('github.com/') && 
      window.location.pathname.split('/').filter(Boolean).length >= 2) {
    
    // Add the toggle button to the page
    UIManager.addToggleButton(toggleAnalysisPanel);
    
    // Add message in console
    console.log("RateThisRepo extension is active on this page");
  }
}

// Toggle the analysis panel visibility
function toggleAnalysisPanel(): void {
  if (isPanelVisible && currentPanel) {
    // Hide panel
    currentPanel.remove();
    currentPanel = null;
    isPanelVisible = false;
    updateToggleButton(false);
  } else {
    // If we already have results, show them
    if (repoAnalysisData) {
      currentPanel = UIManager.displayAnalysisPanel(repoAnalysisData);
      isPanelVisible = true;
      updateToggleButton(true);
    } else {
      // Otherwise, run the analysis
      analyzeRepository();
    }
  }
}

// Update the toggle button appearance based on panel visibility
function updateToggleButton(isActive: boolean): void {
  const toggleButton = document.getElementById('repo-evaluator-toggle');
  if (toggleButton) {
    if (isActive) {
      toggleButton.classList.add('active');
      toggleButton.title = 'Hide Repository Analysis';
    } else {
      toggleButton.classList.remove('active');
      toggleButton.title = 'Analyze Repository';
    }
  }
}

// Main function to analyze the repository
async function analyzeRepository(): Promise<void> {
  try {
    // Extract username and repository name from URL
    const urlParts = window.location.pathname.split('/').filter(Boolean);
    const username = urlParts[0];
    const repoName = urlParts[1];
    
    // Show loading indication
    UIManager.showLoading();
    
    // Create repository analyzer instance
    const analyzer = new RepositoryAnalyzer(username, repoName);
    
    // Detect README from DOM since we're in the content script
    analyzer.detectReadmeFromDOM(document);
    
    // Analyze the repository
    const result = await analyzer.analyze();
    
    // Save the result for later use
    repoAnalysisData = result;
    
    // Send results to background script for storage
    chrome.runtime.sendMessage({
      action: "analysisComplete",
      data: result
    });
    
    // Display the results visually
    if (isPanelVisible && currentPanel) {
      // Remove the existing panel first
      currentPanel.remove();
    }
    
    // Create and display the UI panel
    currentPanel = UIManager.displayAnalysisPanel(result);
    isPanelVisible = true;
    
    // Update toggle button if it exists
    updateToggleButton(true);
    
    return;
  } catch (error) {
    console.error("Error analyzing repository:", error);
    UIManager.showError("Failed to analyze repository: " + (error as Error).message);
  }
}

// Initialize when the page loads
initializeOnGitHub();
