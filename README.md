# E-BUSINESS LAB — Screen (React)

The kiosk / touch landing page from `original/index.html`, rebuilt as a React + Vite app so it can be hosted on Render as a static site.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## Deploy on Render

1. Push this folder to a GitHub repository (the `ext/` folder is optional — it is the kiosk auto-login browser extension, not part of the site).
2. On Render: **New → Static Site → Connect the repository**.
3. Render picks up `render.yaml` automatically:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Deploy. Every push to the main branch rebuilds and republishes.

No server, environment variables or database are needed — the contact form posts directly to the Google Apps Script endpoint defined in `src/components/ContactModal.jsx`.

## Project layout

```
index.html            Vite entry (theme flash script + Google Fonts)
src/
  main.jsx            React bootstrap, loads the stylesheet
  App.jsx             view / theme / viewer / modal state + 90s kiosk idle reset
  lang.jsx            FR/EN language context (persisted in localStorage)
  styles.css          the original stylesheet (verbatim)
  data.js             SOLUTIONS + SITES + OPEN_IN (extracted from the original page) + demo credentials / embed flags
  i18n.js             FR/EN copy (extracted from the original page)
  assets/             logo SVG defs and the QR code (extracted, not re-typed)
  components/         Home, TopBar, panels, Viewer, ContactModal, Logo, Particles
original/index.html   the original single-file page (unchanged reference)
ext/                  kiosk auto-login browser extension (separate from the site)
```

## Behaviour notes

- `OPEN_IN` in `src/data.js` is `'frame'`: sites and admin panels open in the built-in fullscreen viewer
  (`src/components/Viewer.jsx`) instead of a new tab.
  - The viewer switches between *Client site* / *Admin panel*, reloads, and can open the current URL in a new tab.
  - Sites flagged `embed: false` (Purevia, Oxiom) send `X-Frame-Options: SAMEORIGIN`, so they cannot be shown
    inside the page. The viewer detects that and shows a panel with the demo credentials instead of a blank frame.
  - **Demo credentials** (`cred` on each `SITES` / demo entry, all use the password `ebl20252026`) are displayed in
    the viewer with one-tap copy. They are readable by anyone who opens the site bundle or the repository — treat
    them as public demo logins, not secrets.
  - **Auto-sign-in inside the page is not possible from a static site**: every one of these apps stores its session
    token in its own `localStorage` (JWT) or sets its own cookie, has no CORS for our origin, and accepts only JSON
    bodies — so the browser blocks any cross-origin sign-in attempt. Copy/paste the credentials, or use
    `Ouvrir dans un onglet` (the URL gets `#ebl-autologin`, which fills the form when the `ext/` extension is
    installed on the kiosk).
- Theme (`ebl-theme`) and language (`ebl-lang`) are stored in `localStorage`; the head script in `index.html` applies the theme before first paint to avoid a flash.
- After 90 seconds without touch/key/wheel input the app returns to the home screen and resets the contact form (kiosk idle mode).
