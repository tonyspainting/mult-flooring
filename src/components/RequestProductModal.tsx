import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { submitLead } from "@/lib/submitLead";
import BrandButton from "@/components/ui/mult-button";

const BROWN = "#7a4f1e";
const ACCENT = "#C47C3A";
const WHATSAPP = "15085104007";

const PRODUCT_TYPES = ["Hardwood", "Vinyl (LVP)", "Laminate", "Tile", "Cabinets", "Other"];

/** Formats digits as (XXX) XXX-XXXX. */
function formatPhone(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 10);
  if (d.length === 0) return "";
  if (d.length < 4) return `(${d}`;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 48,
  borderRadius: 10,
  border: "1px solid #e8e8e6",
  padding: "0 14px",
  fontSize: 16,
  outline: "none",
  background: "#fff",
  color: "#1a1a1a",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#1a1a1a",
  marginBottom: 6,
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#c0392b",
  marginTop: 4,
};

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
}

export interface RequestProductModalProps {
  open: boolean;
  onClose: () => void;
  initialQuery?: string;
  source?: string;
}

export default function RequestProductModal({ open, onClose, initialQuery = "", source = "" }: RequestProductModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [productType, setProductType] = useState("");
  const [link, setLink] = useState("");
  const [website, setWebsite] = useState(""); // honeypot
  const [errors, setErrors] = useState<FormErrors>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Reset the form every time the modal opens, prefilling the description.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    setName("");
    setPhone("");
    setEmail("");
    setDescription(initialQuery);
    setProductType("");
    setLink("");
    setWebsite("");
    setErrors({});
    setSending(false);
    setSent(false);
    setSubmitError(false);
  }, [open, initialQuery]);

  // Body scroll lock + initial focus while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => {
      panelRef.current?.querySelector<HTMLInputElement>("input:not([tabindex='-1'])")?.focus();
    }, 50);
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [open]);

  const handleClose = () => {
    onClose();
    restoreFocusRef.current?.focus?.();
  };

  const onPanelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
      return;
    }
    if (e.key === "Tab" && panelRef.current) {
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'input:not([tabindex="-1"]), textarea, button, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (name.trim().length === 0) next.name = "Please enter your name.";
    if (phone.replace(/\D/g, "").length !== 10) next.phone = "Please enter a 10-digit phone number.";
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Please enter a valid email address.";
    if (description.trim().length < 5) next.description = "Please describe what you are looking for.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    if (!validate()) return;

    // Honeypot: pretend success without sending anything.
    if (website) {
      setSent(true);
      return;
    }

    setSending(true);
    setSubmitError(false);

    const message = `Product type: ${productType || "Not specified"}\nLooking for: ${description.trim()}\nLink: ${link.trim() || "-"}\nSource: ${source}`;

    try {
      await submitLead({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        service: "Product Request",
        message,
        source: "product-request",
      });
      setSent(true);
    } catch (err) {
      console.error("Error sending product request:", err);
      setSubmitError(true);
    } finally {
      setSending(false);
    }
  };

  const firstName = name.trim().split(" ")[0] || "there";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15,10,5,0.60)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Request a product"
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={onPanelKeyDown}
            className="request-product-panel"
            style={{
              width: 520,
              maxWidth: "92vw",
              background: "#ffffff",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 24px 80px rgba(0,0,0,0.25)",
              margin: "8vh auto",
              position: "relative",
            }}
          >
            <style>{`
              @media (max-width: 767px) {
                .request-product-panel {
                  width: 100% !important;
                  max-width: 100% !important;
                  margin: 0 !important;
                  min-height: 100vh;
                  border-radius: 0 !important;
                }
              }
            `}</style>

            <button
              type="button"
              aria-label="Close"
              onClick={handleClose}
              style={{ position: "absolute", top: 16, right: 16, background: "#f0f0ee", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#9e9e9e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}
            >
              ✕
            </button>

            {sent ? (
              <div style={{ textAlign: "center", padding: "24px 0 8px" }}>
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#f0e6d8", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Request received!</h2>
                <p style={{ fontSize: 14, color: "#6b6b6b", lineHeight: 1.6, margin: "12px 0 24px" }}>
                  Thanks, {firstName}. We'll contact you shortly with options.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hi! I just sent a request for: ${description.trim()}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", height: 52, background: `linear-gradient(135deg, ${BROWN}, ${ACCENT})`, color: "#fff", borderRadius: 10, fontSize: 15, fontWeight: 600, textDecoration: "none", boxSizing: "border-box" }}
                >
                  Chat on WhatsApp
                </a>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{ marginTop: 10, width: "100%", height: 44, border: "1px solid #e8e8e6", borderRadius: 10, fontSize: 14, color: "#555", background: "#fff", cursor: "pointer" }}
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, color: "#1a1a1a", margin: 0, paddingRight: 32 }}>
                  Can't find your floor?
                </h2>
                <p style={{ fontSize: 14, color: "#6b6b6b", lineHeight: 1.6, margin: "10px 0 24px" }}>
                  Tell us what you're looking for. We have access to hundreds of options beyond what is on the website and we'll get back to you quickly.
                </p>

                <form onSubmit={handleSubmit} noValidate>
                  {/* Honeypot: invisible to humans, bots fill it */}
                  <input
                    type="text"
                    name="website"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    style={{ position: "absolute", left: "-9999px", top: 0, height: 1, width: 1, opacity: 0 }}
                  />

                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="rp-name" style={labelStyle}>Name *</label>
                    <input id="rp-name" type="text" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} autoComplete="name" />
                    {errors.name && <div style={errorStyle}>{errors.name}</div>}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="rp-phone" style={labelStyle}>Phone *</label>
                    <input
                      id="rp-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(formatPhone(e.target.value))}
                      placeholder="(508) 555-0123"
                      style={inputStyle}
                      autoComplete="tel"
                    />
                    {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="rp-email" style={labelStyle}>Email</label>
                    <input id="rp-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} autoComplete="email" />
                    {errors.email && <div style={errorStyle}>{errors.email}</div>}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="rp-description" style={labelStyle}>What are you looking for? *</label>
                    <textarea
                      id="rp-description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      placeholder="Brand, collection, color, or describe the look (e.g. light grey wide plank, waterproof)"
                      style={{ ...inputStyle, height: "auto", padding: "12px 14px", resize: "vertical" }}
                    />
                    {errors.description && <div style={errorStyle}>{errors.description}</div>}
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <span style={labelStyle}>Product type</span>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {PRODUCT_TYPES.map((t) => {
                        const active = productType === t;
                        return (
                          <button
                            key={t}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setProductType(active ? "" : t)}
                            style={{
                              border: `1px solid ${active ? BROWN : "#e8e8e6"}`,
                              borderRadius: 999,
                              padding: "8px 16px",
                              fontSize: 13,
                              fontWeight: active ? 600 : 500,
                              background: active ? BROWN : "#fff",
                              color: active ? "#fff" : "#666",
                              cursor: "pointer",
                              transition: "all 150ms",
                            }}
                          >
                            {t}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ marginBottom: 24 }}>
                    <label htmlFor="rp-link" style={labelStyle}>Photo or link</label>
                    <input
                      id="rp-link"
                      type="text"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="Paste a link to the product (optional)"
                      style={inputStyle}
                    />
                  </div>

                  {submitError && (
                    <div style={{ ...errorStyle, marginBottom: 12, textAlign: "center" }}>
                      Something went wrong. Please call us at (508) 510-4007
                    </div>
                  )}

                  <BrandButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={sending}
                    className="w-full"
                    style={{ height: 52 }}
                  >
                    {sending ? "Sending..." : "Send Request"}
                  </BrandButton>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
