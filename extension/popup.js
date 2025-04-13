// Handles login request
document.getElementById('loginBtn')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOGIN_WITH_GOOGLE' }, () => {
      document.getElementById('loginBtn').textContent = 'Signing in...';
      document.getElementById('loginBtn').disabled = true;

      const checkInterval = setInterval(() => {
        chrome.storage.local.get(['email'], (result) => {
          if (result.email) {
            clearInterval(checkInterval);
            refreshUI();
          }
        });
      }, 500); 
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
        chrome.storage.local.remove(['email', 'name', 'picture'], () => {
          refreshUI();
        });
      }
    });
  });
  
  
  
  // Always update UI on load
  refreshUI();
  