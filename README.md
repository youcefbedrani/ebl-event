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
  data.js             SOLUTIONS + SITES + OPEN_IN (extracted from the original page)
  i18n.js             FR/EN copy (extracted from the original page)
  assets/             logo SVG defs and the QR code (extracted, not re-typed)
  components/         Home, TopBar, panels, Viewer, ContactModal, Logo, Particles
original/index.html   the original single-file page (unchanged reference)
ext/                  kiosk auto-login browser extension (separate from the site)
```

## Behaviour notes

- `OPEN_IN` in `src/data.js`:
  - `'tab'` (default) — each site/admin opens in a new browser tab; the admin URL gets `#ebl-autologin` so the `ext/` extension signs in.
  - `'frame'` — sites open in the built-in fullscreen viewer (`src/components/Viewer.jsx`).
- Theme (`ebl-theme`) and language (`ebl-lang`) are stored in `localStorage`; the head script in `index.html` applies the theme before first paint to avoid a flash.
- After 90 seconds without touch/key/wheel input the app returns to the home screen and resets the contact form (kiosk idle mode).
