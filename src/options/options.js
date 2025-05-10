// Wait for the entire DOM to be loaded before executing any code
document.addEventListener("DOMContentLoaded", () => {

  // Retrieve previously saved settings from Chrome's synced storage

  chrome.storage.sync.get(["enabled", "blurStyle", "customWords"], (data) => {
    // Set the checkbox state based on the retrieved data
    document.getElementById("enableCensor").checked = data.enabled ?? true;

    // Set the blur style and custom words input fields based on the retrieved data
    document.getElementById("blurStyle").value = data.blurStyle ?? "blur";
    document.getElementById("customWords").value = data.customWords ?? "";
  });

  // Add event listener to "Save" button to store settings

  document.getElementById("save").addEventListener("click", () => {

  // Get current checkbox state (true if enabled, false otherwise)
    const enabled = document.getElementById("enableCensor").checked;

  // Get the selected blur style and custom words
    const blurStyle = document.getElementById("blurStyle").value;
    const customWords = document.getElementById("customWords").value.trim();

  // Save the current settings to Chrome's synced storage
    chrome.storage.sync.set({ enabled, blurStyle, customWords }, () => {
      alert("Settings saved!");
    });
  });
});
