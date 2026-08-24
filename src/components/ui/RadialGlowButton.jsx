import { motion } from "framer-motion";

export default function RadialGlowButton({
  children,
  onClick,
  disabled,
  type = "button",
  style,
  size = "md",
  ...rest
}) {
  const padding = size === "sm" ? "6px 16px" : size === "lg" ? "11px 28px" : "8px 22px";
  const fontSize = size === "sm" ? 12 : size === "lg" ? 15 : 13;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { scale: 1.03 }}
      whileTap={disabled ? {} : { scale: 0.96 }}
      style={{
        position: "relative",
        overflow: "hidden",
        background: `conic-gradient(from var(--glow-angle), #9c40ff, #c060ff, #ffaa40, #ff7040, #9c40ff)`,
        animation: "rotateGlow 3s linear infinite",
        color: "#fff",
        border: "none",
        borderRadius: 99,
        padding,
        fontSize,
        fontWeight: 600,
        fontFamily: "inherit",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.45 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        ...style,
      }}
      {...rest}
    >
      {/* gloss layer */}
      <span
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(255,255,255,0.12) 0%, transparent 60%)",
          borderRadius: "inherit",
          pointerEvents: "none",
        }}
      />
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
    </motion.button>
  );
}
