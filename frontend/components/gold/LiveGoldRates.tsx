import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGoldRate } from "@/services/goldRates";

interface LiveGoldRatesProps {
  rates: {
    "24K": number;
    "22K": number;
    "18K": number;
    "14K": number;
  } | null;
  loading: boolean;
  country: string;
  error?: string | null;
}

export function LiveGoldRates({ rates, loading, country, error }: LiveGoldRatesProps) {
  const KARAT_ORDER = ["24K", "22K", "18K", "14K"] as const;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {KARAT_ORDER.map((karat) => {
        const val = rates ? rates[karat] : 0;
        return (
          <Card key={karat}>
            <CardHeader>
              <CardDescription>{karat} · per gram</CardDescription>
              <CardTitle className="text-3xl text-ivory">
                {loading
                  ? "—"
                  : rates
                  ? formatGoldRate(val, country)
                  : "—"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <span className="text-xs text-ivory/40 animate-pulse">
                  Fetching live gold rates…
                </span>
              ) : error ? (
                <span className="text-xs text-red-300/70">
                  Last known value
                </span>
              ) : (
                <Badge variant="default">
                  {karat === "22K" ? "India standard" : "Spot derived"}
                </Badge>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
