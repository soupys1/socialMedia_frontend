export default function BorderBeam({
  children,
  beamWidth = 1.5,
  borderRadius = 20,
  duration = 4,
  style,
  innerStyle,
  ...rest
}) {
  const beam = `conic-gradient(from var(--glow-angle), transparent 0%, #9c40ff 20%, #ffaa40 40%, transparent 55%)`;

  return (
    <div
      style={{
        position: "relative",
        padding: beamWidth,
        borderRadius,
        ...style,
      }}
      {...rest}
    >
      {/* rotating beam */}
      <div
        style={{
          position: "absolute", inset: 0,
          borderRadius: "inherit",
          background: beam,
          animation: `rotateGlow ${duration}s linear infinite`,
        }}
      />
      {/* soft bloom */}
      <div
        style={{
          position: "absolute", inset: 0,
          borderRadius: "inherit",
          background: beam,
          animation: `rotateGlow ${duration}s linear infinite`,
          filter: "blur(12px)",
          opacity: 0.4,
        }}
      />
      {/* inner content */}
      <div
        style={{
          position: "relative",
          borderRadius: `calc(${borderRadius}px - ${beamWidth}px)`,
          backgroundColor: "var(--canvas-soft)",
          overflow: "hidden",
          ...innerStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
