// Handles login request
document.getElementById('loginBtn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOGIN_WITH_GOOGLE' }, () => {
      // After sending login message, immediately show a loading message
      document.getElementById('loginBtn').textContent = 'Signing in...';
      document.getElementById('loginBtn').disabled = true;
    });
  });
  
  // Sync UI on popup open
  function refreshUI() {
    chrome.storage.local.get(['email'], (result) => {
      if (result.email) {
        document.getElementById('login').style.display = 'none';
        document.getElementById('welcome').style.display = 'block';
        document.getElementById('email').innerText = `Logged in as ${result.email}`;
      } else {
        document.getElementById('login').style.display = 'block';
        document.getElementById('welcome').style.display = 'none';
      }
    });
  }
  
  // Allow user to logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    chrome.identity.clearAllCachedAuthTokens(() => {
      chrome.storage.local.clear(() => {
        refreshUI(); // Update UI after logout
      });
    });
  });
  
  // Always update UI on load
  refreshUI();
  