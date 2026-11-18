# Mult Flooring

Site institucional e catálogo da Mult Flooring — instalação de pisos de madeira,
vinílico e laminado em Massachusetts, Rhode Island e Connecticut.

**Stack:** Vite + React 18 + TypeScript + Tailwind CSS. Servido como site
estático por nginx.

**Formulário:** sem banco de dados e sem CRM. Os formulários enviam e-mail via
[Resend](https://resend.com) através do serviço `form-api/` (Node, sem
dependências).

## Estrutura

```
src/            aplicação React (páginas, componentes, catálogo estático)
public/         imagens, vídeos, ícones, sitemap, manifest
form-api/       serviço que envia o formulário por e-mail (Resend)
Dockerfile      build em 2 estágios → nginx
nginx.conf      fallback do SPA, cache, /api/* → form-api
docker-compose.yml   web + form-api
COOLIFY.md      passo a passo de deploy
```

## Desenvolvimento

```bash
cp .env.example .env          # VITE_FORM_ENDPOINT (deixe vazio)
npm install
npm run dev                   # http://localhost:8080
```

O formulário precisa da API. Para testar o envio localmente:

```bash
cd form-api
cp .env.example .env          # preencha RESEND_API_KEY
node server.mjs               # http://localhost:3000
```

E no `.env` do site: `VITE_FORM_ENDPOINT=http://localhost:3000/lead`.

## Deploy

Ver [`COOLIFY.md`](./COOLIFY.md). Resumo: Docker Compose com dois serviços
(`web` e `form-api`), e `RESEND_API_KEY` cadastrada no serviço `form-api`.

## Rotas

| Rota | Página |
|---|---|
| `/` | Home |
| `/flooring` | Catálogo LVP (24 colorways) |
| `/floors` | Amostras de piso |
| `/cabinets` | Armários e vanities |
| `/projects` | Projetos |
| `/showroom` | Showroom (East Bridgewater) |
| `/process` | Como funciona |
| `/contact` | Contato |
| `/privacy-policy` | Política de privacidade |
