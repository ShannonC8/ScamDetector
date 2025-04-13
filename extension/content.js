chrome.storage.local.get(['email'], (result) => {
  const userEmail = result.email;
  if (!userEmail) {
    console.log('[ScamDetector] User not logged in.');
    return;
  }

  let currentURL = location.href;

  const log = (...args) => console.log('[ScamDetector]', ...args);

  const isEmailView = (url) =>
    url.includes('#inbox/') || url.includes('#sent/') || url.includes('/mail/');

  const getBackgroundColor = (score) => {
    if (score >= 80) return '#ffeaea';     // Light red
    if (score >= 50) return '#fffbe6';     // Light yellow
    return '#e7f7eb';                      // Light green
  };

  function highlightText(phrase) {
    const container = document.querySelector('.adn .a3s');
    if (!container || !phrase) return;

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
        Object.assign(highlight.style, {
          backgroundColor: '#fff3b0',
          color: '#222',
          fontWeight: 'bold',
          borderRadius: '4px',
          padding: '0 2px'
        });
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

  function injectPanel(score, reason, highlight, emailText) {
    if (document.getElementById('scam-detector-panel')) return;

    const panel = document.createElement('div');
    panel.id = 'scam-detector-panel';
    Object.assign(panel.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      backgroundColor: getBackgroundColor(score),
      border: '1px solid #ccc',
      padding: '16px',
      borderRadius: '12px',
      zIndex: '9999',
      maxWidth: '320px',
      boxShadow: '0 8px 18px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      transition: 'all 0.3s ease-in-out'
    });

    const label = document.createElement('div');
    label.innerText = `📊 Scam Score: ${score}/100`;
    label.style.fontWeight = 'bold';

    const desc = document.createElement('div');
    desc.innerText = reason;
    desc.style.fontSize = '14px';

    panel.appendChild(label);
    panel.appendChild(desc);

    if (highlight && highlight !== "None") {
      const highlightDisplay = document.createElement('div');
      highlightDisplay.innerText = `⚠️ Suspicious: ${highlight}`;
      Object.assign(highlightDisplay.style, {
        backgroundColor: '#fff3b0',
        color: '#111',
        padding: '6px',
        borderRadius: '6px',
        fontSize: '13px'
      });
      panel.appendChild(highlightDisplay);
    }

    // Show/Hide report form
    const reportBtn = document.createElement('button');
    reportBtn.textContent = 'Report this Email';
    Object.assign(reportBtn.style, {
      backgroundColor: '#1a73e8',
      color: 'white',
      padding: '6px',
      borderRadius: '6px',
      border: 'none',
      fontSize: '14px',
      cursor: 'pointer'
    });

    const reportForm = document.createElement('div');
    reportForm.style.display = 'none';
    reportForm.style.flexDirection = 'column';
    reportForm.style.gap = '6px';

    const reasonInput = document.createElement('textarea');
    reasonInput.placeholder = 'Why is this email suspicious?';
    reasonInput.style.padding = '6px';
    reasonInput.style.borderRadius = '6px';
    reasonInput.style.border = '1px solid #ccc';
    reasonInput.rows = 2;

    const highlightInput = document.createElement('textarea');
    highlightInput.placeholder = 'Suspicious sentence(s)...';
    highlightInput.style.padding = '6px';
    highlightInput.style.borderRadius = '6px';
    highlightInput.style.border = '1px solid #ccc';
    highlightInput.rows = 2;

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Submit Report';
    Object.assign(submitBtn.style, {
      backgroundColor: '#34a853',
      color: 'white',
      padding: '6px',
      borderRadius: '6px',
      border: 'none',
      fontWeight: 'bold',
      cursor: 'pointer'
    });

    submitBtn.onclick = () => {
      const reasonVal = reasonInput.value.trim();
      const highlightVal = highlightInput.value.trim();
      if (!reasonVal || !highlightVal) {
        alert("Please fill in both fields.");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";

      fetch("http://127.0.0.1:5000/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          emailText,
          reason: reasonVal,
          highlight: highlightVal
        })
      })
        .then(res => res.json())
        .then(data => {
          if (data.status === "reported") {
            submitBtn.textContent = "✅ Reported";
            submitBtn.style.backgroundColor = "#999";
          }
        })
        .catch(err => {
          console.error("[ScamDetector] Report error:", err);
          alert("Failed to report.");
          submitBtn.textContent = "Submit Report";
        })
        .finally(() => {
          submitBtn.disabled = false;
        });
    };

    reportForm.appendChild(reasonInput);
    reportForm.appendChild(highlightInput);
    reportForm.appendChild(submitBtn);
    panel.appendChild(reportBtn);
    panel.appendChild(reportForm);

    reportBtn.onclick = () => {
      reportBtn.style.display = 'none';
      reportForm.style.display = 'flex';
    };

    const closeBtn = document.createElement('span');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      alignSelf: 'flex-end',
      cursor: 'pointer',
      fontWeight: 'bold',
      fontSize: '18px',
      color: '#444'
    });
    closeBtn.onclick = () => {
      panel.remove();
      document.querySelectorAll('.scam-highlight').forEach(span => {
        const parent = span.parentNode;
        parent.replaceChild(document.createTextNode(span.textContent), span);
        parent.normalize();
      });
    };

    panel.appendChild(closeBtn);
    document.body.appendChild(panel);
    log("Injected panel with score:", score);
  }

  async function tryInject(attempts = 0) {
    const selectors = [
      '[role="main"]',
      '.readingPane',
      'div[data-message-id]',
      '[data-test-id="message-view-body-content"]',
    ];
    const emailContainer = selectors.map(sel => document.querySelector(sel))
      .find(el => el && el.innerText && el.innerText.length > 50);

    if (!emailContainer) {
      if (attempts < 10) return setTimeout(() => tryInject(attempts + 1), 500);
      return log("Email content not found.");
    }

    const emailText = emailContainer.innerText;

    try {
      const res = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailText, email: userEmail })
      });

      const data = await res.json();
      if (data.error) return log("AI error:", data.error);
      injectPanel(data.score, data.reason, data.highlight, emailText);
    } catch (err) {
      console.error('[ScamDetector] Analysis failed:', err);
    }
  }

  function removePanel() {
    const panel = document.getElementById('scam-detector-panel');
    if (panel) panel.remove();

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
});
