import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SectionLabel from "@/components/ui/mult-section-label";
import BrandButton from "@/components/ui/mult-button";

interface BestSeller {
  id: string;
  name: string;
  collection: string;
  thickness: string;
  price: string;
  tone: "Light" | "Medium" | "Dark";
  tag: string;
  swatchImage: string;
  roomImage: string;
}

const BEST_SELLERS: BestSeller[] = [
  { id: "ps-lite-natural-oak", name: "Natural Oak", collection: "Permshield Lite", thickness: "5.2 MM", price: "$2.20 / sq. ft.", tone: "Medium", tag: "Best Seller", swatchImage: "/flooring/permshield-lite-natural-oak-swatch.jpg", roomImage: "/flooring/permshield-lite-natural-oak-room.jpg" },
  { id: "cyrus-akadia", name: "Akadia", collection: "MSI Cyrus", thickness: "6.0 MM", price: "$2.25 / sq. ft.", tone: "Light", tag: "Trending", swatchImage: "/flooring/cyrus-akadia-swatch.jpg", roomImage: "/flooring/cyrus-akadia-room.jpg" },
  { id: "ps-plus-santorini", name: "Santorini", collection: "Permshield One Plus", thickness: "6.5 MM", price: "$3.39 / sq. ft.", tone: "Light", tag: "Premium", swatchImage: "/flooring/permshield-plus-santorini-swatch.jpg", roomImage: "/flooring/permshield-plus-santorini-room.jpg" },
  { id: "cyrus-barnstorm", name: "Barnstorm", collection: "MSI Cyrus", thickness: "6.0 MM", price: "$2.25 / sq. ft.", tone: "Medium", tag: "Popular", swatchImage: "/flooring/cyrus-barnstorm-swatch.jpg", roomImage: "/flooring/cyrus-barnstorm-room.jpg" },
  { id: "ps-plus-slate", name: "Slate", collection: "Permshield One Plus", thickness: "6.5 MM", price: "$3.39 / sq. ft.", tone: "Dark", tag: "Bold Choice", swatchImage: "/flooring/permshield-plus-slate-swatch.jpg", roomImage: "/flooring/permshield-plus-slate-room.jpg" },
];

const toggleButton = (active: boolean): React.CSSProperties => ({
  padding: "4px 10px",
  fontSize: 10,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  border: "none",
  cursor: "pointer",
  background: active ? "rgba(255,255,255,0.9)" : "transparent",
  color: active ? "#1a1a1a" : "rgba(255,255,255,0.6)",
});

function Card({ product, index }: { product: BestSeller; index: number }) {
  const navigate = useNavigate();
  const [view, setView] = useState<"swatch" | "room">("swatch");
  const image = view === "swatch" ? product.swatchImage : product.roomImage;

  return (
    <motion.article
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      onClick={() => navigate(`/flooring?product=${product.id}`)}
      className="bs-card hover:-translate-y-1"
      style={{
        margin: 0,
        cursor: "pointer",
        background: "var(--color-bg-base)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "transform 260ms, box-shadow 260ms",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={image}
          alt={`${product.collection} ${product.name} ${view}`}
          loading="lazy"
          style={{ width: "100%", aspectRatio: "3 / 4", objectFit: "cover", display: "block", transition: "opacity 300ms" }}
        />
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "var(--color-accent)",
            color: "#fff",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            borderRadius: 999,
            padding: "3px 10px",
            fontWeight: 600,
          }}
        >
          {product.tag}
        </span>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            display: "flex",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            borderRadius: 999,
            overflow: "hidden",
          }}
        >
          <button type="button" aria-pressed={view === "room"} onClick={() => setView("room")} style={toggleButton(view === "room")}>
            Room
          </button>
          <button type="button" aria-pressed={view === "swatch"} onClick={() => setView("swatch")} style={toggleButton(view === "swatch")}>
            Swatch
          </button>
        </div>
      </div>

      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
        <h3
          style={{
            fontSize: 15,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
            fontFamily: "var(--font-display)",
            margin: 0,
          }}
        >
          {product.name}
        </h3>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 2, color: "var(--color-text-muted)" }}>
          {product.collection}
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ borderTop: "1px solid var(--color-border)", marginTop: 12 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--color-accent)" }}>{product.price}</span>
          <span
            style={{
              background: "var(--color-bg-elevated)",
              color: "var(--color-accent)",
              fontSize: 10,
              fontWeight: 600,
              borderRadius: 999,
              padding: "2px 8px",
            }}
          >
            {product.thickness}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            navigate("/contact");
          }}
          style={{
            marginTop: 10,
            width: "100%",
            height: 38,
            background: "var(--color-accent)",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            transition: "opacity 200ms",
          }}
        >
          Get a Quote
        </button>
      </div>
    </motion.article>
  );
}

export default function BestSellers() {
  const [activeDot, setActiveDot] = useState(0);

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const first = el.firstElementChild as HTMLElement | null;
    if (!first) return;
    const step = first.offsetWidth + 12;
    setActiveDot(Math.min(BEST_SELLERS.length - 1, Math.max(0, Math.round(el.scrollLeft / step))));
  };

  return (
    <section className="bs-section">
      <style>{`
        .bs-section { background: var(--color-bg-base); padding: 100px var(--padding-x); }
        .bs-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .bs-dots { display: none; }
        @media (min-width: 1024px) { .bs-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 1280px) { .bs-grid { grid-template-columns: repeat(5, 1fr); } }
        @media (max-width: 768px) { .bs-section { padding: 64px var(--padding-x-mobile); } }
        @media (max-width: 639px) {
          .bs-grid { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; gap: 12px; padding-bottom: 4px; }
          .bs-grid::-webkit-scrollbar { display: none; }
          .bs-grid > .bs-card { flex-shrink: 0; width: 72vw; scroll-snap-align: center; }
          .bs-dots { display: flex; justify-content: center; gap: 6px; margin-top: 16px; }
        }
      `}</style>
      <div className="max-w-[var(--max-width)] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}
        >
          <div>
            <SectionLabel>LVP Flooring</SectionLabel>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 4.5vw, 52px)", fontWeight: 700, letterSpacing: "-0.02em", marginTop: 8 }}>
              Customer <span className="gradient-text">favorites.</span>
            </h2>
            <p style={{ marginTop: 12, fontSize: 15, color: "var(--color-text-secondary)", maxWidth: 400 }}>
              Our most requested LVP options. Waterproof, durable and beautiful.
            </p>
          </div>
          <Link to="/flooring" className="hover:opacity-75" style={{ fontSize: 14, fontWeight: 500, color: "var(--color-accent)", display: "flex", alignItems: "center", gap: 6 }}>
            View Full Catalog
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>

        <div className="bs-grid" onScroll={onScroll}>
          {BEST_SELLERS.map((p, i) => <Card key={p.id} product={p} index={i} />)}
        </div>

        <div className="bs-dots" aria-hidden="true">
          {BEST_SELLERS.map((p, i) => (
            <span key={p.id} style={{ width: activeDot === i ? 20 : 6, height: 6, borderRadius: 999, background: activeDot === i ? "#7a4f1e" : "#e8e8e6", transition: "all 300ms" }} />
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "var(--color-text-muted)", marginBottom: 16 }}>Showing 5 of 24 available colorways</p>
          <Link to="/flooring"><BrandButton variant="primary">Browse Full Catalog</BrandButton></Link>
        </div>
      </div>
    </section>
  );
}
