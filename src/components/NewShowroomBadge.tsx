/** Small gold "New Showroom" tag shown next to the showroom address. */
export const NewShowroomBadge = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-flex items-center align-middle ${className}`}
    style={{
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "#c9a96e",
      border: "1px solid rgba(201,169,110,0.55)",
      borderRadius: 999,
      padding: "3px 9px",
      lineHeight: 1.2,
      whiteSpace: "nowrap",
    }}
  >
    New Showroom
  </span>
);
