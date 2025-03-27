// Load saved settings
document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(
    ['toggleText', 'toggleImages', 'sensitivity', 'customWords'],
    (data) => {
      document.getElementById('toggleText').checked = data.toggleText !== false; // Default: true
      document.getElementById('toggleImages').checked = data.toggleImages !== false;
      document.getElementById('sensitivity').value = data.sensitivity || 3;
      document.getElementById('customWords').value = data.customWords || '';
      document.getElementById('sensitivity-value').textContent = data.sensitivity || 3;
    }
  );

  // Update sensitivity label
  document.getElementById('sensitivity').addEventListener('input', (e) => {
    document.getElementById('sensitivity-value').textContent = e.target.value;
  });

  // Save settings
  document.getElementById('save').addEventListener('click', () => {
    const settings = {
      toggleText: document.getElementById('toggleText').checked,
      toggleImages: document.getElementById('toggleImages').checked,
      sensitivity: parseInt(document.getElementById('sensitivity').value),
      customWords: document.getElementById('customWords').value
        .split(',')
        .map(word => word.trim())
        .filter(word => word.length > 0)
    };

    chrome.storage.sync.set(settings, () => {
      const status = document.getElementById('status');
      status.textContent = 'Settings saved!';
      setTimeout(() => status.textContent = '', 2000);
    });
  });
});