import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lang.jsx';

const BLANK = { src: 'about:blank', nonce: 0 };

/* A sleeping Render service answers 5xx for up to ~50 s while it wakes up. */
const HEALTH_ATTEMPTS = 10;
const HEALTH_RETRY = 5000;
const HEALTH_TIMEOUT = 10000;

export default function Viewer({ viewer, onClose }) {
  const { t } = useLang();
  const [override, setOverride] = useState(null);
  const [prevViewer, setPrevViewer] = useState(viewer);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [frame, setFrame] = useState(BLANK);
  const [health, setHealth] = useState('unknown');
  const nonce = useRef(0);

  if (viewer !== prevViewer) {
    setPrevViewer(viewer);
    setOverride(null);
    setHealth('checking');
  }

  const urls = viewer ? viewer.urls : {};
  const mode = viewer ? override || viewer.mode : 'client';
  const src = viewer ? urls[mode] : null;
  const embed = viewer ? urls.embed !== false : false;
  const isAdmin = mode === 'admin';
  const hasCred = !!urls.cred;
  const hasBoth = !!(urls.client && urls.admin);

  /* The proxy serves /__ebl/health with CORS, so a missing service can be
     spotted before the iframe shows a 404 — then the site opens in a tab. */
  const proxied = !!urls.proxied;
  const offline = proxied && health === 'fail';
  const blocked = !embed || offline;

  /* #ebl-autologin makes the proxied admin pages fill + submit the login form */
  const withFlag = (u) =>
    mode === 'admin' && urls.cred && u && u.indexOf('#') < 0 ? u + '#ebl-autologin' : u;

  useEffect(() => {
    if (!viewer || !proxied) {
      setHealth(proxied ? 'checking' : 'unknown');
      return undefined;
    }
    let cancelled = false;
    let timer = null;
    let attempt = 0;
    let ctl = null;
    setHealth('checking');

    const check = () => {
      attempt += 1;
      ctl = new AbortController();
      const tick = setTimeout(() => ctl.abort(), HEALTH_TIMEOUT);
      fetch(urls.proxy + '/__ebl/health', { signal: ctl.signal, cache: 'no-store' })
        .then((r) => {
          if (cancelled) return;
          if (r.ok) setHealth('ok');
          else if (r.status >= 500 && attempt < HEALTH_ATTEMPTS) timer = setTimeout(check, HEALTH_RETRY);
          else setHealth('fail');
        })
        .catch(() => {
          if (cancelled) return;
          if (attempt < HEALTH_ATTEMPTS) timer = setTimeout(check, HEALTH_RETRY);
          else setHealth('fail');
        })
        .finally(() => clearTimeout(tick));
    };
    check();

    return () => {
      cancelled = true;
      if (ctl) ctl.abort();
      if (timer) clearTimeout(timer);
    };
  }, [viewer, proxied, urls.proxy]);

  useEffect(() => {
    if (!src) {
      setFrame(BLANK);
      setLoading(false);
      return;
    }
    nonce.current += 1;
    setLoading(true);
    setFrame({ src: withFlag(src), nonce: nonce.current });
  }, [src, mode]);

  useEffect(() => {
    if (!viewer) return;
    const done = () => setLoading(false);
    const f = document.querySelector('.viewer iframe');
    if (f) {
      f.addEventListener('load', done, { once: true });
      return () => f.removeEventListener('load', done);
    }
  }, [viewer, frame.nonce]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(null), 1200);
    return () => clearTimeout(id);
  }, [copied]);

  function copy(text, which) {
    const done = () => setCopied(which);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, done);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        /* ignore */
      }
      document.body.removeChild(ta);
      done();
    }
  }

  const title = viewer
    ? viewer.title + (hasBoth ? ' · ' + t(isAdmin ? 'btn_admin' : 'btn_client') : '')
    : '';
  /* When the proxy is down, the new tab goes to the real site instead. */
  const real = urls.real && (urls.real[mode] || urls.real.client);
  const external = (offline && real ? real : withFlag(src)) || '';

  const creds = isAdmin && hasCred ? (
    <div className="vcreds">
      <span>{t('v_creds')}</span>
      <code>{urls.cred.user}</code>
      <code>{urls.cred.pass}</code>
      <button type="button" className="btn btn-ghost" onClick={() => copy(urls.cred.user, 'user')}>
        {copied === 'user' ? t('v_copied') : t('v_user')}
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => copy(urls.cred.pass, 'pass')}>
        {copied === 'pass' ? t('v_copied') : t('v_pass')}
      </button>
    </div>
  ) : null;

  return (
    <div className={'viewer' + (viewer ? ' on' : '')} aria-hidden={!viewer}>
      <div className="vbar">
        <button type="button" className="btn btn-fill" onClick={onClose}>
          {t('v_close')}
        </button>
        <p className="vtitle">{title}</p>
        <div className="vseg" style={{ display: hasBoth ? 'flex' : 'none' }}>
          <button type="button" aria-pressed={mode === 'client'} onClick={() => setOverride('client')}>
            {t('btn_client')}
          </button>
          <button type="button" aria-pressed={mode === 'admin'} onClick={() => setOverride('admin')}>
            {t('btn_admin')}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ display: !blocked && isAdmin && hasCred ? '' : 'none' }}
          onClick={() => copy(urls.cred.user, 'user')}
        >
          {copied === 'user' ? t('v_copied') : t('v_user')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ display: !blocked && isAdmin && hasCred ? '' : 'none' }}
          onClick={() => copy(urls.cred.pass, 'pass')}
        >
          {copied === 'pass' ? t('v_copied') : t('v_pass')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ display: !blocked && src ? '' : 'none' }}
          onClick={() => {
            nonce.current += 1;
            setLoading(true);
            setFrame({ src: withFlag(src), nonce: nonce.current });
          }}
        >
          {t('v_reload')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => window.open(external, '_blank', 'noopener')}
        >
          {t('v_external')}
        </button>
        <p className="vhint">{t('v_hint')}</p>
      </div>
      <div className="vbody">
        {!viewer ? null : !blocked ? (
          <>
            <div className={'vload' + (loading ? '' : ' done')}>
              <div className="spin" />
            </div>
            <iframe
              key={frame.nonce}
              src={frame.src}
              name="vFrame"
              title="Aperçu"
              allow="fullscreen"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </>
        ) : (
          <div className="vblocked">
            <h3>{t(offline ? 'v_offline_t' : 'v_blocked_t')}</h3>
            <p>{t(offline ? 'v_offline' : 'v_blocked')}</p>
            {creds}
            <div className="acts">
              <button
                type="button"
                className="btn btn-fill"
                onClick={() => window.open(external, '_blank', 'noopener')}
              >
                {t('v_external')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
