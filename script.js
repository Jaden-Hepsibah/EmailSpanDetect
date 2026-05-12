
const store = {
  inbox: [],
  spam:  [],
  trash: []
};

let lastResult   = null;
let sidebarOpen  = true;

const SPAM_KEYWORDS = [

  "free", "win", "winner", "won", "prize", "claim", "reward", "bonus",
  "cash", "money", "earn", "income", "profit", "rich", "millionaire",
  "lottery", "jackpot", "dollar",

  "urgent", "hurry", "limited", "expires", "act now", "last chance",
  "don't miss", "immediately", "today only", "offer expires", "deadline",

  "click here", "click below", "verify", "confirm", "account suspended",
  "verify account", "unusual activity", "security alert", "bank account",
  "credit card", "password", "social security", "ssn", "wire transfer",
  "bitcoin", "crypto", "investment",

  "viagra", "cialis", "pharmacy", "prescription", "pills",
  "weight loss", "lose weight",

  "nigerian", "prince", "inheritance", "funds transfer", "million dollars",
  "beneficiary", "dear friend", "greetings", "congratulations",
  "selected", "chosen", "lucky", "100% free", "no cost", "risk free",
  "guaranteed", "no risk", "double your", "work from home",
  "make money fast", "passive income", "get rich",

  "unsubscribe", "remove from list", "opt out", "you have been selected",
  "your account", "update your", "verify your", "confirm your",
  "login required",

  "!!", "???", "$$$", "###", "***"
];

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('gone');
    document.getElementById('app').classList.add('visible');
  }, 4000);
});

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  document.getElementById('sidebar').classList.toggle('collapsed', !sidebarOpen);
}
const VIEW_TITLES = {
  checker : 'Email Checker',
  inbox   : 'Inbox',
  spam    : 'Spam Emails',
  trash   : 'Trash'
};

function showView(id) {
 
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));


  document.getElementById('view-' + id).classList.add('active');
  document.querySelector('[data-view="' + id + '"]').classList.add('active');
  document.getElementById('topbar-title').textContent = VIEW_TITLES[id];

  renderLists();
}

function analyzeEmail() {
  const from    = document.getElementById('inp-from').value.trim();
  const subject = document.getElementById('inp-subject').value.trim();
  const body    = document.getElementById('inp-body').value.trim();

  if (!subject && !body) {
    showToast('⚠️', 'Please enter at least a subject or body.');
    return;
  }

  const fullText = (from + ' ' + subject + ' ' + body).toLowerCase();
  const found = [];
  SPAM_KEYWORDS.forEach(keyword => {
    if (fullText.includes(keyword.toLowerCase()) && !found.includes(keyword)) {
      found.push(keyword);
    }
  });

  const baseScore = Math.min(found.length / 6, 1); 


  const highImpactWords = [
    'free', 'win', 'won', 'lottery', 'congratulations',
    'click here', 'verify account', 'bitcoin', 'urgent', 'prize'
  ];
  const extraHits = found.filter(k => highImpactWords.includes(k.toLowerCase())).length;
  let score = Math.min(baseScore + extraHits * 0.07, 1);

  const pct    = Math.round(score * 100);
  const isSpam = pct >= 30;

  
  const now   = new Date();
  const dtStr = now.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  }) + ' ' + now.toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  lastResult = { from, subject, body, found, pct, isSpam, datetime: dtStr };

  showResultPanel(found, pct, isSpam, dtStr);
}


function showResultPanel(found, pct, isSpam, dtStr) {
  const panel = document.getElementById('result-panel');


  panel.classList.remove('show');
  void panel.offsetWidth;
  panel.classList.add('show');

  const icon    = document.getElementById('res-icon');
  const verdict = document.getElementById('res-verdict');
  const meta    = document.getElementById('res-meta');

  if (isSpam) {
    icon.textContent    = '🚨';
    icon.className      = 'result-icon spam-icon';
    verdict.textContent = 'SPAM DETECTED';
    verdict.className   = 'result-verdict spam';
    meta.textContent    = `This email is likely spam — ${found.length} suspicious keyword${found.length !== 1 ? 's' : ''} detected.`;
  } else {
    icon.textContent    = '✅';
    icon.className      = 'result-icon safe-icon';
    verdict.textContent = 'LEGITIMATE EMAIL';
    verdict.className   = 'result-verdict safe';
    meta.textContent    = found.length > 0
      ? `Low spam likelihood — only ${found.length} minor keyword match.`
      : 'No spam keywords found. This email appears clean.';
  }

  const pctLabel = document.getElementById('res-pct-label');
  const pctBar   = document.getElementById('res-pct-bar');
  pctLabel.textContent = pct + '%';
  pctBar.style.width   = '0%';
  pctBar.className     = 'pct-fill ' + (isSpam ? 'spam-fill' : 'safe-fill');
  setTimeout(() => { pctBar.style.width = pct + '%'; }, 60);


  const kChips = document.getElementById('res-keywords');
  if (found.length === 0) {
    kChips.innerHTML = '<span class="kw-chip none">No spam keywords found</span>';
  } else {
    kChips.innerHTML = found.map(k =>
      `<span class="kw-chip found">${escHtml(k)}</span>`
    ).join('');
  }


  document.getElementById('res-datetime').textContent = '🕐 Checked: ' + dtStr;
}


function saveToFolder() {
  if (!lastResult) return;

  const email = { ...lastResult, id: Date.now() };

  if (email.isSpam) {
    store.spam.unshift(email);
    showToast('🚨', 'Saved to Spam folder.');
  } else {
    store.inbox.unshift(email);
    showToast('📥', 'Saved to Inbox.');
  }

  updateBadges();

  document.getElementById('inp-from').value    = '';
  document.getElementById('inp-subject').value = '';
  document.getElementById('inp-body').value    = '';
  document.getElementById('result-panel').classList.remove('show');
  lastResult = null;
}

function deleteEmail(folder, id) {
  const idx = store[folder].findIndex(e => e.id === id);
  if (idx === -1) return;

  const [email] = store[folder].splice(idx, 1);

  if (folder !== 'trash') {
    
    email.deletedFrom = folder;
    store.trash.unshift(email);
    showToast('🗑️', 'Moved to Trash.');
  } else {
   
    showToast('✓', 'Permanently deleted.');
  }

  updateBadges();
  renderLists();
}

function emptyTrash() {
  if (store.trash.length === 0) {
    showToast('ℹ️', 'Trash is already empty.');
    return;
  }
  store.trash = [];
  updateBadges();
  renderLists();
  showToast('🗑️', 'Trash emptied.');
}

const AVATAR_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6'
];

function getAvatarColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getAvatarLetter(str) {
  return str.trim().charAt(0).toUpperCase() || '?';
}

function renderList(folder, listId, emptyMsg) {
  const el     = document.getElementById(listId);
  const emails = store[folder];

  if (emails.length === 0) {
    el.innerHTML = `
      <div class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="4" width="20" height="16" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
        <h3>${emptyMsg.title}</h3>
        <p>${emptyMsg.sub}</p>
      </div>`;
    return;
  }

  el.innerHTML = emails.map(email => {
    const from    = email.from    || 'Unknown Sender';
    const subject = email.subject || '(No Subject)';
    const preview = email.body
      ? email.body.replace(/\n/g, ' ').slice(0, 80) + (email.body.length > 80 ? '…' : '')
      : '';

    const letter   = getAvatarLetter(from);
    const bgColor  = getAvatarColor(from);
    const tagClass = email.isSpam ? 'spam' : (folder === 'trash' ? 'trash' : 'safe');
    const tagLabel = email.isSpam ? 'Spam'  : (folder === 'trash' ? 'Deleted' : 'Safe');

    return `
      <div class="email-card">
        <div class="email-avatar" style="background:${bgColor}">${letter}</div>
        <div class="email-body">
          <div class="email-from">${escHtml(from)}</div>
          <div class="email-subject">${escHtml(subject)}</div>
          <div class="email-preview">${escHtml(preview)}</div>
        </div>
        <div class="email-right">
          <span class="email-time">${email.datetime || ''}</span>
          <span class="email-tag ${tagClass}">${tagLabel} · ${email.pct}%</span>
        </div>
        <button class="delete-btn" title="Delete" onclick="deleteEmail('${folder}', ${email.id})">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>`;
  }).join('');
}

function renderLists() {
  renderList('inbox', 'inbox-list', {
    title: 'Inbox is empty',
    sub:   'Emails marked as safe will appear here.'
  });
  renderList('spam', 'spam-list', {
    title: 'No spam detected',
    sub:   'Emails marked as spam will appear here.'
  });
  renderList('trash', 'trash-list', {
    title: 'Trash is empty',
    sub:   'Deleted emails will be stored here.'
  });

  document.getElementById('inbox-count').textContent =
    store.inbox.length + ' email' + (store.inbox.length !== 1 ? 's' : '');
  document.getElementById('spam-count').textContent  =
    store.spam.length  + ' email' + (store.spam.length  !== 1 ? 's' : '');
  document.getElementById('trash-count').textContent =
    store.trash.length + ' email' + (store.trash.length !== 1 ? 's' : '');
}

function updateBadges() {
  document.getElementById('inbox-badge').textContent = store.inbox.length;
  document.getElementById('spam-badge').textContent  = store.spam.length;
  document.getElementById('trash-badge').textContent = store.trash.length;
  renderLists();
}

let toastTimer;

function showToast(icon, msg) {
  clearTimeout(toastTimer);
  document.getElementById('toast-icon').textContent = icon;
  document.getElementById('toast-msg').textContent  = msg;

  const toast = document.getElementById('toast');
  toast.classList.add('show');
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}


function escHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;');
}


updateBadges();
