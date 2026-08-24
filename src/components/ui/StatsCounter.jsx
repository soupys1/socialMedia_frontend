import { useEffect, useRef } from "react";
import { useMotionValue, useSpring, useInView } from "framer-motion";

export default function StatsCounter({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  label,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const displayRef = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const spring = useSpring(count, { stiffness: 50, damping: 20 });

  useEffect(() => {
    const unsub = spring.on("change", (v) => {
      if (displayRef.current) {
        const rounded = decimals > 0 ? v.toFixed(decimals) : Math.round(v);
        displayRef.current.textContent = prefix + rounded + suffix;
      }
    });
    return unsub;
  }, [spring, prefix, suffix, decimals]);

  useEffect(() => {
    if (isInView) count.set(value);
  }, [isInView, value, count]);

  return (
    <div ref={ref} style={style} {...rest}>
      <div
        ref={displayRef}
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "var(--accent)",
          letterSpacing: "-0.5px",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {prefix}0{suffix}
      </div>
      {label && (
        <div style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 2 }}>
          {label}
        </div>
      )}
    </div>
  );
}
