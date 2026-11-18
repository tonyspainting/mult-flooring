// Sends the forms by e-mail (Resend), with no database and no CRM.
// The endpoint is our own API (form-api): same domain by default,
// at /api/lead, with nginx forwarding to the API container.
// VITE_FORM_ENDPOINT can override it at build time (e.g. https://api.example.com/lead).

const FORM_ENDPOINT: string = import.meta.env.VITE_FORM_ENDPOINT || "/api/lead";

/** Honeypot: a hidden field only bots fill in. */
export const HONEYPOT_FIELD = "_honey";

export interface LeadFields {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  /** Project type / service */
  service?: string;
  message?: string;
  /** Where the lead came from: hero, contact, cta-final, product-request... */
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

  // The API returns { error } on failure, so checking only the status
  // code would give a false positive.
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Form endpoint returned ${response.status}`);
  }
}
