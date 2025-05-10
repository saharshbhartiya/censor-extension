document.addEventListener("DOMContentLoaded", () => {

  // grabbing elements from popup
  const toggle = document.getElementById("popup-enable");
  const blurStyle = document.getElementById("popup-style");
  const customWords = document.getElementById("popup-words");

  // load saved settings from chrome storage
  chrome.storage.sync.get(["enabled", "blurStyle", "customWords"], (data) => {
    toggle.checked = data.enabled ?? true;
    blurStyle.textContent = data.blurStyle ?? "blur";
    customWords.textContent = data.customWords || "(none)";
  });

  // save toggle state when changed
  toggle.addEventListener("change", () => {
    chrome.storage.sync.set({ enabled: toggle.checked });
  });

  // open full settings page
  document.getElementById("open-options").addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options.html"));
    }
  });
});
