function display(text) {
    const result = document.getElementById('result');
    result.innerText = text || 'No email content found.';
  }
  
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    const url = tab.url;
    const isGmailMessage = url.includes('#inbox/') || url.includes('#sent/');
    const isOutlookMessage = url.includes('/mail/') && url.includes('/id/');
  
    if (isGmailMessage || isOutlookMessage) {
      chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => document.querySelector('[role="main"]')?.innerText || 'No email body found.'
        },
        ([res]) => display(res.result)
      );
    } else {
      display('Open a specific email to scan.');
    }
  });
  