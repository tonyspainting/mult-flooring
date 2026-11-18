import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/layout/Footer";
import BrandButton from "@/components/ui/mult-button";
import SectionLabel from "@/components/ui/mult-section-label";
import Divider from "@/components/ui/mult-divider";
import SEO from "@/components/SEO";
import { COMPANY } from "@/lib/constants";

const EASE = [0.16, 1, 0.3, 1] as const;

// ─────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────
import { SWATCHES, type Species, type Tone } from "@/lib/catalogData";
import { useRequestProduct } from "@/context/RequestProductContext";


const SPECIES_LIST: Species[] = [
  "Red Oak",
  "White Oak",
  "Parquet",
  "Vinyl (LVP)",
  "Laminate",
];
const TONES: Tone[] = ["Light", "Medium", "Dark"];
const ROOMS = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Office",
  "Basement",
  "Foyer",
];

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────
const SwatchImage = ({ src, alt, hex }: { src: string; alt: string; hex: string }) => {
  const [error, setError] = useState(false);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: hex,
        position: "relative",
      }}
    >
      {!error && (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setError(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            transition: "transform 500ms var(--ease-out-expo)",
          }}
        />
      )}
    </div>
  );
};

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      padding: "6px 14px",
      borderRadius: "var(--radius-pill)",
      fontSize: 12,
      fontWeight: active ? 500 : 400,
      fontFamily: "var(--font-family)",
      cursor: "pointer",
      whiteSpace: "nowrap",
      transition: "all var(--duration-base) var(--ease-out-expo)",
      background: active ? "var(--color-accent)" : "var(--color-bg-base)",
      border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
      color: active ? "#ffffff" : "var(--color-text-muted)",
    }}
  >
    {label}
  </button>
);

// ─────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────
const FloorsPage = () => {
  const [activeSpecies, setActiveSpecies] = useState<string>("All");
  const [activeTone, setActiveTone] = useState<string>("All");
  const [activeRoom, setActiveRoom] = useState<string>("All");
  const [query, setQuery] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const [searchParams] = useSearchParams();
  const { openRequest } = useRequestProduct();

  // Deep link: /floors?swatch=<id> resets filters, selects that swatch and
  // scrolls to the detail panel (the selectedId effect below does the scroll).
  useEffect(() => {
    const swatchId = searchParams.get("swatch");
    if (!swatchId) return;
    if (!SWATCHES.find((s) => s.id === swatchId)) return;
    setActiveSpecies("All");
    setActiveTone("All");
    setActiveRoom("All");
    setSelectedId(swatchId);
  }, [searchParams]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SWATCHES.filter((s) => {
      if (activeSpecies !== "All" && s.species !== activeSpecies) return false;
      if (activeTone !== "All" && s.tone !== activeTone) return false;
      if (activeRoom !== "All" && !s.rooms.includes(activeRoom)) return false;
      if (q) {
        const haystack = `${s.name} ${s.species} ${s.finish} ${s.tone} ${s.width} ${s.description} ${s.rooms.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [activeSpecies, activeTone, activeRoom, query]);

  // If selected swatch is filtered out, deselect
  useEffect(() => {
    if (selectedId && !filtered.find((s) => s.id === selectedId)) {
      setSelectedId(null);
    }
  }, [filtered, selectedId]);

  // Scroll detail into view
  useEffect(() => {
    if (selectedId) {
      const t = setTimeout(() => {
        detailRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
      return () => clearTimeout(t);
    }
  }, [selectedId]);

  const hasActiveFilters =
    activeSpecies !== "All" ||
    activeTone !== "All" ||
    activeRoom !== "All" ||
    query.trim() !== "";
  const resetFilters = () => {
    setActiveSpecies("All");
    setActiveTone("All");
    setActiveRoom("All");
    setQuery("");
  };

  const selected = selectedId
    ? SWATCHES.find((s) => s.id === selectedId) ?? null
    : null;

  return (
    <>
      <SEO
        title="Digital Showroom and Floor Samples | Mult Flooring"
        description="Browse 23 hardwood, vinyl and laminate floor finishes. Free samples delivered. Installation across New England."
        canonical="/floors"
        schema={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Digital Showroom and Floor Samples",
          description:
            "Hardwood, vinyl and laminate floor finishes with free samples delivered. Installation across Massachusetts, Rhode Island and Connecticut.",
          url: "https://multflooring.com/floors",
          isPartOf: {
            "@type": "WebSite",
            name: "Mult Flooring",
            url: "https://multflooring.com",
          },
        }}
      />
      <Navbar />

      {/* ─── PAGE HEADER ─── */}
      <header
        style={{
          background: "var(--color-bg-surface)",
          paddingTop: 140,
          paddingBottom: 72,
        }}
        className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
      >
        <div
          className="mx-auto grid grid-cols-1 md:grid-cols-2 items-end gap-16"
          style={{ maxWidth: "var(--max-width)" }}
        >
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <SectionLabel>Digital Showroom</SectionLabel>
            <h1
              style={{
                fontSize: "clamp(40px, 5.5vw, 72px)",
                fontWeight: 500,
                letterSpacing: "-0.025em",
                lineHeight: 1,
                marginTop: 12,
                color: "var(--color-text-primary)",
                whiteSpace: "pre-line",
              }}
            >
              Find your{"\n"}
              <span className="gradient-text">perfect floor.</span>
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.7,
                color: "var(--color-text-secondary)",
                marginTop: 20,
                maxWidth: 420,
              }}
            >
              Browse our complete collection of hardwood, vinyl and laminate.
              Click any swatch to see full details and get a free sample.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/contact">
                <BrandButton variant="primary" size="md">
                  Request a Consultation
                </BrandButton>
              </Link>
              {COMPANY?.phone && (
                <a href={`tel:${COMPANY.phoneRaw ?? COMPANY.phone.replace(/[^0-9+]/g, "")}`}>
                  <BrandButton variant="secondary" size="md">
                    Call {COMPANY.phone}
                  </BrandButton>
                </a>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            {[
              { v: "23", l: "Finishes in stock" },
              { v: "5", l: "Species available" },
              { v: "Free", l: "Samples" },
            ].map((s, i) => (
              <div
                key={i}
                style={{
                  background: "var(--color-bg-base)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-lg)",
                  padding: "20px 16px",
                }}
              >
                <div
                  style={{
                    fontSize: "clamp(26px, 3vw, 36px)",
                    fontFamily: "var(--font-display)",
                    fontWeight: 600,
                    color: "var(--color-accent)",
                    letterSpacing: "-0.02em",
                    lineHeight: 1,
                  }}
                >
                  {s.v}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--color-text-muted)",
                    marginTop: 10,
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </header>

      {/* ─── FILTER BAR ─── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
        style={{
          background: "var(--color-bg-surface)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 60,
          zIndex: 400,
        }}
        className="py-4 md:py-6 px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
      >
        <div
          style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}
          className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:gap-8 flex-1 min-w-0">
            {/* Search */}
            <div className="min-w-0 lg:w-[220px] lg:shrink-0">
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted)",
                }}
              >
                Search
              </div>
              <div style={{ position: "relative", marginTop: 8 }}>
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

            {/* Species */}
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted)",
                }}
              >
                Species
              </div>
              <div
                className="no-scrollbar"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                  overflowX: "auto",
                }}
              >
                <FilterPill
                  label="All"
                  active={activeSpecies === "All"}
                  onClick={() => setActiveSpecies("All")}
                />
                {SPECIES_LIST.map((sp) => (
                  <FilterPill
                    key={sp}
                    label={sp}
                    active={activeSpecies === sp}
                    onClick={() => setActiveSpecies(sp)}
                  />
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted)",
                }}
              >
                Tone
              </div>
              <div
                className="no-scrollbar"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                }}
              >
                <FilterPill
                  label="All"
                  active={activeTone === "All"}
                  onClick={() => setActiveTone("All")}
                />
                {TONES.map((t) => (
                  <FilterPill
                    key={t}
                    label={t}
                    active={activeTone === t}
                    onClick={() => setActiveTone(t)}
                  />
                ))}
              </div>
            </div>

            {/* Room */}
            <div className="min-w-0">
              <div
                style={{
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--color-text-muted)",
                }}
              >
                Room
              </div>
              <div
                className="no-scrollbar"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 6,
                  marginTop: 8,
                  overflowX: "auto",
                }}
              >
                <FilterPill
                  label="All"
                  active={activeRoom === "All"}
                  onClick={() => setActiveRoom("All")}
                />
                {ROOMS.map((r) => (
                  <FilterPill
                    key={r}
                    label={r}
                    active={activeRoom === r}
                    onClick={() => setActiveRoom(r)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div
            style={{ display: "flex", alignItems: "center", gap: 16 }}
            className="shrink-0"
          >
            <span
              style={{
                fontSize: 13,
                color: "var(--color-text-muted)",
              }}
            >
              {filtered.length} finishes
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  fontSize: 12,
                  color: "var(--color-accent)",
                  cursor: "pointer",
                  background: "none",
                  border: "none",
                  padding: 0,
                  fontFamily: "var(--font-family)",
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </motion.section>

      {/* ─── SWATCH WALL ─── */}
      <section
        style={{ background: "var(--color-bg-base)" }}
        className="py-6 md:py-10 px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
      >
        <div style={{ maxWidth: "var(--max-width)", margin: "0 auto" }}>
          {filtered.length === 0 && (
            <div
              style={{
                padding: "80px 0",
                textAlign: "center",
                color: "var(--color-text-muted)",
                fontSize: 15,
              }}
            >
              No finishes match your filters.{" "}
              <button
                type="button"
                onClick={resetFilters}
                style={{
                  color: "var(--color-accent)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 15,
                  textDecoration: "underline",
                }}
              >
                Reset
              </button>
              <div style={{ marginTop: 20 }}>
                <button
                  type="button"
                  onClick={() => openRequest({ source: "floors-page" })}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    background: "var(--color-accent)",
                    color: "#ffffff",
                    padding: "10px 24px",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "var(--font-family)",
                  }}
                >
                  Request this floor
                </button>
              </div>
            </div>
          )}

          {SPECIES_LIST.map((sp, gIdx) => {
            const group = filtered.filter((s) => s.species === sp);
            if (group.length === 0) return null;
            const detailInGroup = selected && selected.species === sp ? selected : null;

            return (
              <motion.div
                key={sp}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: Math.min(gIdx * 0.05, 0.3),
                }}
                style={{ marginTop: gIdx === 0 ? 0 : 40 }}
              >
                {/* Group header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "var(--color-text-primary)",
                    }}
                  >
                    {sp}
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 1,
                      background: "var(--color-border)",
                    }}
                  />
                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--color-text-muted)",
                    }}
                  >
                    {group.length} finish{group.length === 1 ? "" : "es"}
                  </div>
                </div>

                {/* Grid */}
                <div
                  style={{
                    display: "grid",
                    gap: 8,
                  }}
                  className="grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                >
                  <AnimatePresence mode="popLayout">
                    {group.map((s, i) => {
                      const isSelected = selectedId === s.id;
                      return (
                        <motion.div
                          key={s.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{
                            duration: 0.2,
                            delay: Math.min(i * 0.03, 0.3),
                          }}
                          onClick={() =>
                            setSelectedId(isSelected ? null : s.id)
                          }
                          className="swatch-card group"
                          style={{
                            cursor: "pointer",
                            borderRadius: "var(--radius-md)",
                            overflow: "hidden",
                            border: `2px solid ${isSelected ? "var(--color-accent)" : "transparent"}`,
                            outline: "1px solid var(--color-border)",
                            outlineOffset: -1,
                            transition: "all 260ms var(--ease-out-expo)",
                            background: "var(--color-bg-base)",
                          }}
                        >
                          <div
                            style={{
                              width: "100%",
                              aspectRatio: "1 / 1",
                              overflow: "hidden",
                            }}
                            className="swatch-img-wrap"
                          >
                            <SwatchImage
                              src={s.image}
                              alt={`${s.species} ${s.name}`}
                              hex={s.hex}
                            />
                          </div>
                          <div
                            style={{
                              padding: "8px 10px",
                              background: "var(--color-bg-base)",
                              borderTop: "1px solid var(--color-border)",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              gap: 8,
                            }}
                          >
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 500,
                                  color: "var(--color-text-primary)",
                                  letterSpacing: "-0.01em",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {s.name}
                              </div>
                              {s.tag && (
                                <div
                                  style={{
                                    fontSize: 9,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                    color: "var(--color-accent-mid, var(--color-accent))",
                                    marginTop: 2,
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {s.tag}
                                </div>
                              )}
                            </div>
                            <div
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: s.hex,
                                border: "1px solid rgba(0,0,0,0.12)",
                                marginTop: 4,
                                flexShrink: 0,
                              }}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

                {/* Detail panel: anchored to selected swatch's group */}
                <AnimatePresence initial={false}>
                  {detailInGroup && (
                    <motion.div
                      key={detailInGroup.id}
                      ref={detailRef}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          background: "var(--color-bg-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius-lg)",
                          marginTop: 12,
                          marginBottom: 24,
                        }}
                        className="p-6 md:p-10"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-8 md:gap-12">
                          {/* LEFT: visual */}
                          <div>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                aspectRatio: "1 / 1",
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                border: "1px solid var(--color-border)",
                              }}
                            >
                              <SwatchImage
                                src={detailInGroup.image}
                                alt={`${detailInGroup.species} ${detailInGroup.name}`}
                                hex={detailInGroup.hex}
                              />
                            </motion.div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "var(--color-text-muted)",
                                marginTop: 12,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              {detailInGroup.species}: {detailInGroup.name}
                            </div>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginTop: 8,
                              }}
                            >
                              <div
                                style={{
                                  width: 20,
                                  height: 20,
                                  borderRadius: 4,
                                  background: detailInGroup.hex,
                                  border: "1px solid var(--color-border)",
                                }}
                              />
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "var(--color-text-muted)",
                                  fontFamily: "monospace",
                                }}
                              >
                                {detailInGroup.hex}
                              </div>
                            </div>
                          </div>

                          {/* RIGHT: details */}
                          <div>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                                gap: 16,
                              }}
                            >
                              <div>
                                <SectionLabel>{detailInGroup.species}</SectionLabel>
                                <h2
                                  style={{
                                    fontFamily: "var(--font-display)",
                                    fontSize: "clamp(28px, 3.5vw, 44px)",
                                    fontWeight: 700,
                                    letterSpacing: "-0.02em",
                                    lineHeight: 1.05,
                                    marginTop: 8,
                                    color: "var(--color-text-primary)",
                                  }}
                                >
                                  {detailInGroup.name}
                                </h2>
                                {detailInGroup.tag && (
                                  <div
                                    style={{
                                      display: "inline-block",
                                      marginTop: 8,
                                      fontSize: 10,
                                      textTransform: "uppercase",
                                      letterSpacing: "0.1em",
                                      color: "var(--color-accent)",
                                      background:
                                        "color-mix(in oklab, var(--color-accent) 12%, transparent)",
                                      padding: "4px 10px",
                                      borderRadius: "var(--radius-pill)",
                                    }}
                                  >
                                    {detailInGroup.tag}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => setSelectedId(null)}
                                aria-label="Close details"
                                style={{
                                  background: "var(--color-bg-elevated)",
                                  border: "1px solid var(--color-border)",
                                  borderRadius: "var(--radius-md)",
                                  padding: 8,
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <svg
                                  width="20"
                                  height="20"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  style={{ color: "var(--color-text-secondary)" }}
                                >
                                  <path d="M18 6L6 18" />
                                  <path d="M6 6l12 12" />
                                </svg>
                              </button>
                            </div>

                            <p
                              style={{
                                fontSize: 15,
                                lineHeight: 1.75,
                                color: "var(--color-text-secondary)",
                                marginTop: 20,
                              }}
                            >
                              {detailInGroup.description}
                            </p>

                            {/* Best for */}
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                alignItems: "center",
                                gap: 6,
                                marginTop: 16,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  textTransform: "uppercase",
                                  letterSpacing: "0.08em",
                                  color: "var(--color-text-muted)",
                                  marginRight: 4,
                                }}
                              >
                                Best for:
                              </span>
                              {detailInGroup.rooms.map((r) => (
                                <span
                                  key={r}
                                  style={{
                                    background: "var(--color-bg-elevated)",
                                    border: "1px solid var(--color-border)",
                                    borderRadius: "var(--radius-pill)",
                                    padding: "3px 10px",
                                    fontSize: 11,
                                    color: "var(--color-text-secondary)",
                                  }}
                                >
                                  {r}
                                </span>
                              ))}
                            </div>

                            <Divider style={{ margin: "24px 0" }} />

                            {/* Specs */}
                            <div
                              style={{
                                border: "1px solid var(--color-border)",
                                borderRadius: "var(--radius-md)",
                                overflow: "hidden",
                                display: "grid",
                                gridTemplateColumns: "auto 1fr",
                              }}
                            >
                              {[
                                ["Finish", detailInGroup.finish],
                                ["Thickness", detailInGroup.details.thickness],
                                ["Grade", detailInGroup.details.grade],
                                ["Coating", detailInGroup.details.coating],
                                ["Widths", detailInGroup.details.available_widths],
                              ].map(([k, v], i, arr) => (
                                <div key={k} style={{ display: "contents" }}>
                                  <div
                                    style={{
                                      background: "var(--color-bg-surface)",
                                      padding: "10px 14px",
                                      fontSize: 12,
                                      color: "var(--color-text-muted)",
                                      borderBottom:
                                        i === arr.length - 1
                                          ? "none"
                                          : "1px solid var(--color-border)",
                                    }}
                                  >
                                    {k}
                                  </div>
                                  <div
                                    style={{
                                      background: "var(--color-bg-base)",
                                      padding: "10px 14px",
                                      fontSize: 13,
                                      fontWeight: 500,
                                      color: "var(--color-text-primary)",
                                      borderBottom:
                                        i === arr.length - 1
                                          ? "none"
                                          : "1px solid var(--color-border)",
                                    }}
                                  >
                                    {v}
                                  </div>
                                </div>
                              ))}
                            </div>

                            <Divider style={{ margin: "24px 0" }} />

                            {/* CTAs */}
                            <div
                              style={{
                                display: "flex",
                                gap: 12,
                                flexWrap: "wrap",
                              }}
                            >
                              <Link to="/contact">
                                <BrandButton variant="primary" size="md">
                                  Get a Free Quote
                                </BrandButton>
                              </Link>
                              <BrandButton
                                variant="secondary"
                                size="md"
                                onClick={() =>
                                  window.open(
                                    `mailto:multflooring@gmail.com?subject=Sample Request: ${detailInGroup.species} ${detailInGroup.name}`,
                                    "_blank",
                                  )
                                }
                              >
                                Request a Sample
                              </BrandButton>
                            </div>

                            <p
                              style={{
                                fontSize: 12,
                                color: "var(--color-text-muted)",
                                marginTop: 12,
                              }}
                            >
                              Free samples delivered to your door. Installation
                              across New England.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Request a product */}
          <div
            style={{
              background: "#f0e6d8",
              borderRadius: 16,
              padding: 40,
              textAlign: "center",
              marginTop: 48,
            }}
          >
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
            <p style={{ fontSize: 15, color: "#6b6b6b", margin: "12px auto 24px", maxWidth: 420, lineHeight: 1.6 }}>
              The catalog shows only a selection. We can source hundreds of other floors.
            </p>
            <BrandButton variant="primary" size="md" onClick={() => openRequest({ source: "floors-page" })}>
              Request a Product
            </BrandButton>
          </div>
        </div>

        <style>{`
          .swatch-card:hover {
            outline-color: var(--color-border-strong) !important;
            transform: scale(1.02);
          }
          .swatch-card:hover .swatch-img-wrap img {
            transform: scale(1.06);
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
      </section>

      {/* ─── CTA BANNER ─── */}
      <section
        style={{
          background: "var(--color-bg-dark, #1a1a1a)",
          paddingTop: "var(--section-py)",
          paddingBottom: "var(--section-py)",
        }}
        className="px-[var(--padding-x-mobile)] md:px-[var(--padding-x)]"
      >
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <SectionLabel style={{ color: "rgba(201,168,76,0.80)" }}>
            Need help deciding?
          </SectionLabel>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(32px, 4.5vw, 56px)",
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.05,
              color: "#ffffff",
              marginTop: 12,
            }}
          >
            Can't decide? Let us help.
          </h2>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: "rgba(255,255,255,0.60)",
              marginTop: 16,
              maxWidth: 560,
              margin: "16px auto 0",
            }}
          >
            Schedule a free consultation and our specialists will guide you to
            the perfect floor for your home.
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              alignItems: "center",
              flexWrap: "wrap",
              marginTop: 28,
            }}
          >
            <Link to="/contact">
              <BrandButton variant="primary" size="lg">
                Schedule Consultation
              </BrandButton>
            </Link>
            {COMPANY?.phone && (
              <a
                href={`tel:${COMPANY.phone.replace(/[^0-9+]/g, "")}`}
                style={{
                  fontSize: 15,
                  color: "rgba(255,255,255,0.70)",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.30)",
                  paddingBottom: 2,
                }}
              >
                or call {COMPANY.phone}
              </a>
            )}
          </div>
          {/* Development Credit */}
          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.04)",
              marginTop: 16,
              paddingTop: 16,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.25)",
                letterSpacing: "0.02em",
              }}
            >
              Website designed & developed by
            </span>
            <a
              href="https://wa.me/13392428150"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.02em",
                textDecoration: "none",
                display: "inline-block",
                background: "linear-gradient(135deg, #C9A84C 0%, #E8C87A 45%, #C9A84C 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                transition: "all 300ms ease",
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #E8C87A 0%, #C9A84C 50%, #E8C87A 100%)";
                (e.currentTarget.style as any).webkitBackgroundClip = "text";
                (e.currentTarget.style as any).webkitTextFillColor = "transparent";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "linear-gradient(135deg, #C9A84C 0%, #E8C87A 45%, #C9A84C 100%)";
                (e.currentTarget.style as any).webkitBackgroundClip = "text";
                (e.currentTarget.style as any).webkitTextFillColor = "transparent";
              }}
            >
              Elenardi Consulting
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default FloorsPage;
