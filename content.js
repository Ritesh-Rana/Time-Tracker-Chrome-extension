chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.action == "updateTotalTime") {
      // Update the total time spent on the current website
      chrome.storage.local.get({ totalTime: {} }, function(result) {
        const totalTime = result.totalTime;
        const url = new URL(sender.tab.url);
        const hostname = url.hostname;
        totalTime[hostname] = (totalTime[hostname] || 0) + request.timeSpent;

        // Save the updated total time
        chrome.storage.local.set({ totalTime: totalTime });
      });
    }
  }
);
