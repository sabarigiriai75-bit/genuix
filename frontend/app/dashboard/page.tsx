"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchDashboardStats, type DashboardStats } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import { CountrySelector } from "@/components/gold/CountrySelector";
import { LiveGoldRates } from "@/components/gold/LiveGoldRates";
import { useGoldRates } from "@/hooks/useGoldRates";
import { formatGoldRate } from "@/services/goldRates";

function verdictVariant(v: string) {
  if (v === "verified") return "verified" as const;
  if (v === "rejected") return "rejected" as const;
  return "suspicious" as const;
}

export default function DashboardPage() {
  const [country, setCountry] = useState("India");
  const { rates, error: ratesError, isLoading: ratesLoading } = useGoldRates(country);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats()
      .then((s) => {
        setStats(s);
      })
      .catch(() => setStatsError("Could not reach Genuix API. Start the backend on port 8000."))
      .finally(() => setStatsLoading(false));
  }, []);

  const error = statsError || ratesError;
  const loading = statsLoading;

  return (
    <div className="min-h-screen genuix-grid">
      <Navbar active="/dashboard" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">Gold Intelligence</p>
            <h1 className="font-display text-4xl font-light text-ivory">Dashboard</h1>
          </div>
          <Button href="/verify" variant="outline">
            New Verification
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total checks", value: stats?.totals.verifications },
            { label: "Verified", value: stats?.totals.verified },
            { label: "Suspicious", value: stats?.totals.suspicious },
            { label: "Rejected", value: stats?.totals.rejected },
          ].map((s) => (
            <Card key={s.label}>
              <CardHeader>
                <CardDescription>{s.label}</CardDescription>
                <CardTitle className="text-3xl text-ivory">{loading ? "—" : (s.value ?? 0)}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-gold/70">Gold Spot Rates</h2>
          <CountrySelector value={country} onChange={setCountry} />
        </div>

        <LiveGoldRates
          rates={rates?.rates || null}
          loading={ratesLoading}
          country={country}
          error={ratesError}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Live Gold Feed</CardTitle>
              <CardDescription>
                {ratesLoading
                  ? "Fetching live gold rates…"
                  : rates
                  ? `Source: ${rates.source} · Updated ${new Date(rates.updatedAt).toLocaleString("en-IN")}`
                  : "Waiting for API connection"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ratesError && (
                <p className="text-sm text-red-300 mb-3">{ratesError}</p>
              )}
              {statsError && (
                <p className="text-sm text-red-300 mb-3">{statsError}</p>
              )}
              {rates && (
                <div className="space-y-3">
                  {(["24K", "22K", "18K", "14K"] as const).map((k) => (
                    <div key={k} className="flex items-center justify-between border-b border-gold/10 pb-2 last:border-0">
                      <span className="font-mono text-xs uppercase tracking-widest text-ivory/50">{k}</span>
                      <span className="text-lg text-gold">
                        {formatGoldRate(rates.rates[k], country)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Verifications</CardTitle>
              <CardDescription>Latest from your workspace</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!stats?.recent.length && <p className="text-sm text-ivory/40">No verifications yet.</p>}
              {stats?.recent.map((r) => (
                <div key={r.id} className="border-b border-gold/10 pb-3 last:border-0">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-sm text-ivory">
                      {r.item_type} · {r.claimed_karat}
                    </span>
                    <Badge variant={verdictVariant(r.verdict)}>{r.verdict}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ivory/50">
                    {r.weight_grams}g · {formatINR(r.estimated_value_inr)}
                  </p>
                </div>
              ))}
              <Button href="/history" variant="outline" className="w-full">
                View all history
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
