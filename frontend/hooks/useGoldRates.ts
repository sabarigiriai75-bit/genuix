import { useState, useEffect } from "react";
import useSWR from "swr";
import type { GoldRatesResponse } from "@/services/goldRates";

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch gold rates");
  return res.json();
};

export function useGoldRates(country: string) {
  const [debouncedCountry, setDebouncedCountry] = useState(country);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCountry(country);
    }, 300);
    return () => clearTimeout(handler);
  }, [country]);

  const { data, error, isLoading, isValidating } = useSWR<GoldRatesResponse>(
    `/api/gold-rates?country=${encodeURIComponent(debouncedCountry)}`,
    fetcher,
    {
      // 6 hours — matches the server-side cache so we don't waste API calls
      dedupingInterval: 6 * 60 * 60 * 1000,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Still refresh once per hour client-side as a backstop
      refreshInterval: 60 * 60 * 1000,
      errorRetryCount: 2,
      keepPreviousData: true,
    }
  );

  return {
    rates: data ?? null,
    error: error
      ? "Unable to fetch rates. Showing last known values."
      : null,
    isLoading: isLoading && !data,
    isValidating,
  };
}
