# PathFinder 🧭

**A local-first outdoor adventure command center** — plan trips, track packing lists and gear, view maps, check live weather, record workouts and trips, and prepare emergency contacts.

**Live hosting:** Deploy as a Cloudflare Worker with static assets and a tiny edge API. No servers, databases, API keys in the browser or mandatory paid accounts.

## Stack
- React 18, TypeScript, Vite, Tailwind CSS, Leaflet
- Cloudflare Workers Static Assets, edge proxy for geocoding and forecasts
- Open-Meteo Forecast + Geocoding APIs (free for qualifying non-commercial use; see their terms)
- OpenTopoMap/Esri tiles rendered by Leaflet; tiles need internet access and remain subject to providers' usage policies
- Browser localStorage for trips, gear, journals, settings; JSON export/import
- Versioned service worker for offline **app shell and locally saved trip data** — **not offline map tiles**.

## Local
```bash
npm install
npm run build
npm run dev
```
For APIs locally run `npx wrangler dev` after `npm run build` (Vite alone serves the UI but not the Worker `/api/*` routes). For full-stack local development, use `npm run build && npx wrangler dev`.

## Deploy: GitHub Actions → Cloudflare Workers (free plan)
1. Create a free Cloudflare account (no paid plan needed). Workers Free is subject to request quotas.
2. Create a scoped API token authorized for **Workers Scripts: Edit** (and any account permissions required for deployment), and find your Cloudflare Account ID.
3. Add GitHub Actions repository secrets **CLOUDFLARE_API_TOKEN** and **CLOUDFLARE_ACCOUNT_ID**.
4. Merge the restoration PR to `main`. The workflow runs TypeScript validation, builds and publishes to `https://pathfinder.<your-workers-subdomain>.workers.dev`. If the secrets are missing, CI still runs and deployment is skipped.
5. Subsequent pushes to `main` automatically build and deploy.

No third-party paid API keys, hosted database, Maps API billing or Cloudflare paid plan is necessary. Your usage must remain within Cloudflare's free limits and third-party map/weather providers' terms. The API worker forwards calls to Open-Meteo and caches successful replies at Cloudflare's edge. Real-time data requires connectivity.

## Safety and privacy
- Risk assessment is a **general planning checklist**, not live intelligence or a verified route assessment. Always confirm conditions, weather alerts, permits and trail status through official sources.
- Maps are online only. The original "Download Offline Map" button only stored a label; this build removes that misleading behavior. Take a paper map or download legal maps with a dedicated navigation tool before a remote trip.
- Data stays on this browser unless you choose to export it. Data does not sync between devices and can disappear if browser storage is cleared.
- Back up from **Settings → Export All Data**. Imports overwrite data in the current browser.

## Workflows
- **Pull request:** install + typecheck + production build
- **Main branch:** install + typecheck + build + deploy (only when Cloudflare secrets exist)

## License / dependencies
This repo retains its original code and project-specific content. Open-source third-party dependencies and third-party service terms apply. Map tiles, service worker shell and app data are distinct: we do not bulk cache third-party tiles.
