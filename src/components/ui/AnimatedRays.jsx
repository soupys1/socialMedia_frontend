import { useEffect, useState } from "react";

const stripes = `repeating-linear-gradient(
  100deg,
  #60a5fa 0%,
  #60a5fa 7%,
  transparent 10%,
  transparent 12%,
  #60a5fa 16%
)`;

const rainbow = `repeating-linear-gradient(
  100deg,
  #60a5fa 10%,
  #e879f9 15%,
  #60a5fa 20%,
  #5eead4 25%,
  #60a5fa 30%
)`;

export default function AnimatedRays({ children, style, className = "", ...rest }) {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDark = () => document.documentElement.getAttribute("data-theme") === "dark";
    setIsDark(checkDark());

    const observer = new MutationObserver(() => setIsDark(checkDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  if (!mounted) return null;

  return (
    <section
      style={{ position: "relative", width: "100%", overflow: "hidden", ...style }}
      className={className}
      {...rest}
    >
      {/* Aurora layer */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `${stripes}, ${rainbow}`,
          backgroundSize: "300%, 200%",
          backgroundPosition: "50% 50%, 50% 50%",
          filter: isDark
            ? "blur(10px) opacity(50%) saturate(200%)"
            : "blur(10px) invert(100%)",
          maskImage: "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 100% 0%, black 40%, transparent 70%)",
        }}
      >
        {/* Animated overlay for the shifting effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `${stripes}, ${rainbow}`,
            backgroundSize: "200%, 100%",
            backgroundAttachment: "fixed",
            mixBlendMode: "difference",
            animation: "aurora-bg 60s linear infinite",
          }}
        />
      </div>

      {/* Content sits above aurora */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </section>
  );
}
