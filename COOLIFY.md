# Deploying on Coolify — Mult Flooring

Migration guide for `multflooring.com` onto a VPS running Coolify.

---

## 1. Architecture

Two containers, nothing else:

| Container | Role | Port |
|---|---|---|
| `web` | nginx serving the static site (Vite build) and proxying `/api/*` to `form-api` | 80 |
| `form-api` | Node 22 service that receives the form and sends e-mail via **Resend** | 3000 (internal) |

There is no database and no CRM. The form stores nothing: it builds an e-mail
and sends it. The record of a contact is the e-mail delivered to `LEAD_TO`.

---

## 2. What this project does not include

The previous build shipped a database client, a CRM and several unused
services. None of that exists here:

| Removed | Was |
|---|---|
| `supabase/` | database migrations and edge functions |
| `drizzle/`, `drizzle.config.ts` | ORM scaffold, unused |
| `backend/` | SQL documentation only |
| `src/integrations/supabase/`, `src/lib/supabase.ts` | database client |
| CRM pages and admin routes | dashboard, login, product admin |
| `src/lib/products.ts`, `quoteTracking.ts`, `pushNotifications.ts` | table access and push |
| `public/sw.js` | push service worker |
| deps `@supabase/*`, `drizzle-*`, `postgres`, `lovable-tagger` | — |

Effect on the bundle: JavaScript went from 1,377 KB to 688 KB.

`/products` (a database listing) no longer exists and now responds with
**301 → /flooring**, where the static catalog lives.

---

## 3. Configure Resend (once)

1. Create an account at [resend.com](https://resend.com).
2. **Domains → Add Domain** → `multflooring.com`.
3. Add the DNS records it shows (SPF, DKIM). No MX is required for sending.
4. Wait for the status to become **Verified**.
5. **API Keys → Create** with *Sending access*. Copy the key (`re_...`).

Without a verified domain every send fails with `403`.

---

## 4. Deploy on Coolify

1. **New Resource → Application**
2. **Source:** `tonyspainting/mult-flooring`, branch `main`
3. **Build Pack:** `Docker Compose`
   - Compose file: `/docker-compose.yml`
4. **Environment Variables** on the `form-api` service:

| Variable | Required | Value |
|---|---|---|
| `RESEND_API_KEY` | **yes** | `re_...` |
| `LEAD_TO` | yes | `multflooring@gmail.com` (several allowed, comma-separated) |
| `LEAD_FROM` | yes | `Mult Flooring <leads@multflooring.com>` (verified domain) |
| `ALLOWED_ORIGINS` | no | `https://multflooring.com,https://www.multflooring.com` |
| `DEBUG_ERRORS` | no | `true` only while setting up |

5. **Domain:** `multflooring.com` and `www.multflooring.com` → service `web`, port `80`
   - Enable **HTTPS / Let's Encrypt**
6. **Deploy**

> **About `VITE_FORM_ENDPOINT`:** leave it **empty**. The default is `/api/lead`,
> which nginx forwards to `form-api` inside the Docker network — no CORS and no
> extra subdomain. Set it only when the API lives elsewhere, e.g.
> `https://api.multflooring.com/lead`.

---

## 5. Post-deploy checklist

```bash
BASE=https://multflooring.com

# 1. Site responds
curl -sI $BASE | head -1                       # 200

# 2. nginx healthcheck
curl -s $BASE/healthz                          # ok

# 3. Form API reachable and configured
curl -s $BASE/api/health                       # {"ok":true,"configured":true}

# 4. SPA routes (all prerendered)
for p in /flooring /floors /cabinets /projects /showroom /process /contact /privacy-policy; do
  printf "%-18s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' $BASE$p)"
done

# 5. Legacy route redirects
curl -sI $BASE/products | grep -E 'HTTP|Location'   # 301 -> /flooring

# 6. Old CRM routes no longer exist
curl -s -o /dev/null -w '%{http_code}\n' $BASE/dashboard       # 404
curl -s -o /dev/null -w '%{http_code}\n' $BASE/products-admin  # 404

# 7. Unknown route returns a real 404 (not a soft 404)
curl -s -o /dev/null -w '%{http_code}\n' $BASE/does-not-exist  # 404

# 8. Local video asset
curl -sI $BASE/videos/showroom-tour.mp4 | grep -E 'HTTP|Content-Length'

# 9. Form end to end (sends a real e-mail)
curl -s -X POST $BASE/api/lead \
  -H 'Content-Type: application/json' \
  -d '{"Name":"Deploy Test","Phone":"5085550000","Email":"you@example.com","Service":"Hardwood","Message":"Post-deploy test"}'
# expected: {"ok":true}
```

If step 3 returns `502`, nginx is up but cannot reach `form-api` (check that
both services are on the same network). A `503` means the container started
without `RESEND_API_KEY`.

---

## 6. Cloudflare in front of the VPS

- `A` records pointing to the VPS IP, proxy enabled (orange cloud).
- **SSL/TLS mode: `Full (strict)`** — never `Flexible`, which loops against the
  Coolify certificate.

---

## 7. Run it without Docker

```bash
# terminal 1 — API
cd form-api
RESEND_API_KEY=re_... LEAD_TO=you@example.com PORT=3000 node server.mjs

# terminal 2 — site
npm install
VITE_FORM_ENDPOINT=http://localhost:3000/lead npm run dev
```

Or with Docker:

```bash
cp form-api/.env.example form-api/.env   # fill in RESEND_API_KEY
docker compose up --build
# http://localhost:8080
```

---

## 8. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Bind for 0.0.0.0:8080 failed: port is already allocated` | the compose file published a host port. It now uses `expose: 80`; only `docker-compose.override.yml` publishes a port, and Coolify ignores that file |
| `/api/lead` → `502` | `form-api` is not running or sits on another network |
| `/api/lead` → `503` | `RESEND_API_KEY` missing in the container |
| `/api/lead` → `502` with `DEBUG_ERRORS=true` | read the Resend message: unverified domain, invalid `from`, or a key without sending permission |
| `/api/lead` → `429` | rate limit: 5 sends per IP every 10 minutes |
| `/api/lead` → `400` | name or phone missing |
| Blank site | the `build` stage produced no `dist`; check the Coolify build log |
| 404 on `/flooring` | `nginx.conf` was not copied to `/etc/nginx/conf.d/` |

---

## 9. SEO notes

Every public route is prerendered at build time: the HTML served to crawlers
already contains the page content, title, description, canonical, Open Graph
tags and JSON-LD schema. `/llms.txt`, `/robots.txt` and `/sitemap.xml` are
generated or served from the same build.

The site still renders on the client after load (`createRoot`, not hydration),
which is why the HTML is what matters for indexing. See the comment in
`src/main.tsx` for the reasoning.
