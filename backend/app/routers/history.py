from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import VerificationRecord

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
def list_history(
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=200),
    offset: int = Query(default=0, ge=0),
):
    rows = db.scalars(
        select(VerificationRecord)
        .order_by(VerificationRecord.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    return {
        "items": [
            {
                "id": r.id,
                "item_type": r.item_type,
                "claimed_karat": r.claimed_karat,
                "weight_grams": r.weight_grams,
                "has_hallmark": r.has_hallmark,
                "hallmark_code": r.hallmark_code,
                "seller": r.seller,
                "verdict": r.verdict,
                "confidence": r.confidence,
                "karat_estimate": r.karat_estimate,
                "summary": r.summary,
                "bis_valid": r.bis_valid,
                "estimated_value_inr": r.estimated_value_inr,
                "created_at": r.created_at.isoformat(),
            }
            for r in rows
        ],
        "count": len(rows),
        "offset": offset,
        "limit": limit,
    }
