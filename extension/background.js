chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'LOGIN_WITH_GOOGLE') {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error("Auth error:", chrome.runtime.lastError.message);
        return;
      }

      // Fetch user info from Google APIs
      fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(profile => {
          console.log("✅ User Info:", profile);
          chrome.storage.local.set({
            email: profile.email,
            name: profile.name,
            picture: profile.picture
          }, () => {
            chrome.runtime.sendMessage({ type: 'LOGIN_SUCCESS' });
        });

          fetch("http://127.0.0.1:5000/api/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: profile.email,
              name: profile.name,
              picture: profile.picture})
          });

        })
        .catch(err => console.error("Failed to fetch user profile:", err));
    });
  }
});
