// Handles login request
document.getElementById('loginBtn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOGIN_WITH_GOOGLE' }, () => {
      // After sending login message, immediately show a loading message
      document.getElementById('loginBtn').textContent = 'Signing in...';
      document.getElementById('loginBtn').disabled = true;

      // Periodically check for login completion and refresh UI
      const checkInterval = setInterval(() => {
        chrome.storage.local.get(['email'], (result) => {
          if (result.email) {
            clearInterval(checkInterval);
            refreshUI();
          }
        });
      }, 500); // check every 500ms
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

  function revokeToken(token) {
    return fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
      .then(res => {
        console.log('🔐 Token revoked:', res.status);
      });
  }
  
  
  // Allow user to logout
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      if (token) {
        revokeToken(token).finally(() => {
          chrome.identity.clearAllCachedAuthTokens(() => {
            chrome.storage.local.remove(['email', 'name', 'picture'], () => {
              refreshUI();
            });
          });
        });
      } else {
        // No token to revoke
        chrome.storage.local.remove(['email', 'name', 'picture'], () => {
          refreshUI();
        });
      }
    });
  });
  
  
  
  // Always update UI on load
  refreshUI();
  