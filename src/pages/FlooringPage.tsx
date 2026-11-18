import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "@/components/SEO";
import Layout from "@/components/layout/Layout";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/layout/Footer";
import { COLLECTIONS, type FloorProduct, type Tone } from "@/lib/catalogData";
import { whatsappUrl } from "@/lib/constants";
import ProductLightbox from "@/components/ProductLightbox";
import { useRequestProduct } from "@/context/RequestProductContext";

const TONES: Tone[] = ["Light", "Medium", "Dark"];

const TOTAL_PRODUCTS = COLLECTIONS.reduce((n, c) => n + c.products.length, 0);

const ALL_PRODUCTS = COLLECTIONS.flatMap((c) => c.products);

const priceValue = (price: string) => (price.match(/[\d.]+/) || ["0"])[0];

// Schema.org: the page is a catalog and each colorway is a Product with an offer.
const flooringSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Vinyl Plank Flooring Catalog",
  description:
    "LVP vinyl plank flooring catalog with Permshield Lite, Permshield One Plus and MSI Cyrus collections, available in MA, RI and CT.",
  url: "https://multflooring.com/flooring",
  isPartOf: { "@type": "WebSite", name: "Mult Flooring", url: "https://multflooring.com" },
  mainEntity: {
    "@type": "ItemList",
    numberOfItems: TOTAL_PRODUCTS,
    itemListElement: ALL_PRODUCTS.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: p.name,
        description: `${p.collection} luxury vinyl plank, ${p.thickness} thick, ${p.tone.toLowerCase()} tone.`,
        image: `https://multflooring.com${p.swatchImage}`,
        brand: { "@type": "Brand", name: p.brand },
        category: "Flooring",
        offers: {
          "@type": "Offer",
          price: priceValue(p.price),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: priceValue(p.price),
            priceCurrency: "USD",
            unitText: "square foot",
          },
        },
      },
    })),
  },
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: "var(--color-accent)",
  color: "#fff",
  padding: "13px 32px",
  borderRadius: 6,
  fontWeight: 500,
  fontSize: 14,
  border: "none",
  cursor: "pointer",
};

const chip = (active: boolean): React.CSSProperties => ({
  padding: "7px 16px",
  borderRadius: 999,
  fontSize: 13,
  fontWeight: active ? 600 : 500,
  cursor: "pointer",
  border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
  background: active ? "var(--color-accent)" : "transparent",
  color: active ? "#fff" : "var(--color-text-secondary)",
  transition: "all 200ms",
});

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="3" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ProductCard({ product, onOpen }: { product: FloorProduct; onOpen: () => void }) {
  const [view, setView] = useState<"swatch" | "room">("swatch");
  const image = view === "swatch" ? product.swatchImage : product.roomImage;

  const toggle = (active: boolean): React.CSSProperties => ({
    padding: "4px 10px",
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    border: "none",
    cursor: "pointer",
    background: active ? "rgba(255,255,255,0.9)" : "transparent",
    color: active ? "#1a1a1a" : "rgba(255,255,255,0.6)",
  });

  return (
    <div
      id={`product-${product.id}`}
      role="button"
      tabIndex={0}
      onClick={() => onOpen()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      style={{
        background: "var(--color-bg-base)",
        border: "1px solid var(--color-border)",
        borderRadius: 12,
        overflow: "hidden",
        cursor: "pointer",
        transition: "box-shadow 260ms, transform 260ms",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={image}
          alt={`${product.collection} ${product.name} ${view}`}
          loading="lazy"
          style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block" }}
        />
        {product.tag && (
          <span
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              background: "var(--color-accent)",
              color: "#fff",
              fontSize: 10,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              borderRadius: 999,
              padding: "3px 10px",
            }}
          >
            {product.tag}
          </span>
        )}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 8,
            right: 8,
            display: "flex",
            background: "rgba(0,0,0,0.55)",
            borderRadius: 999,
            overflow: "hidden",
            backdropFilter: "blur(4px)",
          }}
        >
          <button type="button" aria-pressed={view === "swatch"} onClick={() => setView("swatch")} style={toggle(view === "swatch")}>
            Swatch
          </button>
          <button type="button" aria-pressed={view === "room"} onClick={() => setView("room")} style={toggle(view === "room")}>
            Room
          </button>
        </div>
      </div>

      <div style={{ padding: "12px 14px 14px" }}>
        <h3
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--color-text-primary)",
            margin: 0,
            letterSpacing: "-0.01em",
          }}
        >
          {product.name}
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--color-accent)" }}>{product.price}</span>
          <span style={{ fontSize: 11, color: "var(--color-text-muted)" }}>{product.thickness}</span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            // Same as the previous site: "Get a Quote" opens WhatsApp with the product.
            window.open(
              whatsappUrl(
                `Hi! I'm interested in ${product.collection} ${product.name} (${product.price}). Can you tell me more?`,
              ),
              "_blank",
              "noopener,noreferrer",
            );
          }}
          className="transition-all duration-200 hover:!bg-[#7a4f1e] hover:!text-white"
          style={{
            width: "100%",
            height: 38,
            border: "1px solid var(--color-accent)",
            borderRadius: 8,
            fontSize: 13,
            color: "var(--color-accent)",
            background: "var(--color-bg-base)",
            cursor: "pointer",
            marginTop: 10,
          }}
        >
          Get a Quote
        </button>
      </div>
    </div>
  );
}

export default function FlooringPage() {
  const [searchParams] = useSearchParams();
  const { openRequest } = useRequestProduct();

  const [collection, setCollection] = useState<string>("all");
  const [tone, setTone] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [lightbox, setLightbox] = useState<FloorProduct | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return COLLECTIONS.map((c) => ({
      ...c,
      products: c.products.filter((p) => {
        if (collection !== "all" && c.id !== collection) return false;
        if (tone !== "all" && p.tone !== tone) return false;
        if (q && !`${p.name} ${p.collection} ${p.brand} ${p.tone}`.toLowerCase().includes(q)) return false;
        return true;
      }),
    })).filter((c) => c.products.length > 0);
  }, [collection, tone, query]);

  const shown = filtered.reduce((n, c) => n + c.products.length, 0);

  // Direct link /flooring?product=<id> (from the home page): opens the lightbox.
  useEffect(() => {
    const productId = searchParams.get("product");
    if (!productId) return;
    const found = ALL_PRODUCTS.find((p) => p.id === productId);
    if (found) setLightbox(found);
    return undefined;
  }, [searchParams]);

  return (
    <Layout>
      <Navbar />
      <SEO
        title="Vinyl Plank Flooring Catalog | Mult Flooring"
        description="Browse our LVP vinyl plank flooring collections: Permshield Lite, Permshield One Plus and MSI Cyrus. Available in MA, RI and CT."
        canonical="/flooring"
        schema={flooringSchema}
      />

      {/* ── Hero ── */}
      <header style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src="/flooring/flooring-hero-showroom.jpg"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 65%", display: "block" }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.78) 50%, rgba(26,26,26,0.62) 100%), linear-gradient(rgba(26,26,26,0.3), rgba(26,26,26,0.4))",
            }}
          />
        </div>
        <div
          className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
          style={{ position: "relative", paddingTop: 140, paddingBottom: 80 }}
        >
          <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 items-end" style={{ gap: 64, maxWidth: 1280 }}>
            <div>
              <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.14em", color: "rgba(201,168,76,0.8)", fontWeight: 600 }}>
                LVP Catalog
              </div>
              <h1
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(40px, 6vw, 72px)",
                  fontWeight: 700,
                  color: "#fff",
                  letterSpacing: "-0.025em",
                  lineHeight: 1.05,
                  marginTop: 12,
                }}
              >
                Find your perfect
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #c9a84c 0%, #e8c87a 50%, #c9a84c 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  vinyl floor.
                </span>
              </h1>
              <p style={{ fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginTop: 20, maxWidth: 440 }}>
                Browse our complete LVP collection: waterproof, durable and beautiful. {COLLECTIONS.length} collections,{" "}
                {TOTAL_PRODUCTS} colorways, all available for installation across MA, RI and CT.
              </p>
            </div>
            <div className="grid grid-cols-3" style={{ gap: 24 }}>
              {[
                { value: String(TOTAL_PRODUCTS), label: "Colorways" },
                { value: String(COLLECTIONS.length), label: "Collections" },
                { value: "100%", label: "Waterproof" },
              ].map((s) => (
                <div key={s.label} style={{ borderLeft: "1px solid rgba(255,255,255,0.1)", paddingLeft: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)", marginTop: 8 }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Filtros ── */}
      <div
        className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
        style={{
          background: "var(--color-bg-surface)",
          paddingTop: 20,
          paddingBottom: 20,
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 68,
          zIndex: 30,
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="flex justify-between items-center" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--color-text-muted)", fontWeight: 600 }}>
              Refine Flooring
            </span>
            <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", fontSize: 14, color: "var(--color-text-secondary)" }}>
              {shown} colorways
            </span>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={{ position: "relative" }}>
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--color-accent)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search colors..."
                aria-label="Search colors"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: "100%",
                  height: 40,
                  borderRadius: 999,
                  border: "1px solid var(--color-border)",
                  padding: "0 16px 0 38px",
                  fontSize: 14,
                  outline: "none",
                  background: "var(--color-bg-base)",
                  color: "var(--color-text-primary)",
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 10 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-muted)", fontWeight: 600 }}>
              Collection
            </span>
            <button type="button" onClick={() => setCollection("all")} style={chip(collection === "all")}>
              All
            </button>
            {COLLECTIONS.map((c) => (
              <button key={c.id} type="button" onClick={() => setCollection(c.id)} style={chip(collection === c.id)}>
                {c.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center" style={{ gap: 10, marginTop: 12 }}>
            <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--color-text-muted)", fontWeight: 600 }}>
              Tone
            </span>
            <button type="button" onClick={() => setTone("all")} style={chip(tone === "all")}>
              All
            </button>
            {TONES.map((t) => (
              <button key={t} type="button" onClick={() => setTone(t)} style={chip(tone === t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Collections ── */}
      <main>
        {filtered.map((c) => (
          <section
            key={c.id}
            className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
            style={{ background: "var(--color-bg-base)", paddingTop: 64, paddingBottom: 64 }}
          >
            <div className="mx-auto" style={{ maxWidth: 1280 }}>
              <div className="flex flex-wrap items-end justify-between" style={{ gap: 16, marginBottom: 40 }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--color-text-muted)", marginBottom: 4 }}>
                    {c.brand}
                  </div>
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(28px, 4vw, 40px)",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      letterSpacing: "-0.02em",
                      margin: 0,
                    }}
                  >
                    {c.name}
                  </h2>
                  <div className="flex items-center" style={{ gap: 16, marginTop: 8 }}>
                    <span
                      style={{
                        background: "var(--color-bg-elevated)",
                        color: "var(--color-accent)",
                        borderRadius: 999,
                        padding: "4px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      {c.thickness}
                    </span>
                    <span style={{ fontSize: 20, fontWeight: 700, color: "var(--color-accent)" }}>{c.price}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--color-text-secondary)", marginTop: 12, maxWidth: 520, lineHeight: 1.6 }}>
                    {c.description}
                  </p>
                </div>
                <div className="flex flex-wrap" style={{ gap: 8 }}>
                  {c.features.map((f) => (
                    <span key={f} className="flex items-center" style={{ gap: 6, fontSize: 12, color: "var(--color-text-secondary)" }}>
                      <CheckIcon /> {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" style={{ gap: 16 }}>
                {c.products.map((p) => (
                  <ProductCard key={p.id} product={p} onOpen={() => setLightbox(p)} />
                ))}
              </div>
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <section style={{ background: "var(--color-bg-base)", padding: "64px var(--padding-x-mobile)" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", textAlign: "center" }}>
              <p style={{ fontSize: 16, color: "var(--color-text-secondary)" }}>
                No colorways match this filter. Try a different word, or browse everything.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCollection("all");
                  setTone("all");
                  setQuery("");
                }}
                style={{ ...primaryButton, marginTop: 20 }}
              >
                Clear filters
              </button>
            </div>
          </section>
        )}

        {/* ── CTA: nothing found ── */}
        <section className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]" style={{ background: "var(--color-bg-base)", paddingTop: 0, paddingBottom: 64 }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ background: "var(--color-bg-surface)", borderRadius: 16, padding: 40, textAlign: "center", marginTop: 64 }}>
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Don't see what you're looking for?
              </h3>
              <p style={{ fontSize: 15, color: "var(--color-text-secondary)", margin: "12px auto 24px", maxWidth: 420, lineHeight: 1.6 }}>
                The catalog shows only a selection. We can source hundreds of other floors.
              </p>
              <button type="button" onClick={() => openRequest({ source: "flooring-catalog" })} style={primaryButton}>
                Request a Product
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ── CTA final (dark) ── */}
      <section
        className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
        style={{ background: "var(--color-bg-dark)", paddingTop: 100, paddingBottom: 100, textAlign: "center" }}
      >
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(32px, 5vw, 56px)",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          Not sure which floor
          <br />
          is{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #c9a84c 0%, #e8c87a 50%, #c9a84c 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            right for you?
          </span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.6)", maxWidth: 480, margin: "16px auto 40px", lineHeight: 1.7 }}>
          Visit our showroom in East Bridgewater or schedule a free in-home consultation. Our team will guide you to the perfect floor
          for your space and budget.
        </p>
        <div className="flex flex-wrap justify-center" style={{ gap: 16 }}>
          <Link
            to="/showroom"
            style={{
              background: "linear-gradient(135deg, #7a4f1e, #c47c3a)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Visit Our Showroom
          </Link>
          <Link
            to="/contact"
            style={{
              border: "1px solid rgba(255,255,255,0.35)",
              color: "#fff",
              padding: "14px 28px",
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
            }}
          >
            Get a Free Quote
          </Link>
        </div>
      </section>

      {lightbox && (
        <ProductLightbox
          product={lightbox}
          description={COLLECTIONS.find((c) => c.label === lightbox.collection)?.description}
          onClose={() => setLightbox(null)}
        />
      )}

      <Footer />
    </Layout>
  );
}
