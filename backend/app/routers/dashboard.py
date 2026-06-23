from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import VerificationRecord
from app.services.gold_rate_service import fetch_live_gold_rates

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats")
async def dashboard_stats(db: Session = Depends(get_db)):
    total = db.scalar(select(func.count()).select_from(VerificationRecord)) or 0
    verified = (
        db.scalar(
            select(func.count()).select_from(VerificationRecord).where(VerificationRecord.verdict == "verified")
        )
        or 0
    )
    suspicious = (
        db.scalar(
            select(func.count())
            .select_from(VerificationRecord)
            .where(VerificationRecord.verdict == "suspicious")
        )
        or 0
    )
    rejected = (
        db.scalar(
            select(func.count()).select_from(VerificationRecord).where(VerificationRecord.verdict == "rejected")
        )
        or 0
    )

    recent = db.scalars(
        select(VerificationRecord).order_by(VerificationRecord.created_at.desc()).limit(5)
    ).all()

    rates = await fetch_live_gold_rates()
    rate_22k = rates["rates"].get("22k", 0)

    return {
        "totals": {
            "verifications": total,
            "verified": verified,
            "suspicious": suspicious,
            "rejected": rejected,
        },
        "gold_22k_inr": rate_22k,
        "recent": [
            {
                "id": r.id,
                "item_type": r.item_type,
                "claimed_karat": r.claimed_karat,
                "weight_grams": r.weight_grams,
                "verdict": r.verdict,
                "confidence": r.confidence,
                "estimated_value_inr": r.estimated_value_inr,
                "created_at": r.created_at.isoformat(),
            }
            for r in recent
        ],
    }
