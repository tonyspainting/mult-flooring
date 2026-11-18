# Mult Flooring

Marketing site and catalog for Mult Flooring: hardwood, vinyl and laminate
flooring installation, plus kitchen cabinets, across Massachusetts, Rhode
Island and Connecticut.

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS. Served as a static site
by nginx, with all public routes prerendered at build time.

**Forms:** no database and no CRM. Submissions are delivered by e-mail through
[Resend](https://resend.com) by the `form-api/` service (Node, no dependencies).

## Structure

```
src/                 React app (pages, components, static catalog)
public/              images, video, icons, sitemap, manifest, llms.txt
form-api/            form service that sends e-mail via Resend
scripts/prerender.mjs  prerenders every public route after the build
Dockerfile           two-stage build, nginx runtime
nginx.conf           SPA fallback, caching, /api/* proxy, www redirect
docker-compose.yml   web + form-api
COOLIFY.md           deployment walkthrough
```

## Development

```bash
cp .env.example .env          # VITE_FORM_ENDPOINT (leave empty)
npm install
npm run dev                   # http://localhost:8080
```

The form needs the API. To test submissions locally:

```bash
cd form-api
cp .env.example .env          # fill in RESEND_API_KEY
node server.mjs               # http://localhost:3000
```

Then set `VITE_FORM_ENDPOINT=http://localhost:3000/lead` in the site `.env`.

## Build

```bash
npm run build     # client build, SSR build, then prerender of all routes
npm run build:spa # client build only, without prerendering
```

The build writes `dist/<route>/index.html` for every public page and
regenerates `dist/sitemap.xml` with the last commit date.

## Deploy

See [`COOLIFY.md`](./COOLIFY.md). In short: Docker Compose with two services
(`web` and `form-api`), and `RESEND_API_KEY` set on the `form-api` service.

## Routes

| Route | Page |
|---|---|
| `/` | Home |
| `/flooring` | LVP catalog (24 colorways) |
| `/floors` | Floor samples |
| `/cabinets` | Cabinets and vanities |
| `/projects` | Projects |
| `/showroom` | Showroom (East Bridgewater) |
| `/process` | How installation works |
| `/contact` | Contact |
| `/privacy-policy` | Privacy policy |
