// background service worker for side panel extension

chrome.runtime.onInstalled.addListener(() => {
  console.log('Side panel extension installed');
});