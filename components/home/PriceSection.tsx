import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";
import { GOLD, INK } from "@/lib/home-theme";

const PRICES = [
  {
    label: "Coupe/Coiffage",
    price: "15€",
    duration: "20-25 min",
    details: "Coupe sur-mesure, contours et produits de finitions inclus",
  },
  {
    label: "Coupe/Coiffage/Barbe",
    price: "20€",
    duration: "25-30 min",
    details: "Taille de barbe, serviette chaude, huile de barbe et baume à barbe",
  },
];

export default function PriceSection() {
  return (
    <section
      className="relative overflow-hidden px-6 pb-20 pt-24 text-center"
      style={{ backgroundColor: INK }}
    >
      <Image
        src="/images/prestations-bg.jpg"
        alt=""
        fill
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: "50% 30%" }}
      />
      {/* Opaque black film so the pricing stays fully legible over the photo */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(6,5,4,0.82)" }}
      />

      <div className="relative">
        <p
          className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: GOLD }}
        >
          Tarifs
        </p>
        <h2
          className="mt-3 text-4xl leading-none text-white sm:text-5xl"
          style={{ fontFamily: "var(--font-bebas)" }}
        >
          Nos prestations
        </h2>

        <div className="mx-auto mt-12 max-w-sm space-y-6 text-left">
          {PRICES.map(({ label, duration, price, details }) => (
            <div key={label}>
              <div className="flex items-baseline gap-3">
                <span className="whitespace-nowrap text-lg font-medium text-white">
                  {label}
                </span>
                <span
                  aria-hidden
                  className="h-px flex-1"
                  style={{
                    backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.25) 1px, transparent 1px)",
                    backgroundSize: "6px 1px",
                    backgroundRepeat: "repeat-x",
                  }}
                />
                <span className="text-lg font-semibold" style={{ color: GOLD }}>
                  {price}
                </span>
                <span className="w-16 shrink-0 text-right text-xs text-white/40">
                  {duration}
                </span>
              </div>
              <p className="mt-1 text-sm text-white/50">{details}</p>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 flex max-w-sm items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left">
          <Users className="mt-0.5 h-4 w-4 shrink-0" style={{ color: GOLD }} />
          <p className="text-sm text-white/50">
            Tu viens accompagné(e) ? Réserve 2 créneaux consécutifs directement depuis le formulaire.
          </p>
        </div>

        <Link
          href="/book"
          className="mt-10 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-wider text-black transition-transform active:scale-95"
          style={{ backgroundColor: GOLD }}
        >
          Réserver maintenant
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-6 text-sm text-white/50">
          Contacte-moi sur Snapchat —{" "}
          <span className="font-medium text-white/80">@i-ftyyy08</span>
        </p>
      </div>
    </section>
  );
}
