(async function () {
  try {
    // Get user settings from chrome.storage
    const { enabled = true, blurStyle = "blur", customWords = "" } = await chrome.storage.sync.get(["enabled", "blurStyle", "customWords"]);
    if (!enabled) {
      console.log("Smart Censor is disabled by user settings.");
      return;
    }

    // Load default word patterns from JSON file
    const raw = await fetch(chrome.runtime.getURL("words.json"));
    const words = await raw.json();

    // Extract regex patterns from categories
    const extractPatterns = (categories) => {
      const regexList = [];

      for (const [category, data] of Object.entries(categories)) {
        if (category === "context_safe") continue;

        if (category === "intentional_bypass" && data.patterns) {
          regexList.push(...data.patterns);
          continue;
        }

        for (const lang in data) {
          regexList.push(...data[lang]);
        }
      }

      return regexList;
    };

    let patterns = extractPatterns(words.categories);

    // Add user-defined custom words
    if (customWords.trim()) {
      const userWords = customWords
        .split(",")
        .map(w => w.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))  // escape regex special chars
        .filter(Boolean);
      patterns.push(...userWords);
    }
    
    // Build regexes
    const configFlags = words.config?.flags || "gi";
    const profanityRegex = new RegExp(patterns.join("|"), configFlags);

    const safePatterns = words.categories.context_safe?.exclude || [];
    const excludeFlags = words.config?.exclude_flags || "i";
    const safeRegex = new RegExp(safePatterns.join("|"), excludeFlags);

    // Inject visual censoring styles
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("inject.js");
    (document.head || document.documentElement).appendChild(script);

    // The Main Core Censoring Logic
    function censorText(node) {
      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
        const text = node.textContent;

        if (safeRegex.test(text)) return;

        if (profanityRegex.test(text)) {
          const span = document.createElement("span");
          span.dataset.original = text;

          if (blurStyle === "replace") {
            span.textContent = text.replace(profanityRegex, "***");
          } else if (blurStyle === "remove") {
            span.textContent = text.replace(profanityRegex, "");
          } else {
            span.className = "censored-blur";
            span.textContent = text.replace(profanityRegex, "");
          }

          node.replaceWith(span);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (["SCRIPT", "STYLE", "NOSCRIPT"].includes(node.tagName)) return;

        // For handling shadow roots
        if (node.shadowRoot && node.shadowRoot.mode === "open") {
          Array.from(node.shadowRoot.children).forEach(censorText);
        }

        // Recurse through child nodes
        const children = node.childNodes;
        for (let i = 0; i < children.length; i++) {
          censorText(children[i]);
        }
      }
    }

    // Mutation handling to watch for dynamic content
    let mutationQueue = [];
    let processing = false;

    const processMutations = () => {
      if (processing) return;
      processing = true;

      requestAnimationFrame(() => {
        const snapshot = [...mutationQueue];
        mutationQueue = [];

        snapshot.forEach((mut) => {
          mut.addedNodes.forEach(censorText);
        });

        processing = false;
        if (mutationQueue.length > 0) processMutations();
      });
    };


    // Run on initial page load
    censorText(document.body);

    // Observe DOM changes
    new MutationObserver((mutations) => {
      mutationQueue.push(...mutations);
      processMutations();
    }).observe(document, {
      childList: true,
      subtree: true,
      attributes: false,
      characterData: false,
    });

    console.log("Smart Censor initialized with settings:", { enabled, blurStyle });
  } catch (err) {
    console.error(" Smart Censor critical error:", err);
  }
})();


// This script can show error related to Null node as in Manifest.json this script runs at document_start so you can change it to document_idle or document_end but it will censor the text after the page load. Thank you :)