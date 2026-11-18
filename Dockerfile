# ─────────────────────────────────────────────────────────────
# Mult Flooring — site estático para Coolify
#
# A aplicação é um SPA (Vite + React). Não há banco de dados nem
# CRM. O único serviço dinâmico é o formulário, que fica no
# container `form-api` (pasta form-api/) e envia e-mail via Resend.
# Este container serve os arquivos estáticos e encaminha /api/*
# para o form-api (ver nginx.conf).
#
# IMPORTANTE: VITE_FORM_ENDPOINT é embutida no bundle durante o
# BUILD, então precisa chegar como build arg.
# ─────────────────────────────────────────────────────────────

# ---------- estágio 1: build ----------
FROM node:22-alpine AS build

WORKDIR /app

# Variáveis de build (Vite injeta no bundle)
ARG VITE_FORM_ENDPOINT=""

ENV VITE_FORM_ENDPOINT=$VITE_FORM_ENDPOINT

# Camada de dependências (aproveita cache enquanto o lock não muda)
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Código-fonte e build
COPY . .
RUN npm run build

# Sanidade: falha o build se o bundle não foi gerado
RUN test -f dist/index.html || (echo "ERRO: dist/index.html não gerado" && exit 1)

# ---------- estágio 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

# Configuração própria (remove o site padrão do nginx)
RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/app.conf

# Arquivos estáticos gerados
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
