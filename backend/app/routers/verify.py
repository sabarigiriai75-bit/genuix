from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import VerificationRecord
from app.services.bis_service import validate_bis_hallmark
from app.services.claude_service import verify_jewelry
from app.services.gold_rate_service import fetch_live_gold_rates

router = APIRouter(prefix="/api/verify", tags=["verify"])


class VerifyRequest(BaseModel):
    item_type: str = Field(..., examples=["ring"])
    claimed_karat: str = Field(..., examples=["22K"])
    weight_grams: float = Field(..., gt=0, examples=[8.5])
    has_hallmark: bool = False
    hallmark_code: str = ""
    description: str = ""
    seller: str = ""


def _estimate_value_inr(weight_grams: float, karat: str, rates: dict[str, float]) -> float:
    key = karat.lower().replace(" ", "")
    if not key.endswith("k"):
        key = f"{key}k"
    rate = rates.get(key) or rates.get("22k", 0)
    return round(weight_grams * rate, 2)


@router.post("")
async def verify_item(body: VerifyRequest, db: Session = Depends(get_db)):
    payload = body.model_dump()
    bis = validate_bis_hallmark(body.claimed_karat, body.hallmark_code, body.description)
    payload["bis_check"] = bis

    result = await verify_jewelry(payload)
    rates_data = await fetch_live_gold_rates()
    estimated_value = _estimate_value_inr(body.weight_grams, body.claimed_karat, rates_data["rates"])

    record = VerificationRecord(
        item_type=body.item_type,
        claimed_karat=body.claimed_karat,
        weight_grams=body.weight_grams,
        has_hallmark=body.has_hallmark,
        hallmark_code=body.hallmark_code,
        seller=body.seller,
        description=body.description,
        verdict=result.get("verdict", "suspicious"),
        confidence=float(result.get("confidence", 0)),
        karat_estimate=str(result.get("karat_estimate", body.claimed_karat)),
        summary=str(result.get("summary", "")),
        bis_valid=bis["valid"],
        estimated_value_inr=estimated_value,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "ok": True,
        "id": record.id,
        "input": payload,
        "bis_check": bis,
        "estimated_value_inr": estimated_value,
        "result": result,
    }
