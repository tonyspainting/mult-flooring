// Serviço mínimo que recebe os formulários do site e envia por e-mail via Resend.
// Sem banco de dados, sem CRM: o registro do contato é o e-mail que chega em LEAD_TO.
import http from "node:http";

const PORT = Number(process.env.PORT || 3000);

const RESEND_API_KEY = process.env.RESEND_API_KEY || "";
const LEAD_TO = (process.env.LEAD_TO || "multflooring@gmail.com")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);
const LEAD_FROM = process.env.LEAD_FROM || "Mult Flooring <leads@multflooring.com>";
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  "https://multflooring.com,https://www.multflooring.com,http://localhost:8080,http://localhost:4173"
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 5;
const hits = new Map();

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );

function corsOrigin(request) {
  const origin = request.headers.origin;
  if (origin && ALLOWED_ORIGINS.includes(origin)) return origin;
  return ALLOWED_ORIGINS[0] || "https://multflooring.com";
}

function send(res, status, body, origin) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  const MAX_BODY = 20_000;
  return new Promise((resolve, reject) => {
    let size = 0;
    let tooLarge = false;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        tooLarge = true;
        chunks.length = 0;
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => {
      if (tooLarge) {
        const err = new Error("Payload too large");
        err.status = 413;
        reject(err);
        return;
      }
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function isRateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((time) => now - time < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5_000) hits.clear();
  return recent.length > RATE_MAX;
}

// O site envia os campos em PascalCase (Name, Phone, ...); aceitamos minúsculas também.
function validate(data) {
  const name = String(data.Name ?? data.name ?? "").trim();
  const phone = String(data.Phone ?? data.phone ?? "").trim();
  const email = String(data.Email ?? data.email ?? "").trim();
  const address = String(data.Address ?? data.address ?? "").trim();
  const service = String(data.Service ?? data.service ?? "").trim();
  const message = String(data.Message ?? data.message ?? "").trim();
  const source = String(data.Source ?? data.source ?? "").trim();
  const campaign = String(data.Campaign ?? data.campaign ?? "").trim();
  const preferPhone = String(data.PreferPhone ?? data.preferPhone ?? "").trim();

  if (!name || !phone) return { error: "Name and phone are required." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Invalid email address." };
  if (name.length > 120 || phone.length > 40 || email.length > 160) return { error: "Field too long." };
  if (address.length > 300) return { error: "Field too long." };
  if (message.length > 4000 || service.length > 120) return { error: "Field too long." };

  return { lead: { name, phone, email, address, service, message, source, campaign, preferPhone } };
}

function buildEmail(lead) {
  const rows = [
    ["Name", lead.name],
    ["Phone", lead.phone],
    ["Email", lead.email],
    ["Address", lead.address],
    ["Project type", lead.service],
    ["Prefer phone contact", lead.preferPhone],
    ["Heard about us", lead.source],
    ["Campaign", lead.campaign],
  ].filter(([, value]) => value);

  const table = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#666;white-space:nowrap;vertical-align:top">${esc(label)}</td><td style="padding:6px 0;color:#111"><b>${esc(value)}</b></td></tr>`,
    )
    .join("");

  const message = lead.message
    ? `<p style="margin:16px 0 4px;color:#666">Message</p><p style="margin:0;white-space:pre-wrap;color:#111">${esc(lead.message)}</p>`
    : "";

  const phoneDigits = lead.phone.replace(/[^\d+]/g, "");

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;padding:24px">
  <h2 style="margin:0 0 4px;color:#111">New flooring request</h2>
  <p style="margin:0 0 16px;color:#666">${esc(lead.name)} is interested in ${
    esc(lead.service || "flooring or cabinets")
  }.</p>
  <table style="border-collapse:collapse;font-size:15px">${table}</table>
  ${message}
  <p style="margin:24px 0 0">
    <a href="tel:${esc(phoneDigits)}" style="display:inline-block;margin-right:8px;padding:10px 16px;background:#7a4f1e;color:#fff;text-decoration:none;border-radius:6px">Call ${esc(lead.name)}</a>
    ${lead.email ? `<a href="mailto:${esc(lead.email)}" style="display:inline-block;padding:10px 16px;background:#1A1A1A;color:#fff;text-decoration:none;border-radius:6px">Reply by email</a>` : ""}
  </p>
  <p style="margin:24px 0 0;color:#999;font-size:12px">Sent from multflooring.com</p>
</div>`;

  const text =
    rows.map(([label, value]) => `${label}: ${value}`).join("\n") +
    (lead.message ? `\n\nMessage:\n${lead.message}` : "") +
    "\n\nSent from multflooring.com";

  return { html, text };
}

async function sendWithResend(lead) {
  const { html, text } = buildEmail(lead);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: LEAD_FROM,
      to: LEAD_TO,
      ...(lead.email ? { reply_to: lead.email } : {}),
      subject: `New flooring request: ${lead.name}${lead.service ? ` - ${lead.service}` : ""}`,
      html,
      text,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || `Resend returned ${response.status}`);
  }
  return data;
}

const server = http.createServer(async (req, res) => {
  const origin = corsOrigin(req);
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Max-Age": "86400",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && (url.pathname === "/health" || url.pathname === "/api/health")) {
    send(res, 200, { ok: true, configured: Boolean(RESEND_API_KEY) }, origin);
    return;
  }

  if (req.method !== "POST" || (url.pathname !== "/lead" && url.pathname !== "/api/lead")) {
    send(res, 404, { error: "Not found" }, origin);
    return;
  }

  if (!RESEND_API_KEY) {
    send(res, 503, { error: "Email service is not configured." }, origin);
    return;
  }

  const ip =
    req.headers["x-forwarded-for"]?.toString().split(",")[0].trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(ip)) {
    send(res, 429, { error: "Too many requests. Please try again later." }, origin);
    return;
  }

  let payload;
  try {
    payload = JSON.parse(await readBody(req));
  } catch (err) {
    if (err && err.status === 413) {
      send(res, 413, { error: "Payload too large." }, origin);
      return;
    }
    send(res, 400, { error: "Invalid JSON body." }, origin);
    return;
  }

  // Honeypot: preenchido apenas por robôs.
  if (payload._honey || payload.honeypot) {
    send(res, 200, { ok: true }, origin);
    return;
  }

  const { lead, error } = validate(payload);
  if (error) {
    send(res, 400, { error }, origin);
    return;
  }

  try {
    await sendWithResend(lead);
    console.log("lead sent", JSON.stringify({ service: lead.service, source: lead.source }));
    send(res, 200, { ok: true }, origin);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("send failed:", message);
    // DEBUG_ERRORS=true expõe a mensagem do Resend na resposta (útil na configuração).
    const detail = process.env.DEBUG_ERRORS === "true" ? message : undefined;
    send(res, 502, { error: "Could not send the message.", ...(detail ? { detail } : {}) }, origin);
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `form-api listening on ${PORT} | to: ${LEAD_TO.join(", ")} | configured: ${Boolean(RESEND_API_KEY)}`,
  );
});
