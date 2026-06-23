"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchHistory, type HistoryItem } from "@/lib/api";
import { formatINR } from "@/lib/utils";

function verdictVariant(v: string) {
  if (v === "verified") return "verified" as const;
  if (v === "rejected") return "rejected" as const;
  return "suspicious" as const;
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory()
      .then((data) => setItems(data.items))
      .catch(() => setError("Could not load history. Start the backend on port 8000."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen genuix-grid">
      <Navbar active="/history" />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">Audit Trail</p>
          <h1 className="font-display text-4xl font-light text-ivory">Verification History</h1>
          <p className="mt-2 text-ivory/60">All verifications stored locally in your Genuix backend.</p>
        </div>

        {loading && <p className="text-gold animate-pulse">Loading history…</p>}
        {error && <p className="text-red-300">{error}</p>}

        {!loading && !error && items.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-ivory/50">
              No verifications yet. Run your first check from the Verify page.
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="capitalize text-ivory">
                    {item.item_type} · {item.claimed_karat}
                  </CardTitle>
                  <CardDescription>
                    {item.weight_grams}g · {new Date(item.created_at).toLocaleString("en-IN")}
                    {item.seller ? ` · ${item.seller}` : ""}
                  </CardDescription>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={verdictVariant(item.verdict)}>{item.verdict}</Badge>
                  {item.bis_valid && <Badge variant="verified">BIS OK</Badge>}
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap justify-between gap-4 text-sm text-ivory/70">
                <p className="max-w-xl">{item.summary}</p>
                <div className="text-right">
                  <p className="font-mono text-[10px] uppercase text-ivory/40">Est. value</p>
                  <p className="text-lg text-gold">{formatINR(item.estimated_value_inr)}</p>
                  <p className="font-mono text-xs text-ivory/40">{Math.round(item.confidence * 100)}% confidence</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
