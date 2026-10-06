import { useEffect, useRef, useState } from 'react';
import { useLang } from '../lang.jsx';

const BLANK = { src: 'about:blank', nonce: 0 };

export default function Viewer({ viewer, onClose }) {
  const { t } = useLang();
  const [override, setOverride] = useState(null);
  const [prevViewer, setPrevViewer] = useState(viewer);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(null);
  const [frame, setFrame] = useState(BLANK);
  const nonce = useRef(0);

  if (viewer !== prevViewer) {
    setPrevViewer(viewer);
    setOverride(null);
  }

  const urls = viewer ? viewer.urls : {};
  const mode = viewer ? override || viewer.mode : 'client';
  const src = viewer ? urls[mode] : null;
  const embed = viewer ? urls.embed !== false : false;
  const isAdmin = mode === 'admin';
  const hasCred = !!urls.cred;
  const hasBoth = !!(urls.client && urls.admin);

  useEffect(() => {
    if (!src) {
      setFrame(BLANK);
      setLoading(false);
      return;
    }
    nonce.current += 1;
    setLoading(true);
    setFrame({ src, nonce: nonce.current });
  }, [src]);

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
  const external = src
    ? isAdmin && src.indexOf('#') < 0
      ? src + '#ebl-autologin'
      : src
    : '';

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
          style={{ display: embed && isAdmin && hasCred ? '' : 'none' }}
          onClick={() => copy(urls.cred.user, 'user')}
        >
          {copied === 'user' ? t('v_copied') : t('v_user')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ display: embed && isAdmin && hasCred ? '' : 'none' }}
          onClick={() => copy(urls.cred.pass, 'pass')}
        >
          {copied === 'pass' ? t('v_copied') : t('v_pass')}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ display: embed && src ? '' : 'none' }}
          onClick={() => {
            nonce.current += 1;
            setLoading(true);
            setFrame({ src, nonce: nonce.current });
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
        {!viewer ? null : embed ? (
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
            <h3>{t('v_blocked_t')}</h3>
            <p>{t('v_blocked')}</p>
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
