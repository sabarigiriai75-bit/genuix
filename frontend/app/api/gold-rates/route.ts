import { NextResponse } from "next/server";
import { getGoldRatesForCountry } from "@/services/goldRates";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country") || "India";

  const result = await getGoldRatesForCountry(country);
  return NextResponse.json(result);
}
