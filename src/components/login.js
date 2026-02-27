export const login = (email, password) => {
  // ===== helpers =====
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  const setNativeValue = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      "value"
    )?.set;
    setter.call(el, value);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  };

  // ===== step 1: email =====
  console.log("Generated email:", email);

  const emailInput = document.querySelector('input[name="email"]');
  if (!emailInput) {
    console.error("Email input not found");
    return;
  }

  setNativeValue(emailInput, email);

  const nextBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().toUpperCase() === "NEXT");

  if (!nextBtn) {
    console.error("NEXT button not found");
    return;
  }

  nextBtn.click();
  console.log("NEXT clicked");

  // ===== step 2: wait for password form =====
  const observer = new MutationObserver(async () => {
    const passwordInput = document.querySelector('input[name="password"]');
    if (!passwordInput) return;

    observer.disconnect();
    console.log("Password field detected");

    await sleep(500);

    console.log("Generated password:", password);

    setNativeValue(passwordInput, password);

    const signInBtn = [...document.querySelectorAll("button")]
      .find(b => b.textContent.trim().toUpperCase() === "SIGN IN");

    if (!signInBtn) {
      console.error("SIGN IN button not found");
      return;
    }

    signInBtn.click();
    console.log("SIGN IN clicked");
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
};

//login ("test_ipcwss4m@example.com", "P@ss_9f8g7h6j");