// Extract info from page
function extractVideoInfo() {
  // Video ID can usually be parsed from URL by popup, but if we need DOM data:
  const titleEl = document.querySelector('h1.title yt-formatted-string, h1.ytd-video-primary-info-renderer');
  const title = titleEl ? titleEl.textContent : document.title;
  return {
    title: title,
    url: window.location.href
  };
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getVideoInfo") {
    sendResponse(extractVideoInfo());
  }
});
