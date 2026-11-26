# ─────────────────────────────────────────────────────────────
# Mult Flooring: static site for Coolify
#
# The app is a SPA (Vite + React). There is no database and
# no CRM. The only dynamic service is the form, which lives in
# container `form-api` (pasta form-api/) e envia e-mail via Resend.
# This container serves the static files and proxies /api/*
# to form-api (see nginx.conf).
#
# IMPORTANT: VITE_FORM_ENDPOINT is baked into the bundle at
# BUILD time, so it must arrive as a build arg.
# ─────────────────────────────────────────────────────────────

# ---------- stage 1: build ----------
FROM node:22-alpine AS build

WORKDIR /app

# Variáveis de build (Vite injeta no bundle)
ARG VITE_FORM_ENDPOINT=""

ENV VITE_FORM_ENDPOINT=$VITE_FORM_ENDPOINT

# Dependency layer (reuses cache while the lock file is unchanged)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Source and build
COPY . .
RUN npm run build

# Sanity check: fail the build if the bundle was not produced
RUN test -f dist/index.html || (echo "ERROR: dist/index.html not generated" && exit 1)

# ---------- stage 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

# Configuração própria (remove o site padrão do nginx)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Generated static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
