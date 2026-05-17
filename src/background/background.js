// background service worker for side panel extension

chrome.runtime.onInstalled.addListener(async () => {
  console.log('Side panel extension installed');

  // Automatically open side panel when extension icon is clicked
  await chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true,
  });

  // ensure we have a default for tracking flag
  chrome.storage.local.get(['trackingEnabled'], (result) => {
    if (typeof result.trackingEnabled !== 'boolean') {
      chrome.storage.local.set({ trackingEnabled: false });
    }
  });
});