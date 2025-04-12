
// popup.js
document.getElementById('scanBtn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return document.querySelector('[role="main"]')?.innerText || "";
      }
    }, ([res]) => {
      const emailText = res.result;
      document.getElementById('result').innerText = emailText || 'No email content found.';
    });
  });