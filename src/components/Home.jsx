import { useLang } from '../lang.jsx';
import { QR_CODE } from '../assets/qrCode.js';
import Logo from './Logo.jsx';

export default function Home({ onToggleTheme, onGo, onOpenContact }) {
  const { t, lang, setLang } = useLang();

  return (
    <section className="home" id="home">
      <div className="home-brand">
        <div className="logo">
          <Logo />
        </div>
        <p className="wordmark">
          E-BUSINESS<span>LAB</span>
        </p>
        <p className="tagline">{t('tagline')}</p>
      </div>

      <div className="home-menu">
        <div className="tiles">
          <button type="button" className="tile primary" onClick={() => onGo('solutions')}>
            <b>{t('nav_solutions')}</b>
            <span>{t('tile_solutions')}</span>
          </button>
          <button type="button" className="tile" onClick={() => onGo('sites')}>
            <b>{t('nav_sites')}</b>
            <span>{t('tile_sites')}</span>
          </button>
          <button type="button" className="tile navy" onClick={() => onGo('services')}>
            <b>{t('nav_services')}</b>
            <span>{t('tile_services')}</span>
          </button>
          <button type="button" className="tile navy" onClick={onOpenContact}>
            <b>{t('contact_btn')}</b>
            <span>{t('tile_contact')}</span>
          </button>
        </div>

        <div className="home-foot">
          <div className="qr">
            <span dangerouslySetInnerHTML={{ __html: QR_CODE }} />
            <p>
              <strong>ebusinesslab.dz</strong>
              {t('qr_caption')}
            </p>
          </div>

          <div className="tools">
            <div className="seg" role="group" aria-label="Langue">
              <button type="button" aria-pressed={lang === 'fr'} onClick={() => setLang('fr')}>
                FR
              </button>
              <button type="button" aria-pressed={lang === 'en'} onClick={() => setLang('en')}>
                EN
              </button>
            </div>
            <button className="icon-btn" type="button" aria-label="Thème" onClick={onToggleTheme}>
              <svg
                className="icon-sun"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="4.5" />
                <path d="M12 2.5v2.5M12 19v2.5M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M2.5 12H5M19 12h2.5M4.6 19.4l1.8-1.8M17.6 6.4l1.8-1.8" />
              </svg>
              <svg className="icon-moon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 14.7A8.5 8.5 0 019.3 3.5a.6.6 0 00-.7-.8A9.5 9.5 0 1021.3 15.4a.6.6 0 00-.8-.7z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
