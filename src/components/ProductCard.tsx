import { useState } from "react";
import { whatsappUrl } from "@/lib/constants";

export interface ProductCardData {
  id: string;
  name: string;
  collection: string;
  thickness: string;
  price: string;
  tag?: string;
  swatchImage: string;
  roomImage: string;
}

interface Props {
  product: ProductCardData;
  /** Click on the card (image or text area). */
  onOpen?: () => void;
  className?: string;
}

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

/**
 * Single card used by every product grid: home favorites and the full catalog.
 * Keeps badge, image toggle, name, collection, price, thickness and the quote
 * button identical in both places.
 */
export default function ProductCard({ product, onOpen, className }: Props) {
  const [view, setView] = useState<"swatch" | "room">("swatch");
  const image = view === "swatch" ? product.swatchImage : product.roomImage;

  return (
    <article
      id={`product-${product.id}`}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen();
              }
            }
          : undefined
      }
      className={className}
      style={{
        width: "100%",
        height: "100%",
        margin: 0,
        cursor: onOpen ? "pointer" : "default",
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
        {product.tag && (
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
        )}
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
            window.open(
              whatsappUrl(
                `Hi! I'm interested in ${product.collection} ${product.name} (${product.price}). Can you tell me more?`,
              ),
              "_blank",
              "noopener,noreferrer",
            );
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
    </article>
  );
}
