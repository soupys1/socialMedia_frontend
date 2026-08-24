const PRESETS = {
  aurora:  ["#6d28d9","#4f46e5","#7c3aed","#8b5cf6","#a78bfa","#c4b5fd","#6d28d9","#818cf8","#5e6ad2","#4338ca"],
  ocean:   ["#0ea5e9","#38bdf8","#7dd3fc","#22d3ee","#0e7490","#0369a1","#0ea5e9","#38bdf8","#22d3ee","#06b6d4"],
  sunset:  ["#f97316","#fb923c","#fbbf24","#f59e0b","#ef4444","#dc2626","#f97316","#fb923c","#fbbf24","#f59e0b"],
  nature:  ["#22c55e","#4ade80","#86efac","#16a34a","#15803d","#166534","#22c55e","#4ade80","#86efac","#16a34a"],
};

export default function GlowBorderCard({
  children,
  preset = "aurora",
  animationDuration = 4,
  borderWidth = 1.5,
  blurAmount = 18,
  borderRadius = 12,
  style,
  className,
  ...rest
}) {
  const colors = PRESETS[preset] || PRESETS.aurora;
  const stops = colors.map((c, i) => `${c} ${(i / colors.length) * 100}%`).join(", ");
  const conic = `conic-gradient(from var(--glow-angle), ${stops})`;

  return (
    <div
      style={{ position: "relative", borderRadius, padding: borderWidth, ...style }}
      className={className}
      {...rest}
    >
      {/* rotating border */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          background: conic,
          animation: `rotateGlow ${animationDuration}s linear infinite`,
        }}
      />
      {/* glow bloom behind */}
      <div
        style={{
          position: "absolute", inset: 0, borderRadius: "inherit",
          background: conic,
          animation: `rotateGlow ${animationDuration}s linear infinite`,
          filter: `blur(${blurAmount}px)`,
          opacity: 0.35,
        }}
      />
      {/* inner content */}
      <div
        style={{
          position: "relative",
          borderRadius: `calc(${borderRadius}px - ${borderWidth}px)`,
          backgroundColor: "var(--canvas)",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}
