import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { T } from './i18n.js';

const LangContext = createContext(null);

function readLang() {
  let lang = 'fr';
  try { lang = localStorage.getItem('ebl-lang') || 'fr'; } catch (e) { lang = 'fr'; }
  return T[lang] ? lang : 'fr';
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(readLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { localStorage.setItem('ebl-lang', lang); } catch (e) { /* ignore */ }
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t: (k) => T[lang][k] || k }), [lang]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LangProvider');
  return ctx;
}
