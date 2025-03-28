import { AnalysisResult } from './interfaces/analysis.interface';

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  // Handle messages from popup
  if (message.action === "analyzeRepo") {
    // Send message to content script to analyze the repo
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "analyzeRepo" });
      }
    });
  }
  
  // Handle messages from content script
  if (message.action === "analysisComplete") {
    // Store the analysis results
    chrome.storage.local.set({ repoAnalysis: message.data as AnalysisResult });
  }
  
  // Always return true for async response
  return true;
});

// When the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  console.log("RateThisRepo extension installed/updated");
});
