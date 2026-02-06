chrome.storage.local.set({ liveCount: 0 });

// Function to find the count in your Mobile/Responsive view
function getParticipantCount() {
  // Broad search for the number bubble
  const badges = document.querySelectorAll('div, span');
  for (let el of badges) {
    // Look for elements that look like the top-right bubble (small text, numbers only)
    if (el.innerText.trim().match(/^\d{1,3}$/) && el.innerText.trim().length < 4) {
      // Check if it is positioned in the top right (common for that badge)
      const rect = el.getBoundingClientRect();
      if (rect.top < 100 && rect.right > window.innerWidth - 100) {
        return parseInt(el.innerText.trim());
      }
    }
  }
  
  // Fallback: The standard class names
  const stdBadge = document.querySelector('.uG74Se, .vY69T, .ggSno, .wnS6Ve, .M5H9ec');
  if (stdBadge && !isNaN(stdBadge.innerText.trim())) return parseInt(stdBadge.innerText.trim());

  return null;
}

// Watch for changes
const observer = new MutationObserver(() => {
  try {
    if (!chrome.runtime?.id) return;

    const currentCount = getParticipantCount();

    // --- FIX 2: HANDLE ZERO / NULL ---
    // If we find a number, save it. If null (left meeting), save 0.
    const safeCount = currentCount !== null ? currentCount : 0;
    chrome.storage.local.set({ liveCount: safeCount });

    // Check if we need to leave (Only runs if we actually found a number)
    if (currentCount !== null) {
      chrome.storage.local.get(['meetThreshold', 'botActive'], (data) => {
        if (data.botActive && currentCount < data.meetThreshold) {
          const leaveBtn = document.querySelector('button[aria-label*="Leave"], .y97SHe');
          if (leaveBtn) {
            leaveBtn.click();
            chrome.storage.local.set({ botActive: false });
          }
        }
      });
    }
  } catch (e) {}
});

observer.observe(document.body, { childList: true, subtree: true, characterData: true });