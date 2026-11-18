// Envio dos formulários por e-mail (Resend), sem banco de dados e sem CRM.
// O endpoint é a nossa própria API (form-api) — por padrão no mesmo domínio,
// em /api/lead, com o nginx encaminhando para o container da API.
// VITE_FORM_ENDPOINT pode sobrescrever no build (ex.: https://api.dominio.com/lead).

const FORM_ENDPOINT: string = import.meta.env.VITE_FORM_ENDPOINT || "/api/lead";

/** Honeypot: campo invisível que só robô preenche. */
export const HONEYPOT_FIELD = "_honey";

export interface LeadFields {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  /** Tipo de projeto / serviço */
  service?: string;
  message?: string;
  /** De onde veio o contato: hero, contact, cta-final, product-request... */
  source?: string;
  campaign?: string;
  preferPhone?: boolean;
}

export async function submitLead(fields: LeadFields): Promise<void> {
  const payload: Record<string, string> = {
    Name: fields.name,
    Phone: fields.phone,
  };

  if (fields.email) payload.Email = fields.email;
  if (fields.address) payload.Address = fields.address;
  if (fields.service) payload.Service = fields.service;
  if (fields.message) payload.Message = fields.message;
  if (fields.source) payload.Source = fields.source;
  if (fields.campaign) payload.Campaign = fields.campaign;
  if (fields.preferPhone) payload.PreferPhone = "yes";

  const response = await fetch(FORM_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
  });

  // A API responde { error } quando algo falha, então checar só o status
  // HTTP daria falso positivo.
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Form endpoint returned ${response.status}`);
  }
}
