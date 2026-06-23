from fastapi import APIRouter

from app.services.gold_rate_service import fetch_live_gold_rates

router = APIRouter(prefix="/api/gold", tags=["gold"])


@router.get("/rates")
async def get_gold_rates():
    return await fetch_live_gold_rates()
