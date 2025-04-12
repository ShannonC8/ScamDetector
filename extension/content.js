(function () {
    const log = (...args) => console.log('[ScamDetector]', ...args);
    let currentURL = location.href;
  
    function isEmailView(url) {
      return url.includes('#inbox/') || url.includes('#sent/') || (url.includes('/mail/') && url.includes('/id/'));
    }
  
    function getRiskColor(score) {
      if (score >= 80) return 'rgba(255, 0, 0, 0.85)';
      if (score >= 50) return 'rgba(255, 165, 0, 0.85)';
      if (score >= 20) return 'rgba(255, 255, 0, 0.85)';
      return 'rgba(0, 128, 0, 0.85)';
    }
  
    function highlightText(phrase) {
        const container = document.querySelector('[role="main"]');
        if (!container || !phrase) return;
      
        // Strip leading/trailing quotes if present
        phrase = phrase.trim().replace(/^["']|["']$/g, '');
      
        const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
        let node;
        while ((node = walker.nextNode())) {
          const index = node.nodeValue.indexOf(phrase);
          if (index !== -1) {
            const before = node.nodeValue.slice(0, index);
            const after = node.nodeValue.slice(index + phrase.length);
      
            const highlight = document.createElement('span');
            highlight.className = 'scam-highlight';
            highlight.style.backgroundColor = 'yellow';
            highlight.style.color = 'black';
            highlight.textContent = phrase;
      
            const fragment = document.createDocumentFragment();
            fragment.appendChild(document.createTextNode(before));
            fragment.appendChild(highlight);
            fragment.appendChild(document.createTextNode(after));
      
            node.parentNode.replaceChild(fragment, node);
            break;
          }
        }
      }
      
  
    function injectPanel(score, reason) {
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
      panel.style.flexDirection = 'column';
      panel.style.gap = '8px';
  
      const label = document.createElement('div');
      label.innerText = `📊 Scam Score: ${score}/100`;
  
      const desc = document.createElement('div');
      desc.innerText = reason;
      desc.style.fontSize = '13px';
      desc.style.opacity = '0.9';
  
      const closeBtn = document.createElement('button');
      closeBtn.textContent = '✕';
      closeBtn.style.alignSelf = 'flex-end';
      closeBtn.style.background = 'transparent';
      closeBtn.style.border = 'none';
      closeBtn.style.color = 'white';
      closeBtn.style.fontSize = '18px';
      closeBtn.style.cursor = 'pointer';
      closeBtn.addEventListener('click', () => {
        panel.remove();
        document.querySelectorAll('.scam-highlight').forEach(span => {
          const parent = span.parentNode;
          parent.replaceChild(document.createTextNode(span.textContent), span);
          parent.normalize();
        });
      });
  
      panel.appendChild(label);
      panel.appendChild(desc);
      panel.appendChild(closeBtn);
      document.body.appendChild(panel);
      log('Panel injected with score:', score);
    }
  
    async function tryInject(attempts = 0) {
      const selectors = [
        '[role="main"]',                    // Gmail
        '.readingPane',                     // Outlook Web (reading pane)
        'div[data-message-id]',             // Outlook message body
        '[data-test-id="message-view-body-content"]', // Sometimes used in Outlook
      ];

      const emailContainer = selectors.map(sel => document.querySelector(sel)).find(el => el && el.innerText && el.innerText.length > 50);

      if (emailContainer) {
        const emailText = emailContainer.innerText;
  
        try {
          const res = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emailText })
          });
  
          const data = await res.json();
          if (data.error) {
            console.warn('[ScamDetector] AI error:', data);
            return;
          }
  
          injectPanel(data.score, data.reason);
          highlightText(data.highlight);
        } catch (err) {
          console.error('[ScamDetector] Analysis failed:');
        }
      } else if (attempts < 10) {
        setTimeout(() => tryInject(attempts + 1), 500);
      } else {
        log('Email content not found.');
      }
    }
  
    function removePanel() {
      const existing = document.getElementById('scam-detector-panel');
      if (existing) existing.remove();
      document.querySelectorAll('.scam-highlight').forEach(span => {
        const parent = span.parentNode;
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
      });
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
  