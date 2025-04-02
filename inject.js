function drillShadowRoots(node = document.body) {
  node.querySelectorAll('*').forEach(el => {
    if (el.shadowRoot) {
      const shadowContent = Array.from(el.shadowRoot.children);
      shadowContent.forEach(child => {
        window.postMessage({
          type: 'CENSOR_SHADOW_CONTENT',
          html: child.innerHTML
        }, '*');
      });
      drillShadowRoots(el.shadowRoot);
    }
  });
}

document.addEventListener('DOMContentLoaded', drillShadowRoots);
new MutationObserver(drillShadowRoots)
  .observe(document, { childList: true, subtree: true });