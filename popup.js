const toggle = document.getElementById('botToggle');
const thresholdInput = document.getElementById('threshold');
const urlDisplay = document.getElementById('meetUrl');
const liveCountDisplay = document.getElementById('liveCount');
const counterBox = document.getElementById('counterBox');
const themeBtn = document.getElementById('themeBtn');

let isMeetingTab = false;

// --- THEME LOGIC ---
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

// --- DISPLAY UPDATER ---
function updateDisplay(count) {
  const intCount = parseInt(count);
  const intThreshold = parseInt(thresholdInput.value);

  liveCountDisplay.innerText = intCount;

  // Reset visuals first
  counterBox.classList.remove("status-safe", "status-danger");

  // Only apply colors/pulse if count is greater than 0
  if (intCount > 0) {
    if (intCount <= intThreshold + 1) {
       counterBox.classList.add("status-danger"); // Red Pulse
    } else {
       counterBox.classList.add("status-safe"); // Green Pulse
    }
  }
}

// --- MAIN LOGIC ---
function refreshData() {
  chrome.storage.local.get(['liveCount', 'meetThreshold', 'botActive', 'theme'], (data) => {
    // 1. Theme
    if (data.theme === 'light') applyTheme(true);
    else applyTheme(false);

    // 2. Settings
    if (data.meetThreshold) thresholdInput.value = data.meetThreshold;
    toggle.checked = !!data.botActive;

    // 3. Count Logic (The Fix)
    // If we are NOT in a meeting, FORCE 0. Otherwise, use storage.
    const realCount = isMeetingTab ? (data.liveCount || 0) : 0;
    
    updateDisplay(realCount);
  });
}

// Listen for updates
chrome.storage.onChanged.addListener((changes) => {
  if (changes.liveCount) refreshData();
});

// --- URL CHECK (Run this first) ---
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  const url = tabs[0]?.url || "";
  
  // Check if it's a real meeting URL (contains 3-4-3 char code)
  if (url.includes('meet.google.com') && url.match(/[a-z]{3}-[a-z]{4}-[a-z]{3}/)) {
    isMeetingTab = true;
    urlDisplay.innerText = "● LIVE CONNECTION";
    urlDisplay.style.color = "#34a853";
  } else {
    isMeetingTab = false;
    urlDisplay.innerText = "○ DISCONNECTED";
    urlDisplay.style.color = "#9aa0a6";
  }
  
  // Now load data
  refreshData();
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