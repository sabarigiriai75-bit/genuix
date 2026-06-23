// Browser requests go through Next.js rewrites (same origin, no CORS issues).
// Server-side fetches use the direct backend URL.
const API_BASE =
  typeof window !== "undefined" ? "" : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000");

export type GoldRates = {
  source: string;
  currency: string;
  unit: string;
  updated_at: string;
  rates: Record<string, number>;
};

export type VerifyInput = {
  item_type: string;
  claimed_karat: string;
  weight_grams: number;
  has_hallmark: boolean;
  hallmark_code: string;
  description: string;
  seller: string;
};

export type BisCheck = {
  valid: boolean;
  claimed_karat: string;
  expected_fineness: string | null;
  detected_fineness: string[];
  code_detected: boolean;
  notes: string[];
};

export type VerifyResult = {
  verdict: "verified" | "suspicious" | "rejected";
  confidence: number;
  karat_estimate: string;
  summary: string;
  findings: string[];
  recommendations: string[];
  mode?: string;
};

export type HistoryItem = {
  id: number;
  item_type: string;
  claimed_karat: string;
  weight_grams: number;
  has_hallmark: boolean;
  hallmark_code: string;
  seller: string;
  verdict: string;
  confidence: number;
  karat_estimate: string;
  summary: string;
  bis_valid: boolean;
  estimated_value_inr: number;
  created_at: string;
};

export type DashboardStats = {
  totals: {
    verifications: number;
    verified: number;
    suspicious: number;
    rejected: number;
  };
  gold_22k_inr: number;
  recent: Array<{
    id: number;
    item_type: string;
    claimed_karat: string;
    weight_grams: number;
    verdict: string;
    confidence: number;
    estimated_value_inr: number;
    created_at: string;
  }>;
};

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail ?? body.message ?? detail;
    } catch {
      /* ignore */
    }
    throw new Error(typeof detail === "string" ? detail : "Request failed");
  }
  return res.json();
}

export async function fetchGoldRates(): Promise<GoldRates> {
  return apiFetch("/api/gold/rates", { cache: "no-store" });
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  return apiFetch("/api/dashboard/stats", { cache: "no-store" });
}

export async function fetchHistory(): Promise<{ items: HistoryItem[] }> {
  return apiFetch("/api/history", { cache: "no-store" });
}

export async function verifyJewelry(input: VerifyInput): Promise<{
  ok: boolean;
  id: number;
  bis_check: BisCheck;
  estimated_value_inr: number;
  result: VerifyResult;
}> {
  return apiFetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}
