// background service worker for side panel extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Side panel extension installed');
  // ensure we have a default for tracking flag
  chrome.storage.local.get(['trackingEnabled'], (result) => {
    if (typeof result.trackingEnabled !== 'boolean') {
      chrome.storage.local.set({ trackingEnabled: false });
    }
  });
});
