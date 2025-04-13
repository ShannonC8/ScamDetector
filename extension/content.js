chrome.storage.local.get(['email'], (result) => {
  const userEmail = result.email;
  if (!userEmail) return console.log('[ScamDetector] Not logged in.');

  let currentURL = location.href;
  let lastEmailText = '';
  let lastCheckedURL = '';
  let lastContent = '';

  const getEmailContainer = () => {
    // Gmail
    const gmail = document.querySelector('.adn .a3s');
    if (gmail && gmail.innerText.length > 50) return gmail;

    // Outlook
    const outlook = document.querySelector('[data-app-section="MailReadCompose"]');
    if (outlook && outlook.innerText.length > 50) return outlook;

    return null;
  };

  const getBackgroundColor = (score) => {
    if (score >= 80) return '#ffeaea';
    if (score >= 50) return '#fffbe6';
    return '#e7f7eb';
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
      gap: '10px'
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

    document.getElementById('close-btn').onclick = removePanel;
    document.getElementById('report-btn').onclick = () => {
      document.getElementById('report-btn').style.display = 'none';
      document.getElementById('report-form').style.display = 'flex';
    };

    document.getElementById('submit-btn').onclick = () => {
      const reason = document.getElementById('reason').value.trim();
      const highlightVal = document.getElementById('highlight').value.trim();
      if (!reason || !highlightVal) return alert('Please fill in both fields.');

      fetch("http://127.0.0.1:5000/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          emailText,
          reason: reason,
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
  };

  const tryInject = async () => {
    const container = getEmailContainer();
    if (!container) return;

    const emailText = container.innerText.trim();
    const newURL = location.href;

    if (emailText === lastContent && newURL === lastCheckedURL) return;

    lastContent = emailText;
    lastCheckedURL = newURL;

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

  const monitor = () => {
    const container = getEmailContainer();
    if (!container) return removePanel();

    const newURL = location.href;
    if (newURL !== currentURL) {
      currentURL = newURL;
      removePanel();
      tryInject();
    }
  };

  setInterval(monitor, 1000);
});
