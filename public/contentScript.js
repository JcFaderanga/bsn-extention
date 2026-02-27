(function () {
  // don't run on extension pages (side panel itself, etc.)
  if (!/^https?:/.test(window.location.protocol)) return;

  console.log('[contentScript] loaded');

  let trackingEnabled = false;
  let overlay = null;
  let highlighted = null;
  let mouseMoveHandler = null;
  let clickHandler = null;

  function init() {
    if (!trackingEnabled) return;

    if (!document.body) {
      console.log('[contentScript] body not yet available, waiting');
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    if (overlay) {
      // already initialized
      return;
    }

    // Create highlight box
    overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.pointerEvents = "none";
    overlay.style.border = "2px solid red";
    overlay.style.backgroundColor = "rgba(255, 0, 0, 0.1)";
    overlay.style.zIndex = "2147483647";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "0";
    overlay.style.height = "0";
    document.documentElement.appendChild(overlay);
    console.log('[contentScript] overlay added');

    // handlers need to be stored so they can be removed later
    mouseMoveHandler = function (e) {
      const el = e.target;
      if (highlighted !== el) {
        highlighted = el;
        const rect = el.getBoundingClientRect();
        overlay.style.top = rect.top + "px";
        overlay.style.left = rect.left + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
      }
    };

    document.addEventListener("mousemove", mouseMoveHandler);
    console.log('[contentScript] mousemove listener attached');

    clickHandler = function (e) {
      const el = e.target;
      console.log('[contentScript] clicked', el);

      const elementInfo = {
        tag: el.tagName,
        id: el.id || "(none)",
        className: el.className || "(none)",
        name: el.getAttribute("name") || "(none)"
      };

      const result = dropdown(el);
      const message =
        result.status === "passed"
          ? "No duplicate values found in dropdown"
          : `Duplicate values found: ${result.duplicates.join(", ")}`;

      try {
        if (
          typeof chrome !== 'undefined' &&
          chrome.runtime &&
          typeof chrome.runtime.sendMessage === 'function'
        ) {
          chrome.runtime.sendMessage({
            type: "elementClick",
            payload: {
              ...elementInfo,
              message,
              status: result.status
            }
          });
        } else {
          console.warn('[contentScript] chrome.runtime.sendMessage not available');
        }
      } catch (err) {
        console.error('[contentScript] error sending message', err);
      }
    };

    document.addEventListener("click", clickHandler, true);
    console.log('[contentScript] click listener attached');
  }

  function teardown() {
    if (mouseMoveHandler) {
      document.removeEventListener("mousemove", mouseMoveHandler);
      mouseMoveHandler = null;
    }
    if (clickHandler) {
      document.removeEventListener("click", clickHandler, true);
      clickHandler = null;
    }
    if (overlay && overlay.parentNode) {
      overlay.parentNode.removeChild(overlay);
      overlay = null;
    }
    highlighted = null;
    console.log('[contentScript] tracking disabled and cleaned up');
  }

  // login helper copied from src/components/login.js so it can run in page context
  const login = async (email, password) => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const setNativeValue = (el, value) => {
      const setter = Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(el),
        "value"
      )?.set;
      setter.call(el, value);
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    };
    const findEmail = () => {
      return (
        document.querySelector('input[name="email"]') ||
        document.querySelector('input[type="email"]') ||
        document.querySelector('#email') ||
        document.querySelector('#user') ||
        document.querySelector('input')
      );
    };

    console.log("Generated email:", email);
    let emailInput = findEmail();
    if (!emailInput) {
      console.log("Waiting for email field to appear...");
      await new Promise((resolve) => {
        const obs = new MutationObserver(() => {
          emailInput = findEmail();
          if (emailInput) {
            obs.disconnect();
            resolve(null);
          }
        });
        obs.observe(document.body, { childList: true, subtree: true });
        setTimeout(() => {
          obs.disconnect();
          resolve(null);
        }, 10000);
      });
    }
    if (!emailInput) {
      console.error("Email input not found");
      return;
    }
    setNativeValue(emailInput, email);
    const findButton = (label) => {
      return [...document.querySelectorAll("button")].find(
        (b) => b.textContent.trim().toUpperCase() === label
      );
    };
    const nextBtn = findButton("NEXT");
    if (!nextBtn) {
      console.error("NEXT button not found");
      return;
    }
    nextBtn.click();
    console.log("NEXT clicked");
    const observer = new MutationObserver(async () => {
      const passwordInput = document.querySelector('input[name="password"]');
      if (!passwordInput) return;
      observer.disconnect();
      console.log("Password field detected");
      await sleep(500);
      console.log("Generated password:", password);
      setNativeValue(passwordInput, password);
      const signInBtn = findButton("SIGN IN");
      if (!signInBtn) {
        console.error("SIGN IN button not found");
        return;
      }
      signInBtn.click();
      console.log("SIGN IN clicked");
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  };

  // listen for messages from sidepanel
  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg && msg.type === 'setTracking') {
      trackingEnabled = !!msg.enabled;
      if (trackingEnabled) {
        init();
      } else {
        teardown();
      }
      sendResponse({ status: 'ok' });
    }

    if (msg && msg.type === 'doLogin') {
      login(msg.email, msg.password)
        .then(() => sendResponse({ status: 'done' }))
        .catch((err) => sendResponse({ status: 'error', message: err.message }));
      // indicate we'll respond asynchronously
      return true;
    }
  });

  // check storage on load
  chrome.storage.local.get(['trackingEnabled'], (result) => {
    if (result && result.trackingEnabled) {
      trackingEnabled = true;
      init();
    }
  });

  function dropdown(element) {
    if (element.tagName !== "SELECT") {
      return { status: "passed", duplicates: [] };
    }

    const options = Array.from(element.options);
    const seen = new Map();
    const duplicates = [];
    
    options.forEach((option) => {
      const text = option.text.trim();
      const textContent = option.textContent.trim();
      const key = text || textContent; // use text or textContent as fallback
      
      if (seen.has(key)) {
        duplicates.push(key);
      } else {
        seen.set(key, true);
      }
    });

    if (duplicates.length > 0) {
      console.warn("⚠ Duplicate found:", duplicates);
    } else {
      console.log("✅ No duplicate values found in dropdown");
    }

    return {
      status: duplicates.length > 0 ? "failed" : "passed",
      duplicates
    };
  }
})();
