from datetime import datetime, timezone
from typing import Any

import httpx

# Fallback rates (INR per gram, 24K) when external API is unavailable
FALLBACK_RATES: dict[str, float] = {
    "24k": 7850.0,
    "22k": 7195.0,
    "18k": 5887.0,
    "14k": 4580.0,
}


async def fetch_live_gold_rates() -> dict[str, Any]:
    """Fetch gold rates; falls back to static India-market estimates."""
    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            # metals.live provides free JSON gold spot (USD/oz); we convert for demo
            response = await client.get(
                "https://api.metals.live/v1/spot/gold",
                headers={"Accept": "application/json"},
            )
            if response.status_code == 200:
                data = response.json()
                usd_per_oz = float(data[0]["price"]) if isinstance(data, list) else float(data.get("price", 0))
                inr_per_gram_24k = round((usd_per_oz / 31.1035) * 83.5, 2)
                return {
                    "source": "metals.live",
                    "currency": "INR",
                    "unit": "per_gram",
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "rates": {
                        "24k": inr_per_gram_24k,
                        "22k": round(inr_per_gram_24k * 22 / 24, 2),
                        "18k": round(inr_per_gram_24k * 18 / 24, 2),
                        "14k": round(inr_per_gram_24k * 14 / 24, 2),
                    },
                }
    except (httpx.HTTPError, ValueError, KeyError, IndexError):
        pass

    return {
        "source": "fallback",
        "currency": "INR",
        "unit": "per_gram",
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "rates": FALLBACK_RATES,
    }
