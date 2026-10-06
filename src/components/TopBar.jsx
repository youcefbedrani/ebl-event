import { useLang } from '../lang.jsx';
import Logo from './Logo.jsx';

const TABS = ['solutions', 'sites', 'services'];

export default function TopBar({ view, onGo, onHome, onOpenContact }) {
  const { t } = useLang();

  return (
    <header className="top">
      <button type="button" className="brand-mini" aria-label="Accueil" onClick={onHome}>
        <div className="logo">
          <Logo />
        </div>
        <p className="wordmark">
          E-BUSINESS<span>LAB</span>
        </p>
      </button>

      <nav className="nav" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={view === tab}
            onClick={() => onGo(tab)}
          >
            {t('nav_' + tab)}
          </button>
        ))}
      </nav>

      <div className="tools">
        <button type="button" className="btn btn-ghost home-btn" onClick={onHome}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10" />
          </svg>
          <span>{t('home_btn')}</span>
        </button>
        <button type="button" className="btn btn-fill" onClick={onOpenContact}>
          {t('contact_btn')}
        </button>
      </div>
    </header>
  );
}
