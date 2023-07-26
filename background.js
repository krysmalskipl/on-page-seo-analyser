let noindexInfo = {};

chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    noindexInfo[details.url] = 'X-Robots-Tag has not been found.';
    for (var i = 0; i < details.responseHeaders.length; ++i) {
      if (details.responseHeaders[i].name.toLowerCase() === 'x-robots-tag') {
        if (details.responseHeaders[i].value.includes('noindex')) {
          noindexInfo[details.url] = 'This page has a noindex tag in HTTP headers.';
        }
      }
    }
  },
  { urls: ["<all_urls>"] },
  ["responseHeaders"]
);

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request.action == "getNoindexInfo") {
      sendResponse({ noindexInfo: noindexInfo[request.url] || 'X-Robots-Tag has not been found.' });
    }
  }
);
