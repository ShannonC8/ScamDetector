(function () {
    const log = (...args) => console.log('[ScamDetector]', ...args);
    let currentURL = location.href;
  
    function isEmailView(url) {
      return url.includes('#inbox/') || url.includes('#sent/') || (url.includes('/mail/') && url.includes('/id/'));
    }
  
    function getRiskColor(score) {
      score = parseInt(score);
      if (score >= 80) return 'rgba(255, 0, 0, 0.85)';
      if (score >= 50) return 'rgba(255, 165, 0, 0.85)';
      if (score >= 20) return 'rgba(255, 255, 0, 0.85)';
      return 'rgba(0, 128, 0, 0.85)';
    }
  
    function injectPanel(score) {
      if (document.getElementById('scam-detector-panel')) return;
  
      const panel = document.createElement('div');
      panel.id = 'scam-detector-panel';
      panel.style.position = 'fixed';
      panel.style.bottom = '20px';
      panel.style.right = '20px';
      panel.style.backgroundColor = getRiskColor(score);
      panel.style.color = 'white';
      panel.style.padding = '14px 18px';
      panel.style.borderRadius = '10px';
      panel.style.zIndex = '9999';
      panel.style.maxWidth = '80vw';
      panel.style.minWidth = '240px';
      panel.style.fontSize = '15px';
      panel.style.fontFamily = 'Arial, sans-serif';
      panel.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
      panel.style.display = 'flex';
      panel.style.alignItems = 'center';
      panel.style.justifyContent = 'space-between';
      panel.style.gap = '12px';
  
      const label = document.createElement('div');
      label.innerText = `📊 Scam Score: ${score}/100`;
      label.style.flex = '1';
  
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'white';
      closeBtn.style.fontSize = '18px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.addEventListener('click', () => {
        panel.remove();
      });
  
      panel.appendChild(label);
      panel.appendChild(closeBtn);
      document.body.appendChild(panel);
      log('Panel injected with score:', score);
    }
  
    async function tryInject(attempts = 0) {
        const emailContainer = document.querySelector('[role="main"]');
        if (emailContainer && emailContainer.innerText.length > 50) {
          const emailText = emailContainer.innerText;
          console.log("[ScamDetector] Email body:\n\n", emailText);  // 👈 FULL BODY PRINT
      
          let score = 50; // fallback score
      
          try {
            const res = await fetch('http://127.0.0.1:5000/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ emailText })
            });
            const data = await res.json();
            console.log('[ScamDetector] GPT response:', data);
            score = parseInt(data.result);
          } catch (err) {
            console.error('[ScamDetector] Analysis failed:', err);
          }
      
          injectPanel(score);
        } else if (attempts < 10) {
          setTimeout(() => tryInject(attempts + 1), 500);
        } else {
          console.warn('[ScamDetector] Email content not found.');
        }
      }
      
  
    function removePanel() {
      const existing = document.getElementById('scam-detector-panel');
      if (existing) existing.remove();
    }
  
    setInterval(() => {
      const newURL = location.href;
      if (newURL !== currentURL) {
        currentURL = newURL;
        log('URL changed:', newURL);
        removePanel();
        if (isEmailView(newURL)) {
          tryInject();
        }
      }
    }, 1000);
  
    if (isEmailView(currentURL)) {
      tryInject();
    }
  })();