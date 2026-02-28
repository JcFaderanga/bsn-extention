export const login = async (email, password) => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const setNativeValue = (el, value) => {
    const setter = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(el),
      'value'
    )?.set;

    setter?.call(el, value);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
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

  console.log('Generated email:', email);
  let emailInput = findEmail();

  if (!emailInput) {
    console.log('Waiting for email field to appear...');
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
    throw new Error('Email input not found');
  }

  setNativeValue(emailInput, email);

  const findButton = (label) => {
    return [...document.querySelectorAll('button')].find(
      (b) => b.textContent.trim().toUpperCase() === label
    );
  };

  const nextBtn = findButton('NEXT');
  if (!nextBtn) {
    throw new Error('NEXT button not found');
  }

  nextBtn.click();
  console.log('NEXT clicked');

  await new Promise((resolve, reject) => {
    const observer = new MutationObserver(async () => {
      const passwordInput = document.querySelector('input[name="password"]');
      if (!passwordInput) return;

      observer.disconnect();
      console.log('Password field detected');
      await sleep(500);
      console.log('Generated password:', password);

      setNativeValue(passwordInput, password);

      const signInBtn = findButton('SIGN IN');
      if (!signInBtn) {
        reject(new Error('SIGN IN button not found'));
        return;
      }

      signInBtn.click();
      console.log('SIGN IN clicked');
      resolve(null);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error('Password input did not appear in time'));
    }, 10000);
  });
};