# E-BUSINESS LAB — Screen (React)

The kiosk / touch landing page from `original/index.html`, rebuilt as a React + Vite app, hosted on Render as a static site with one small reverse proxy per website, so every site and admin panel opens inside the built-in web view and signs in automatically.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # -> dist/
npm run preview  # serve the production build
```

## Deploy on Render

`render.yaml` is a blueprint with **seven** services:

| service | type | what it does |
|---|---|---|
| `ebl-screen` | static | the kiosk app (`npm run build` → `dist`) |
| `ebl-proxy-purevia` | web (Node) | reverse proxy for Purevia |
| `ebl-proxy-smoothy` | web (Node) | reverse proxy for Smoothy |
| `ebl-proxy-swanson` | web (Node) | reverse proxy for Swanson |
| `ebl-proxy-steps` | web (Node) | reverse proxy for Steps |
| `ebl-proxy-oxiom` | web (Node) | reverse proxy for Oxiom |
| `ebl-proxy-managup` | web (Node) | reverse proxy for Managup |

1. Push this folder to a GitHub repository (the `ext/` folder is optional — it is the kiosk auto-login browser extension, not part of the site).
2. On Render: **New → Blueprint → Connect the repository**. Render reads `render.yaml` and creates all seven services.
   (Do **not** use New → Web Service on its own — that runs `go build` and fails.)
3. Deploy. Every push to the main branch rebuilds and republishes.

The service names must stay in sync with `PROXY` at the top of `src/data.js` (Render hostnames follow the service
name: `https://<name>.onrender.com`). If you already have services under other names, either rename them in Render
or change the `PROXY` values and push.

The contact form posts directly to the Google Apps Script endpoint defined in `src/components/ContactModal.jsx` — no database is involved. The proxy services are on Render's free instance type, so they sleep after ~15 min idle and take ~30 s to wake on the first hit.

## Project layout

```
index.html            Vite entry (theme flash script + Google Fonts)
src/
  main.jsx            React bootstrap, loads the stylesheet
  App.jsx             view / theme / viewer / modal state + 90s kiosk idle reset
  lang.jsx            FR/EN language context (persisted in localStorage)
  styles.css          the original stylesheet (verbatim)
  data.js             PROXY + SOLUTIONS + SITES + OPEN_IN (extracted from the original page) + demo credentials
  i18n.js             FR/EN copy (extracted from the original page)
  assets/             logo SVG defs and the QR code (extracted, not re-typed)
  components/         Home, TopBar, panels, Viewer, ContactModal, Logo, Particles
proxy/
  server.mjs          reverse proxy: strips X-Frame-Options, rewrites absolute API URLs,
                      injects the admin auto-fill (#ebl-autologin)
  package.json        no dependencies — plain Node >= 20
original/index.html   the original single-file page (unchanged reference)
ext/                  kiosk auto-login browser extension (separate from the site)
```

## Behaviour notes

- `OPEN_IN` in `src/data.js` is `'frame'`: every site and admin panel opens in the built-in fullscreen web view
  (`src/components/Viewer.jsx`) instead of a new tab.
  - The viewer switches between *Client site* / *Admin panel*, reloads, and can open the current URL in a new tab.
  - **Every site is reached through its own reverse proxy** (`proxy/server.mjs`, `PROXY` in `src/data.js`) because
    several of them send `X-Frame-Options` / `Content-Security-Policy`. The proxy strips the frame-blocking headers,
    keeps cookies passing through, rewrites absolute `https://<site>/api/...` calls back to the proxy origin, and
    injects the demo credentials into the admin login page — so **every admin panel signs in automatically** when
    the viewer opens the admin URL with `#ebl-autologin`.
  - **If a proxy is unreachable** (service renamed, still starting, or asleep too long) the viewer probes
    `GET /__ebl/health` (CORS-enabled, retried for ~30 s while a free instance wakes up) and then shows the
    fallback panel: the credentials plus `Ouvrir dans un onglet`, which opens the real site instead of a blank
    frame. The kiosk never gets stuck on an error page.
  - **Demo credentials** (`cred` on each `SITES` / demo entry, all use the password `ebl20252026`) are displayed in
    the viewer with one-tap copy. They are readable by anyone who opens the site bundle or the repository — treat
    them as public demo logins, not secrets.
- Theme (`ebl-theme`) and language (`ebl-lang`) are stored in `localStorage`; the head script in `index.html` applies the theme before first paint to avoid a flash.
- After 90 seconds without touch/key/wheel input the app returns to the home screen and resets the contact form (kiosk idle mode).
