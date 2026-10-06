/*
 * EBL reverse proxy — lets a site be shown inside the kiosk page.
 *
 *   TARGET=https://purevia.ebl-offecial.com   the site to proxy (root path)
 *   EBL_USER / EBL_PASS                        demo credentials, injected into the
 *                                              admin login page when the URL carries
 *                                              #ebl-autologin (fills + submits)
 *
 * It forwards every request to the target at its root path (so the target's
 * root-relative assets and client-side routing keep working), strips the
 * frame-blocking headers, rewrites absolute API URLs in JS to the proxy origin,
 * and passes cookies through unchanged.
 */
import http from 'node:http';
import { Readable } from 'node:stream';

const TARGET = (process.env.TARGET || '').replace(/\/+$/, '');
const PORT = Number(process.env.PORT || 10000);
const USER = process.env.EBL_USER || '';
const PASS = process.env.EBL_PASS || '';

if (!/^https?:\/\//.test(TARGET)) {
  console.error('TARGET must be an http(s) origin, got:', TARGET);
  process.exit(1);
}

const ORIGIN = new URL(TARGET).origin;
const HOST = new URL(TARGET).host;

const DROP_REQ = new Set([
  'host', 'connection', 'keep-alive', 'proxy-authenticate', 'proxy-authorization',
  'te', 'trailer', 'transfer-encoding', 'upgrade', 'content-length'
]);
const DROP_RES = new Set([
  'content-length', 'content-encoding', 'transfer-encoding', 'connection', 'keep-alive',
  'x-frame-options', 'content-security-policy', 'content-security-policy-report-only'
]);

/* ---------- injected client script ---------- */
const BOOT_JS = `/* EBL proxy boot: rewrite absolute target URLs + admin auto-fill */
(function () {
  var cfg = window.__EBL || {};
  var origin = cfg.origin || '';
  function fix(u) {
    if (typeof u !== 'string') return u;
    if (origin && u.indexOf(origin) === 0) return u.slice(origin.length) || '/';
    return u;
  }
  var nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') {
    window.fetch = function (input, init) {
      try {
        if (typeof input === 'string') input = fix(input);
        else if (input && typeof input.url === 'string') input = new Request(fix(input.url), input);
      } catch (e) {}
      return nativeFetch.call(this, input, init);
    };
  }
  var nativeOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    arguments[1] = fix(String(url));
    return nativeOpen.apply(this, arguments);
  };

  if (!cfg.user || !cfg.pass) return;
  if (location.hash.indexOf('ebl-autologin') === -1) return;

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
    var m = all.filter(function (b) {
      return /connect|connexion|login|log in|sign|entrer|se connecter|دخول/i.test(b.textContent || b.value || '');
    });
    return m[0] || all[all.length - 1] || null;
  }

  var done = false, started = Date.now(), tries = 0;
  var timer = setInterval(function () {
    if (done || tries++ > 80 || Date.now() - started > 25000) { clearInterval(timer); return; }
    var pw = Array.prototype.slice.call(document.querySelectorAll('input[type=password]')).filter(visible)[0];
    if (!pw) return;
    clearInterval(timer);
    var user = findUserInput(pw);
    if (!user) return;
    done = true;
    setVal(user, cfg.user);
    setVal(pw, cfg.pass);
    setTimeout(function () {
      var b = findButton(pw);
      if (b) b.click();
      else if (pw.form && pw.form.requestSubmit) pw.form.requestSubmit();
    }, 500);
  }, 300);
})();
`;

function inject(html, path) {
  const config =
    '<script>window.__EBL=' +
    JSON.stringify({ origin: ORIGIN, user: USER, pass: PASS, path: path }) +
    ';</script><script src="/__ebl/boot.js"></script>';
  if (html.includes('</head>')) return html.replace('</head>', config + '</head>');
  if (html.includes('<body')) return html.replace(/(<body[^>]*>)/, '$1' + config);
  return config + html;
}

async function proxy(req, res) {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/__ebl/boot.js') {
    res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'public, max-age=3600' });
    res.end(BOOT_JS);
    return;
  }
  if (url.pathname === '/__ebl/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, target: ORIGIN }));
    return;
  }

  const headers = {};
  for (const [k, v] of Object.entries(req.headers)) {
    if (!DROP_REQ.has(k.toLowerCase()) && v !== undefined) headers[k] = v;
  }
  headers.host = HOST;
  headers['accept-encoding'] = 'identity';
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    headers.origin = ORIGIN;
    if (headers.referer) headers.referer = ORIGIN + url.pathname + url.search;
  }

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') body = req;

  let r;
  try {
    r = await fetch(ORIGIN + url.pathname + url.search, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
      duplex: 'half'
    });
  } catch (err) {
    res.writeHead(502, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Bad gateway: ' + err.message);
    return;
  }

  const out = {};
  r.headers.forEach((v, k) => {
    if (!DROP_RES.has(k.toLowerCase())) out[k] = v;
  });
  const setCookies = typeof r.headers.getSetCookie === 'function' ? r.headers.getSetCookie() : [];
  if (setCookies.length) out['set-cookie'] = setCookies;
  if (out.location && out.location.indexOf(ORIGIN) === 0) {
    out.location = out.location.slice(ORIGIN.length) || '/';
  }

  const type = String(out['content-type'] || '');
  if (type.includes('text/html') && r.body) {
    const html = inject(await r.text(), url.pathname);
    const buf = Buffer.from(html, 'utf8');
    out['content-type'] = 'text/html; charset=utf-8';
    out['content-length'] = buf.length;
    res.writeHead(r.status, out);
    res.end(buf);
    return;
  }

  res.writeHead(r.status, out);
  if (!r.body || req.method === 'HEAD') {
    res.end();
    return;
  }
  Readable.fromWeb(r.body).pipe(res);
}

http.createServer((req, res) => {
  proxy(req, res).catch((err) => {
    console.error(err);
    if (!res.headersSent) res.writeHead(500);
    res.end('Internal error');
  });
}).listen(PORT, () => {
  console.log('ebl-proxy -> ' + ORIGIN + ' on :' + PORT);
});
