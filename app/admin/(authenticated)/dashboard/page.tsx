"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, Clock, TrendingUp, Euro, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { SERVICES, type Service } from "@/types";

interface PeriodStats {
  totalSlots: number;
  bookedSlots: number;
  revenue: number;
  byService: Record<Service, { count: number; revenue: number }>;
}

interface Stats {
  week: PeriodStats;
  month: PeriodStats;
  year: PeriodStats;
}

function fillRate(stats: PeriodStats): string {
  if (stats.totalSlots === 0) return "0";
  return Math.round((stats.bookedSlots / stats.totalSlots) * 100).toString();
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          setStats(await res.json());
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (isLoading) {
    return <p className="text-center text-sm text-muted-foreground">Chargement...</p>;
  }

  const periods = [
    { label: "Semaine", key: "week" as const },
    { label: "Mois", key: "month" as const },
    { label: "Année", key: "year" as const },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold">Dashboard</h1>

      {/* Accès rapides */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Accès rapides</p>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/admin/slots"
            className="rounded-xl border border-border p-5 transition-all hover:border-foreground/50"
          >
            <div className="flex items-center gap-2">
              <Clock className="size-4" />
              <span className="text-sm font-semibold">Définir mes créneaux</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stats ? `${stats.week.totalSlots} créneaux cette semaine` : "Gérer les disponibilités"}
            </p>
          </Link>

          <Link
            href="/admin/bookings"
            className="rounded-xl border border-border p-5 transition-all hover:border-foreground/50"
          >
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span className="text-sm font-semibold">RDV</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {stats ? `${stats.week.bookedSlots} réservation${stats.week.bookedSlots > 1 ? "s" : ""} cette semaine` : "Voir les réservations"}
            </p>
          </Link>
        </div>
      </div>

      {/* Taux de remplissage */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <TrendingUp className="size-4" />
          Taux de remplissage
        </div>
        <div className="grid grid-cols-3 gap-3">
          {periods.map(({ label, key }) => {
            const data = stats?.[key];
            const rate = data ? fillRate(data) : "0";
            return (
              <div key={key} className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{rate}%</p>
                {data && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {data.bookedSlots}/{data.totalSlots} créneaux
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Revenus */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Euro className="size-4" />
          Revenus
        </div>
        <div className="grid grid-cols-3 gap-3">
          {periods.map(({ label, key }) => {
            const data = stats?.[key];
            return (
              <div key={key} className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-2xl font-bold">{data?.revenue ?? 0}€</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prestations */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Scissors className="size-4" />
          Prestations
        </div>
        <div className="grid grid-cols-3 gap-3">
          {periods.map(({ label, key }) => {
            const data = stats?.[key];
            return (
              <div key={key} className="rounded-xl border border-border p-4">
                <p className="text-xs text-muted-foreground">{label}</p>
                <div className="mt-2 space-y-2">
                  {(Object.keys(SERVICES) as Service[]).map((service) => {
                    const serviceData = data?.byService[service];
                    return (
                      <div key={service} className="flex items-center justify-between gap-2">
                        <span className="text-xs text-muted-foreground">
                          {SERVICES[service].label}
                        </span>
                        <span className="text-sm font-medium">
                          {serviceData?.count ?? 0} · {serviceData?.revenue ?? 0}€
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
