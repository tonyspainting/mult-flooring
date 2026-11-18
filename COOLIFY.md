# Deploy no Coolify — Mult Flooring

Guia da migração do site (`multflooring.com`) para uma VPS com Coolify.

---

## 1. Arquitetura

Dois containers, nada mais:

| Container | Papel | Porta |
|---|---|---|
| `web` | nginx servindo o site estático (Vite) e encaminhando `/api/*` para o `form-api` | 80 |
| `form-api` | Node 22 que recebe o formulário e envia por e-mail via **Resend** | 3000 (interna) |

**Não existe banco de dados, CRM, Supabase nem qualquer serviço do provedor antigo.** O formulário não grava nada: ele monta um e-mail e envia. O "registro" do contato é o e-mail que chega na caixa configurada em `LEAD_TO`.

---

## 2. O que foi removido do projeto

| Removido | Era |
|---|---|
| `supabase/` (migrations + edge functions) | banco e funções do provedor antigo |
| `drizzle/`, `drizzle.config.ts` | scaffold de ORM, não usado |
| `backend/` | apenas documentação SQL |
| `src/integrations/supabase/`, `src/lib/supabase.ts` | cliente do banco |
| `src/pages/DashboardPage`, `LoginPage`, `ProductsLoginPage/Manager/New/Edit` | CRM e admin de produtos |
| `src/components/auth/`, `src/components/products/` | guardas de rota e formulário de produto |
| `src/lib/products.ts`, `quoteTracking.ts`, `pushNotifications.ts` | tabelas e notificações push |
| `src/components/sections/ReviewsSection.tsx` | avaliações do banco (não era renderizado) |
| `src/components/sections/ProductsTeaser.tsx` | vitrine do banco (renderizava vazio) |
| `public/sw.js` | service worker de push |
| `.lovable/`, `bun.lockb` | artefatos do provedor antigo |
| deps `@supabase/*`, `drizzle-*`, `postgres`, `lovable-tagger`, `@lovable.dev/*` | — |

Efeito colateral positivo: o JS do site caiu de **1.377 KB para 688 KB**.

A rota `/products` (listagem vinda do banco) deixou de existir e agora responde **301 → /flooring**, onde está o catálogo estático.

---

## 3. Configurar o Resend (uma vez)

1. Crie a conta em [resend.com](https://resend.com).
2. **Domains → Add Domain** → `multflooring.com`.
3. Adicione os registros DNS que ele mostrar (SPF, DKIM). O `MX` não é necessário.
4. Espere o status virar **Verified** (normalmente minutos).
5. **API Keys → Create** → permissão *Sending access*. Copie a chave (`re_...`).

Sem o domínio verificado o envio falha com `403` do Resend. Para testar antes disso, use `onboarding@resend.dev` em `LEAD_FROM` — mas ele só entrega no e-mail dono da conta.

---

## 4. Deploy no Coolify

1. **New Resource → Application**
2. **Source:** repositório `tonyspainting/mult-flooring`, branch `main`
3. **Build Pack:** `Docker Compose`
   - Compose file: `/docker-compose.yml`
4. **Environment Variables** (do serviço `form-api`):

| Variável | Obrigatória | Valor |
|---|---|---|
| `RESEND_API_KEY` | **sim** | `re_...` |
| `LEAD_TO` | sim | `multflooring@gmail.com` (aceita vários, separados por vírgula) |
| `LEAD_FROM` | sim | `Mult Flooring <leads@multflooring.com>` (domínio verificado) |
| `ALLOWED_ORIGINS` | não | `https://multflooring.com,https://www.multflooring.com` |
| `DEBUG_ERRORS` | não | `true` só durante a configuração |

5. **Domain:** `multflooring.com` e `www.multflooring.com` → serviço `web`, porta `80`
   - Ative **HTTPS / Let's Encrypt**
6. **Deploy**

> **Sobre `VITE_FORM_ENDPOINT`:** deixe **vazia**. O padrão é `/api/lead`, que o nginx encaminha para o `form-api` dentro da mesma rede Docker — sem CORS e sem subdomínio. Só preencha se a API for para outro domínio (ex.: `https://api.multflooring.com/lead`).

---

## 5. Checklist depois do deploy

```bash
BASE=https://multflooring.com

# 1. Site responde
curl -sI $BASE | head -1                       # 200

# 2. Healthcheck do nginx
curl -s $BASE/healthz                          # ok

# 3. Form-api alcançável pelo proxy e configurado
curl -s $BASE/api/health                       # {"ok":true,"configured":true}

# 4. Rotas do SPA
for p in /floors /flooring /cabinets /projects /showroom /process /contact /privacy-policy; do
  printf "%-18s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' $BASE$p)"
done

# 5. Rota antiga redireciona
curl -sI $BASE/products | grep -E 'HTTP|Location'   # 301 -> /flooring

# 6. Rotas do CRM antigo não existem mais
curl -s -o /dev/null -w '%{http_code}\n' $BASE/dashboard      # 404
curl -s -o /dev/null -w '%{http_code}\n' $BASE/products-admin # 404

# 7. Vídeo local
curl -sI $BASE/videos/showroom-tour.mp4 | grep -E 'HTTP|Content-Length'

# 8. Formulário de verdade (envia um e-mail real!)
curl -s -X POST $BASE/api/lead \
  -H 'Content-Type: application/json' \
  -d '{"Name":"Teste Deploy","Phone":"5085550000","Email":"teste@example.com","Service":"Hardwood","Message":"Teste pós-deploy"}'
# esperado: {"ok":true}  → e-mail deve chegar em LEAD_TO
```

Se o item **3** devolver `502`, o nginx está no ar mas não encontra o `form-api` (confira se os dois serviços subiram na mesma rede).
Se devolver `503`, o container subiu sem `RESEND_API_KEY`.

---

## 6. Cloudflare na frente do VPS

- Registros `A` para o IP da VPS, com proxy ativado (“nuvem laranja”).
- **SSL/TLS mode: `Full (strict)`** — nunca `Flexible`, que gera loop de redirecionamento com o Let's Encrypt do Coolify.

---

## 7. Testar sem Docker, direto na máquina

```bash
# terminal 1 — API
cd form-api
RESEND_API_KEY=re_... LEAD_TO=seu@email.com PORT=3000 node server.mjs

# terminal 2 — site
npm install
VITE_FORM_ENDPOINT=http://localhost:3000/lead npm run dev
```

Ou com Docker:

```bash
cp form-api/.env.example form-api/.env   # preencha RESEND_API_KEY
docker compose up --build
# http://localhost:8080
```

---

## 8. Troubleshooting

| Sintoma | Causa provável |
|---|---|
| `Bind for 0.0.0.0:8080 failed: port is already allocated` | o compose publicava a porta no host. Já corrigido: o `web` agora usa `expose: 80` e a porta só é publicada no `docker-compose.override.yml` (ignorado pelo Coolify) |
| `/api/lead` → `502` | `form-api` não subiu ou está em outra rede |
| `/api/lead` → `503` | falta `RESEND_API_KEY` no container |
| `/api/lead` → `502` com `DEBUG_ERRORS=true` | veja a mensagem do Resend: domínio não verificado, `from` inválido ou chave sem permissão de envio |
| `/api/lead` → `429` | rate limit: 5 envios por IP a cada 10 minutos |
| `/api/lead` → `400` | falta nome ou telefone |
| Site branco | build sem `dist` — veja o log do estágio `build` no Coolify |
| 404 em `/flooring` | `nginx.conf` não foi copiado para `/etc/nginx/conf.d/` |

---

## 9. Pendência opcional (não bloqueia)

O site continua sendo um SPA: o HTML entregue tem `<div id="root"></div>` e nenhum texto, então buscadores sem JavaScript e crawlers de IA veem uma página vazia. O projeto do Tony's resolve isso com pré-renderização (`scripts/prerender.mjs` + `entry-server.tsx`). Vale portar esse passo quando o deploy estiver estável.
