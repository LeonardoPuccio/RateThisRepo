import { DEBUG_MODE } from '@/utils/config';
import { ACTIONS, STORAGE_KEYS } from '@/utils/constants';

// Elements
const showFloatingButtonToggle = document.getElementById(
  'show-floating-button'
) as HTMLInputElement;
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
  browser.storage.sync.get({ [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: true }, function (items) {
    showFloatingButtonToggle.checked = items[STORAGE_KEYS.SHOW_FLOATING_BUTTON];
  });
}

/**
 * Notify all GitHub tabs about options changes
 */
function notifyTabsAboutOptions(): void {
  browser.tabs.query({ url: '*://github.com/*/*' }, function (tabs) {
    tabs.forEach(tab => {
      if (tab.id) {
        browser.tabs.sendMessage(tab.id, { action: ACTIONS.OPTIONS_UPDATED });
      }
    });
  });
}

/**
 * Save options to storage
 */
function saveOptions(): void {
  // Get current values from UI
  const options = {
    [STORAGE_KEYS.SHOW_FLOATING_BUTTON]: showFloatingButtonToggle.checked,
  };

  // Save to storage
  browser.storage.sync.set(options, function () {
    // Show save confirmation
    statusElement.style.display = 'block';

    // Notify all GitHub tabs about the change
    notifyTabsAboutOptions();

    // Hide the confirmation after 2 seconds
    setTimeout(function () {
      statusElement.style.display = 'none';
    }, 2000);
  });
}
