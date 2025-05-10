// Lightweight Shadow DOM processor
const processShadowRoot = (root) => {
  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent.trim()) {
      window.postMessage({
        type: 'CENSOR_CHECK',
        text: node.textContent,
        nodePath: getNodePath(node)
      }, '*');
    }
  }
};

// Get minimal node path for targeted processing
const getNodePath = (node) => {
  const path = [];
  let current = node;
  while (current && current !== document) {
    path.unshift(current.tagName);
    current = current.parentNode;
  }
  return path.join('>');
};

// YouTube-specific optimized handler
const handleYouTubeComments = () => {
  const observer = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.tagName === 'YT-DIVIDER') return; // Skip non-comment elements
          if (node.querySelector?.('ytd-comment-thread-renderer')) {
            processShadowRoot(node);
          }
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
  });
};

// Main initialization
if (window.location.hostname.includes('youtube.com')) {
  // Delay YouTube processing for better performance
  setTimeout(handleYouTubeComments, 1500);
} else {
  // Generic lightweight shadow DOM handling
  const genericObserver = new MutationObserver((mutations) => {
    for (const mut of mutations) {
      for (const node of mut.addedNodes) {
        if (node.shadowRoot && node.nodeType === Node.ELEMENT_NODE) {
          processShadowRoot(node.shadowRoot);
        }
      }
    }
  });
  
  genericObserver.observe(document, {
    childList: true,
    subtree: true
  });
}