(async function() {
  try {
    const words = await fetch(chrome.runtime.getURL('words.json'))
      .then(res => {
        if (!res.ok) throw new Error('Failed to load words.json');
        return res.json();
      })
      .catch(err => {
        console.error('Censor Extension Error:', err);
        return { 
          en: ["shit", "fuck", "asshole"], 
          hi: ["गाली", "मूर्ख", "चूतिया"],
          regex: ["\\b(idiots?|morons?)\\b"]
        };
      });

    const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const patterns = [
      ...words.en.map(escapeRegExp),
      ...words.hi.map(escapeRegExp),
      ...words.regex 
    ];
    
    const profanityRegex = new RegExp(patterns.join('|'), 'gi');

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    (document.head || document.documentElement).appendChild(script);

    function censorText(node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        if (profanityRegex.test(node.textContent)) {
          const span = document.createElement('span');
          span.className = 'censored-blur';
          span.dataset.original = node.textContent;
          span.textContent = node.textContent.replace(profanityRegex, '****');
          node.replaceWith(span); 
          return; 
        }
      } 
      else if (node.nodeType === Node.ELEMENT_NODE) {
        
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(node.tagName)) return;
        
        // Censoring Shadow DOM
        if (node.shadowRoot && node.shadowRoot.mode === 'open') {
          Array.from(node.shadowRoot.children).forEach(censorText);
        }
        
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          censorText(children[i]);
        }
      }
    }

    let mutationQueue = [];
    let processing = false;
    
    const processMutations = () => {
      if (processing) return;
      processing = true;
      
      requestAnimationFrame(() => {
        const snapshot = [...mutationQueue];
        mutationQueue = [];
        
        snapshot.forEach(mut => {
          mut.addedNodes.forEach(censorText);
        });
        
        processing = false;
        
        if (mutationQueue.length > 0) {
          processMutations();
        }
      });
    };

    censorText(document.body);
    new MutationObserver(mutations => {
      mutationQueue.push(...mutations);
      processMutations();
    }).observe(document, { 
      childList: true, 
      subtree: true,
      attributes: false,
      characterData: false
    });

    console.log('Smart Censor initialized successfully');
    
  } catch (err) {
    console.error('Smart Censor critical error:', err);
  }
})();