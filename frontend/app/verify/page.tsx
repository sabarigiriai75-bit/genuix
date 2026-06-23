"use client";

import { FormEvent, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { verifyJewelry, type BisCheck, type VerifyResult } from "@/lib/api";
import { formatINR } from "@/lib/utils";

const ITEM_TYPES = ["ring", "chain", "bangle", "earring", "coin", "bar", "other"];

function verdictVariant(v: VerifyResult["verdict"]) {
  if (v === "verified") return "verified" as const;
  if (v === "rejected") return "rejected" as const;
  return "suspicious" as const;
}

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [bisCheck, setBisCheck] = useState<BisCheck | null>(null);
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);
  const [recordId, setRecordId] = useState<number | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setBisCheck(null);
    setEstimatedValue(null);
    setRecordId(null);

    const form = new FormData(e.currentTarget);
    try {
      const response = await verifyJewelry({
        item_type: String(form.get("item_type") ?? "ring"),
        claimed_karat: String(form.get("claimed_karat") ?? "22K"),
        weight_grams: parseFloat(String(form.get("weight_grams") ?? "0")),
        has_hallmark: form.get("has_hallmark") === "on",
        hallmark_code: String(form.get("hallmark_code") ?? ""),
        description: String(form.get("description") ?? ""),
        seller: String(form.get("seller") ?? ""),
      });
      setResult(response.result);
      setBisCheck(response.bis_check);
      setEstimatedValue(response.estimated_value_inr);
      setRecordId(response.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Verification failed";
      setError(
        msg.includes("fetch") || msg.includes("Failed")
          ? "Cannot reach the API. Start the backend: cd backend && uvicorn app.main:app --reload --port 8000"
          : msg,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen genuix-grid">
      <Navbar active="/verify" />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">AI Verification</p>
          <h1 className="font-display text-4xl font-light text-ivory">Verify Jewelry</h1>
          <p className="mt-2 text-ivory/60">BIS hallmark checks + Claude claude-opus-4-8 analysis</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Indian market fields — weight, karat, BIS hallmark</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="item_type">Item type</Label>
                  <select
                    id="item_type"
                    name="item_type"
                    className="flex h-10 w-full rounded-md border border-gold/20 bg-midnight px-3 text-sm text-ivory"
                    defaultValue="ring"
                  >
                    {ITEM_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="claimed_karat">Claimed karat</Label>
                    <Input id="claimed_karat" name="claimed_karat" defaultValue="22K" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight_grams">Weight (grams)</Label>
                    <Input id="weight_grams" name="weight_grams" type="number" step="0.01" min="0.01" defaultValue="8.5" required />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hallmark_code">BIS hallmark code</Label>
                  <Input id="hallmark_code" name="hallmark_code" placeholder="e.g. ABC12345 or fineness 916" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="seller">Seller / shop</Label>
                  <Input id="seller" name="seller" placeholder="Optional" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" name="description" placeholder="Markings, purchase notes, assayer details…" />
                </div>

                <label className="flex items-center gap-3 text-sm text-ivory/80">
                  <input type="checkbox" name="has_hallmark" className="accent-gold" defaultChecked />
                  BIS hallmark present
                </label>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Analyzing…" : "Run Verification"}
                </Button>
                {error && <p className="text-sm text-red-300">{error}</p>}
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Result</CardTitle>
                <CardDescription>Claude assessment and INR value estimate</CardDescription>
              </CardHeader>
              <CardContent>
                {!result && !loading && (
                  <p className="text-sm text-ivory/40">Submit item details to receive an AI verification report.</p>
                )}
                {loading && <p className="text-sm text-gold animate-pulse">Running BIS checks and Claude analysis…</p>}
                {result && (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={verdictVariant(result.verdict)}>{result.verdict}</Badge>
                      <span className="font-mono text-xs text-ivory/50">
                        {Math.round(result.confidence * 100)}% confidence · {result.karat_estimate}
                      </span>
                      {result.mode && (
                        <span className="font-mono text-[10px] uppercase text-ivory/30">{result.mode}</span>
                      )}
                    </div>
                    {estimatedValue != null && (
                      <div className="rounded-lg border border-gold/20 bg-gold/5 p-4">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gold/70">Estimated value</p>
                        <p className="font-display text-2xl text-ivory">{formatINR(estimatedValue)}</p>
                      </div>
                    )}
                    {recordId && (
                      <p className="font-mono text-[10px] text-ivory/30">Saved as verification #{recordId}</p>
                    )}
                    <p className="text-ivory/90">{result.summary}</p>
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-gold/70">Findings</p>
                      <ul className="list-inside list-disc space-y-1 text-sm text-ivory/70">
                        {result.findings.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2 font-mono text-[10px] uppercase tracking-widest text-teal">Recommendations</p>
                      <ul className="list-inside list-disc space-y-1 text-sm text-ivory/70">
                        {result.recommendations.map((r) => (
                          <li key={r}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {bisCheck && (
              <Card>
                <CardHeader>
                  <CardTitle>BIS Hallmark Check</CardTitle>
                  <CardDescription>Automated fineness & code parsing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-ivory/70">
                  <Badge variant={bisCheck.valid ? "verified" : "suspicious"}>
                    {bisCheck.valid ? "Passes checks" : "Review required"}
                  </Badge>
                  <ul className="list-inside list-disc space-y-1">
                    {bisCheck.notes.map((n) => (
                      <li key={n}>{n}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
