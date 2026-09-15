import Image from "next/image";
import Link from "next/link";
import { Scissors, ArrowRight } from "lucide-react";
import TornEdge from "./TornEdge";
import { INK, GOLD, CREAM } from "@/lib/home-theme";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: INK }}
    >
      {/* Warm glow behind the headline */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70%]"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 0%, ${GOLD}26, transparent 70%)`,
        }}
      />
      {/* Faint grain texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative mx-auto flex min-h-[92vh] max-w-lg flex-col items-center px-6 pb-16 pt-14 text-center sm:min-h-[85vh]">
        {/* Nav */}
        <nav className="flex w-full items-center justify-between">
          <Image
            src="/IMG_8197-removebg-preview.png"
            alt="IB Barber"
            width={120}
            height={40}
            className="h-9 w-auto"
          />
          <Link
            href="/book"
            className="rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/80 transition-colors hover:text-white"
            style={{ border: `1px solid ${GOLD}66` }}
          >
            Réserver
          </Link>
        </nav>

        <div className="flex flex-1 flex-col items-center justify-center">
          <div
            className="mb-6 flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/70"
            style={{ border: `1px solid ${GOLD}40` }}
          >
            <Scissors className="h-3.5 w-3.5" style={{ color: GOLD }} />
            Salon barbier
          </div>

          <h1
            className="text-[3.25rem] leading-[0.95] text-white sm:text-7xl"
            style={{ fontFamily: "var(--font-bebas)" }}
          >
            IB <span style={{ color: GOLD }}>BARBER</span>
          </h1>

          <p className="mt-6 max-w-xs text-base text-white/60">
            Réserve ton créneau chez IB en quelques clics.
          </p>

          <Link
            href="/book"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wider text-black transition-transform active:scale-95"
            style={{ backgroundColor: GOLD }}
          >
            Réserver mon créneau
            <ArrowRight className="h-4 w-4" />
          </Link>

          <p className="mt-4 text-xs uppercase tracking-widest text-white/40">
            Sans création de compte · Confirmation immédiate
          </p>
        </div>
      </div>

      <TornEdge fill={CREAM} />
    </section>
  );
}
