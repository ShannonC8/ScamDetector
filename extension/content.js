(function () {
    const log = (...args) => console.log('[ScamDetector]', ...args);
    let currentURL = location.href;
  
    function isEmailView(url) {
      return url.includes('#inbox/') || url.includes('#sent/') || (url.includes('/mail/') && url.includes('/id/'));
    }
  
    function getRiskColor(score) {
      if (score >= 80) return 'rgba(255, 0, 0, 0.85)'; // red
      if (score >= 50) return 'rgba(255, 165, 0, 0.85)'; // orange
      if (score >= 20) return 'rgba(255, 255, 0, 0.85)'; // yellow
      return 'rgba(0, 128, 0, 0.85)'; // green
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
      label.innerText = score >= 80 ? '⚠️ High Scam Risk – we think this is a scam' : score >= 50 ? '⚠️ Moderate Risk' : score >= 20 ? '⚠️ Low Risk' : '✅ Safe';
      label.style.flex = '1';
  
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'white';
      closeBtn.style.fontSize = '18px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.addEventListener('click', () => panel.remove());
  
      panel.appendChild(label);
      panel.appendChild(closeBtn);
      document.body.appendChild(panel);
      log('Panel injected with score:', score);
    }
  
    function removePanel() {
      const existing = document.getElementById('scam-detector-panel');
      if (existing) {
        existing.remove();
        log('Panel removed.');
      }
    }
  
    function tryInject(attempts = 0) {
      const emailText = document.querySelector('[role="main"]')?.innerText;
      if (emailText && emailText.length > 50) {
        const riskScore = 100;
        injectPanel(riskScore);
      } else if (attempts < 10) {
        setTimeout(() => tryInject(attempts + 1), 500);
      } else {
        log('Email content not found.');
      }
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
  