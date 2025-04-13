chrome.storage.local.get(['email'], (result) => {
  const userEmail = result.email;
  if (!userEmail) return console.log('[ScamDetector] Not logged in.');

  let currentURL = location.href;
  let lastEmailText = '';

  const getEmailContainer = () => {
    // Gmail
    const gmail = document.querySelector('.adn .a3s');
    if (gmail && gmail.innerText.length > 50) return gmail;

    // Outlook
    const outlook = document.querySelector('[data-app-section="MailReadCompose"]');
    if (outlook && outlook.innerText.length > 50) return outlook;

    return null;
  };

  const isViewingEmail = () => !!getEmailContainer();

  const getBackgroundColor = (score) => {
    if (score >= 80) return '#ffeaea';   // red
    if (score >= 50) return '#fffbe6';   // yellow
    return '#e7f7eb';                    // green
  };

  const removePanel = () => {
    const panel = document.getElementById('scam-detector-panel');
    if (panel) panel.remove();
    document.querySelectorAll('.scam-highlight').forEach(span => {
      const parent = span.parentNode;
      parent.replaceChild(document.createTextNode(span.textContent), span);
      parent.normalize();
    });
  };

  const highlightText = (phrase) => {
    const container = getEmailContainer();
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
          padding: '0 3px'
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
  };

  const injectPanel = (score, reason, highlight, emailText) => {
    removePanel();
    lastEmailText = emailText;

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

    panel.innerHTML = `
      <div style="font-weight:bold">📊 Scam Score: ${score}/100</div>
      <div style="font-size:14px">${reason}</div>
      ${highlight && highlight !== 'None' ? `<div style="background:#fff3b0;padding:6px;border-radius:6px">⚠️ ${highlight}</div>` : ''}
      <button id="report-btn" style="background:#1a73e8;color:white;padding:6px;border:none;border-radius:6px;cursor:pointer">Report this Email</button>
      <div id="report-form" style="display:none;flex-direction:column;gap:6px">
        <textarea id="reason" rows="2" placeholder="Why is this email suspicious?" style="padding:6px;border:1px solid #ccc;border-radius:6px"></textarea>
        <textarea id="highlight" rows="2" placeholder="Suspicious sentence(s)..." style="padding:6px;border:1px solid #ccc;border-radius:6px"></textarea>
        <button id="submit-btn" style="background:#34a853;color:white;border:none;padding:6px;border-radius:6px;cursor:pointer">Submit Report</button>
      </div>
      <span id="close-btn" style="align-self:flex-end;cursor:pointer;font-weight:bold;font-size:18px">×</span>
    `;

    document.body.appendChild(panel);

    // Report logic
    document.getElementById('close-btn').onclick = removePanel;
    document.getElementById('report-btn').onclick = () => {
      document.getElementById('report-btn').style.display = 'none';
      document.getElementById('report-form').style.display = 'flex';
    };

    document.getElementById('submit-btn').onclick = () => {
      const reasonVal = document.getElementById('reason').value.trim();
      const highlightVal = document.getElementById('highlight').value.trim();

      if (!reasonVal || !highlightVal) return alert('Please fill in both fields.');

      fetch("http://127.0.0.1:5000/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          emailText,
          reason: reasonVal,
          highlight: highlightVal
        })
      }).then(res => res.json()).then(data => {
        if (data.status === 'reported') {
          document.getElementById('submit-btn').textContent = '✅ Reported';
          document.getElementById('submit-btn').style.backgroundColor = '#999';
        }
      }).catch(() => {
        alert('Failed to report.');
      });
    };

    highlightText(highlight);
  };

  const tryInject = async () => {
    const container = getEmailContainer();
    if (!container) return;

    const emailText = container.innerText.trim();
    if (!emailText || emailText === lastEmailText) return;

    try {
      const res = await fetch("http://127.0.0.1:5000/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailText, email: userEmail })
      });

      const data = await res.json();
      if (!data.error) injectPanel(data.score, data.reason, data.highlight, emailText);
    } catch (e) {
      console.error('[ScamDetector] Analysis failed:', e);
    }
  };

  const monitorChanges = () => {
    const newURL = location.href;
    if (newURL !== currentURL) {
      currentURL = newURL;
      removePanel();
    }

    if (isViewingEmail()) {
      tryInject();
    } else {
      removePanel();
    }
  };

  setInterval(monitorChanges, 1000);
  if (isViewingEmail()) tryInject();
});
