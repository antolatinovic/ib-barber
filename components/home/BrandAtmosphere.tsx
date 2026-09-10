import { GOLD } from "@/lib/home-theme";

// Faint grain texture, same recipe as the Hero — keeps every ink-background
// screen (home + booking flow) feeling like the same printed poster stock.
export function Grain({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 opacity-[0.05] ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "3px 3px",
      }}
    />
  );
}

// Warm glow behind a headline, same recipe as the Hero.
export function GoldGlow({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 h-[70%] ${className}`}
      style={{
        background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${GOLD}26, transparent 70%)`,
      }}
    />
  );
}
