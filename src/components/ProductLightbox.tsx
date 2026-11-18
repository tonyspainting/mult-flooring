import { useEffect, useState } from "react";
import { whatsappUrl } from "@/lib/constants";
import type { FloorProduct } from "@/lib/catalogData";

interface Props {
  product: FloorProduct;
  /** Collection description, rendered below the product name. */
  description?: string;
  onClose: () => void;
}

/**
 * Product lightbox: enlarged photos (swatch and room), navigation by
 * arrows, keyboard and swipe, plus a WhatsApp quote button.
 */
export default function ProductLightbox({ product, description, onClose }: Props) {
  const images = [product.swatchImage, product.roomImage].filter(Boolean);
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);
  const next = () => setIndex((i) => (i + 1) % images.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length, onClose]);

  const [touchStart, setTouchStart] = useState<number | null>(null);

  const arrow = (side: "left" | "right"): React.CSSProperties => ({
    position: "absolute",
    [side]: 12,
    top: "50%",
    transform: "translateY(-50%)",
    width: 44,
    height: 44,
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.45)",
    color: "#fff",
    fontSize: 22,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${product.collection} ${product.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.97)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: "none",
          background: "rgba(255,255,255,0.12)",
          color: "#fff",
          fontSize: 22,
          cursor: "pointer",
          zIndex: 2,
        }}
      >
        ✕
      </button>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          padding: "56px 64px 0",
        }}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchStart == null) return;
          const dx = e.changedTouches[0].clientX - touchStart;
          if (dx > 40) prev();
          else if (dx < -40) next();
          setTouchStart(null);
        }}
      >
        {images.length > 1 && (
          <button onClick={prev} aria-label="Previous photo" style={arrow("left")}>
            ‹
          </button>
        )}
        <img
          src={images[index]}
          alt={`${product.collection} ${product.name}, ${index === 0 ? "swatch" : "room"}`}
          style={{ maxHeight: "60vh", maxWidth: "90vw", objectFit: "contain", display: "block" }}
        />
        {images.length > 1 && (
          <button onClick={next} aria-label="Next photo" style={arrow("right")}>
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, padding: "12px 0 0" }}>
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={`Photo ${i + 1}`}
              style={{
                width: i === index ? 22 : 7,
                height: 7,
                borderRadius: 999,
                border: "none",
                padding: 0,
                cursor: "pointer",
                background: i === index ? "var(--color-accent-mid)" : "rgba(255,255,255,0.35)",
                transition: "width 200ms",
              }}
            />
          ))}
        </div>
      )}

      <div style={{ padding: "20px 24px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.55)" }}>
          {product.collection}
        </div>
        <h2
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 26,
            fontWeight: 700,
            color: "#fff",
            margin: "6px 0 0",
            letterSpacing: "-0.01em",
          }}
        >
          {product.name}
        </h2>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16, marginTop: 10 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "var(--color-accent-mid)" }}>{product.price}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
            {product.thickness}, {product.tone}
          </span>
        </div>

        {description && (
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.6)", maxWidth: 460, margin: "14px auto 0" }}>
            {description}
          </p>
        )}

        <a
          href={whatsappUrl(
            `Hi! I'm interested in ${product.collection} ${product.name} (${product.price}). Can you tell me more?`,
          )}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
            padding: "13px 28px",
            borderRadius: 8,
            background: "var(--color-accent)",
            color: "#fff",
            fontWeight: 600,
            fontSize: 14,
            textDecoration: "none",
          }}
        >
          Get a Quote on WhatsApp
        </a>
      </div>
    </div>
  );
}
