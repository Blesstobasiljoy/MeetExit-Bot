const toggle = document.getElementById('botToggle');
const thresholdInput = document.getElementById('threshold');
const urlDisplay = document.getElementById('meetUrl');
const liveCountDisplay = document.getElementById('liveCount');
const counterBox = document.getElementById('counterBox');
const themeBtn = document.getElementById('themeBtn');

// --- 1. THEME LOGIC ---
function applyTheme(isLight) {
  if (isLight) {
    document.body.classList.add('light-mode');
    themeBtn.innerText = "☀️";
  } else {
    document.body.classList.remove('light-mode');
    themeBtn.innerText = "🌙";
  }
}

themeBtn.addEventListener('click', () => {
  const isLight = document.body.classList.contains('light-mode');
  applyTheme(!isLight);
  chrome.storage.local.set({ theme: !isLight ? 'light' : 'dark' });
});

// --- 2. DATA SYNC ---
function refreshData() {
  chrome.storage.local.get(['liveCount', 'meetThreshold', 'botActive', 'theme'], (data) => {
    // Apply Theme
    if (data.theme === 'light') applyTheme(true);
    else applyTheme(false);

    // Update Count Text
    const count = data.liveCount !== undefined ? data.liveCount : "--";
    liveCountDisplay.innerText = count;

    // Update Inputs
    if (data.meetThreshold) thresholdInput.value = data.meetThreshold;
    toggle.checked = !!data.botActive;

    // Update Visuals (Red/Green Logic)
    const intCount = parseInt(count);
    const intThreshold = parseInt(thresholdInput.value);
    
    // Remove old styles
    counterBox.classList.remove("status-safe", "status-danger");

    // Apply new style based on logic
    if (!isNaN(intCount) && intCount <= intThreshold + 1) {
       counterBox.classList.add("status-danger"); // Red Text & Border
    } else {
       counterBox.classList.add("status-safe"); // Theme-based Text & Green Border
    }
  });
}

// Initial Load
refreshData();

// Listen for updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.liveCount) refreshData();
});

// URL Check
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  if (tabs?.[0]?.url?.includes('meet.google.com')) {
    urlDisplay.innerText = "● LIVE CONNECTION";
    urlDisplay.style.color = "#34a853";
  } else {
    urlDisplay.innerText = "○ WAITING FOR MEET";
    urlDisplay.style.color = "#9aa0a6";
  }
});

// Save Settings
const saveSettings = () => {
  chrome.storage.local.set({ 
    botActive: toggle.checked,
    meetThreshold: parseInt(thresholdInput.value)
  });
  refreshData();
};

toggle.addEventListener('change', saveSettings);
thresholdInput.addEventListener('change', saveSettings);