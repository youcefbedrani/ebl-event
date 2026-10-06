import { useEffect, useRef, useState } from 'react';
import { LangProvider } from './lang.jsx';
import { OPEN_IN } from './data.js';
import { SVG_DEFS } from './assets/svgDefs.js';
import Particles from './components/Particles.jsx';
import Home from './components/Home.jsx';
import TopBar from './components/TopBar.jsx';
import SolutionsPanel from './components/SolutionsPanel.jsx';
import SitesPanel from './components/SitesPanel.jsx';
import ServicesPanel from './components/ServicesPanel.jsx';
import Viewer from './components/Viewer.jsx';
import ContactModal from './components/ContactModal.jsx';

const IDLE_MS = 90000;

function readTheme() {
  try {
    return localStorage.getItem('ebl-theme') || 'dark';
  } catch (e) {
    return 'dark';
  }
}

function Shell() {
  const [view, setView] = useState('home');
  const [theme, setTheme] = useState(readTheme);
  const [viewer, setViewer] = useState(null);
  const [contactOpen, setContactOpen] = useState(false);
  const [resetToken, setResetToken] = useState(0);
  const mainRef = useRef(null);

  useEffect(() => {
    document.documentElement.className = theme;
    try {
      localStorage.setItem('ebl-theme', theme);
    } catch (e) {
      /* ignore */
    }
  }, [theme]);

  useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [view]);

  useEffect(() => {
    let idleT = null;
    const events = ['pointerdown', 'touchstart', 'keydown', 'wheel'];
    const goIdle = () => {
      setViewer(null);
      setContactOpen(false);
      setResetToken((x) => x + 1);
      setView('home');
    };
    const activity = () => {
      clearTimeout(idleT);
      idleT = setTimeout(goIdle, IDLE_MS);
    };
    events.forEach((ev) => document.addEventListener(ev, activity, { passive: true }));
    activity();
    return () => {
      clearTimeout(idleT);
      events.forEach((ev) => document.removeEventListener(ev, activity));
    };
  }, []);

  const openViewer = (title, urls, mode) => {
    if (OPEN_IN === 'tab') {
      /* '#ebl-autologin' tells the kiosk browser extension to sign in on this admin page */
      window.open(mode === 'admin' ? urls.admin + '#ebl-autologin' : urls.client, '_blank');
      return;
    }
    setViewer({ title, urls, mode });
  };

  return (
    <>
      <Particles />
      <div className="svg-defs" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SVG_DEFS }} />

      <div className="app" id="app" data-view={view}>
        <Home
          onToggleTheme={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}
          onGo={setView}
          onOpenContact={() => setContactOpen(true)}
        />
        <TopBar
          view={view}
          onGo={setView}
          onHome={() => setView('home')}
          onOpenContact={() => setContactOpen(true)}
        />
        <main className="main" id="main" ref={mainRef}>
          <SolutionsPanel active={view === 'solutions'} onOpenViewer={openViewer} />
          <SitesPanel active={view === 'sites'} onOpenViewer={openViewer} />
          <ServicesPanel active={view === 'services'} />
        </main>
      </div>

      <Viewer viewer={viewer} onClose={() => setViewer(null)} />
      <ContactModal
        open={contactOpen}
        onClose={() => setContactOpen(false)}
        resetToken={resetToken}
      />
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <Shell />
    </LangProvider>
  );
}
