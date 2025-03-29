import { STORAGE_KEYS, ACTIONS } from '../constants';
import { DEBUG_MODE } from '../config';

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  const showFloatingButtonToggle = document.getElementById('show-floating-button') as HTMLInputElement;
  const saveButton = document.getElementById('save-button') as HTMLButtonElement;
  const statusElement = document.getElementById('status') as HTMLDivElement;
  
  // Load current options
  loadOptions();
  
  // Set up save button click handler
  saveButton.addEventListener('click', saveOptions);
  
  /**
   * Load options from storage
   */
  function loadOptions(): void {
    chrome.storage.sync.get({ [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: true }, function(items) {
      showFloatingButtonToggle.checked = items[STORAGE_KEYS.SHOW_FLOATING_BUTTON];
    });
  }
  
  /**
   * Save options to storage
   */
  function saveOptions(): void {
    // Get current values from UI
    const options = {
      [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: showFloatingButtonToggle.checked
    };
    
    // Save to storage
    chrome.storage.sync.set(options, function() {
      // Show save confirmation
      statusElement.style.display = 'block';
      
      // Notify all GitHub tabs about the change
      notifyTabsAboutOptions();
      
      // Hide the confirmation after 2 seconds
      setTimeout(function() {
        statusElement.style.display = 'none';
      }, 2000);
    });
  }
  
  /**
   * Notify all GitHub tabs about options changes
   */
  function notifyTabsAboutOptions(): void {
    chrome.tabs.query({url: "*://github.com/*/*"}, function(tabs) {
      tabs.forEach(tab => {
        if (tab.id) {
          chrome.tabs.sendMessage(tab.id, { action: ACTIONS.OPTIONS_UPDATED });
        }
      });
    });
  }
});
