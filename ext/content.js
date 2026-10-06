/* EBL Kiosk Auto Login
 * Runs only when the page was opened from the kiosk board (URL ends with #ebl-autologin).
 * Fills the username + password fields and presses the sign-in button.
 * Keep this folder on the kiosk only: the passwords are stored in plain text below.
 */
(function () {
  var CREDS = {
    'steps.ebl-offecial.com':   { user: 'admin', pass: 'ebl20252026' },
    'oxiom.ebl-offecial.com':   { user: 'admin', pass: 'ebl20252026' },
    'purevia.ebl-offecial.com': { user: 'admin@purevia.ebl-offecial.com', pass: 'ebl20252026' },
    'smoothy.ebl-offecial.com': { user: 'admin', pass: 'ebl20252026' },
    'swanson.ebl-offecial.com': { user: 'admin', pass: 'ebl20252026' },
    'managup.ebl-offecial.com': { user: 'admin@mini-erp.local', pass: 'ebl20252026' }
  };
  var FLAG = 'ebl-autologin-until', TRIES = 'ebl-autologin-tries';
  var cred = CREDS[location.hostname];
  if (!cred) return;

  /* arm: the board adds #ebl-autologin; remember it for this tab for 2 minutes (the site may redirect and drop the hash) */
  try {
    if (location.hash.indexOf('ebl-autologin') !== -1) {
      sessionStorage.setItem(FLAG, String(Date.now() + 120000));
      sessionStorage.setItem(TRIES, '0');
    }
    if (Number(sessionStorage.getItem(FLAG) || 0) < Date.now()) return;
  } catch (e) { return; }

  function visible(el) {
    var r = el.getBoundingClientRect(), s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
  }
  function setVal(el, v) {
    var d = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), 'value');
    el.focus();
    if (d && d.set) d.set.call(el, v); else el.value = v;
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function findUserInput(pw) {
    var scope = pw.form || document;
    var list = Array.prototype.slice.call(scope.querySelectorAll('input')).filter(function (i) {
      var t = (i.type || 'text').toLowerCase();
      return ['text', 'email', 'tel', ''].indexOf(t) !== -1 && visible(i) && !i.disabled && !i.readOnly;
    });
    var before = list.filter(function (i) { return i.compareDocumentPosition(pw) & Node.DOCUMENT_POSITION_FOLLOWING; });
    return before.length ? before[before.length - 1] : (list[0] || null);
  }
  function findButton(pw) {
    var scope = pw.form || pw.closest('div,section,main') || document;
    var btn = scope.querySelector('button[type=submit],input[type=submit]');
    if (btn) return btn;
    var all = Array.prototype.slice.call((pw.form || document).querySelectorAll('button,input[type=button]'));
    var m = all.filter(function (b) { return /connect|connexion|login|log in|sign|entrer|se connecter|دخول/i.test(b.textContent || b.value || ''); });
    return m[0] || all[all.length - 1] || null;
  }

  var done = false, started = Date.now();
  var timer = setInterval(function () {
    if (done || Date.now() - started > 25000) { clearInterval(timer); return; }
    var pw = Array.prototype.slice.call(document.querySelectorAll('input[type=password]')).filter(visible)[0];
    if (!pw) return;
    var tries = Number(sessionStorage.getItem(TRIES) || 0);
    if (tries >= 2) { clearInterval(timer); return; }   /* wrong password? stop instead of looping */
    var user = findUserInput(pw);
    if (!user) return;
    done = true; clearInterval(timer);
    sessionStorage.setItem(TRIES, String(tries + 1));
    setVal(user, cred.user);
    setVal(pw, cred.pass);
    setTimeout(function () {
      var b = findButton(pw);
      if (b) b.click(); else if (pw.form && pw.form.requestSubmit) pw.form.requestSubmit();
    }, 500);
  }, 300);
})();
