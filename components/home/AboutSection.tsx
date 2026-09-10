import { Clock, Sparkles, ShieldCheck } from "lucide-react";
import TornEdge from "./TornEdge";
import { CREAM, GOLD, GOLD_DEEP, INK } from "@/lib/home-theme";

const VALUES = [
  {
    icon: Clock,
    title: "Ponctuel & rapide",
    description: "Zéro attente, zéro retard. Tu viens à l'heure fixée, tu passes directement au fauteuil.",
  },
  {
    icon: Sparkles,
    title: "Plus qu'une coupe",
    description: "Profite d'un moment privilégié dans un espace dédié. Je prends le temps de t'écouter pour un résultat impeccable.",
  },
  {
    icon: ShieldCheck,
    title: "Matériel propre & désinfecté",
    description: "Hygiène irréprochable du premier au dernier geste. Tu t'assois dans un fauteuil 100% nickel.",
  },
];

export default function AboutSection() {
  return (
    <section
      className="relative px-6 pb-24 pt-20 text-center"
      style={{ backgroundColor: CREAM }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-[0.25em]"
        style={{ color: GOLD_DEEP }}
      >
        L&apos;expérience IB
      </p>
      <h2
        className="mt-3 text-4xl leading-none sm:text-5xl"
        style={{ fontFamily: "var(--font-bebas)", color: INK }}
      >
        Ce que tu vas vivre
      </h2>

      <div className="mx-auto mt-12 grid max-w-lg gap-4">
        {VALUES.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-2xl border border-black/10 bg-white/60 p-5 text-left"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
              style={{ border: `1.5px solid ${GOLD}`, color: GOLD_DEEP }}
            >
              <Icon className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div>
              <p
                className="text-sm font-semibold uppercase tracking-wide"
                style={{ color: INK }}
              >
                {title}
              </p>
              <p className="mt-1 text-sm text-black/60">{description}</p>
            </div>
          </div>
        ))}
      </div>

      <TornEdge fill={INK} />
    </section>
  );
}
