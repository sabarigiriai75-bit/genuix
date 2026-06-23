from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    item_type: Mapped[str] = mapped_column(String(50))
    claimed_karat: Mapped[str] = mapped_column(String(10))
    weight_grams: Mapped[float] = mapped_column(Float)
    has_hallmark: Mapped[bool] = mapped_column(Boolean, default=False)
    hallmark_code: Mapped[str] = mapped_column(String(64), default="")
    seller: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    verdict: Mapped[str] = mapped_column(String(20))
    confidence: Mapped[float] = mapped_column(Float)
    karat_estimate: Mapped[str] = mapped_column(String(10))
    summary: Mapped[str] = mapped_column(Text)
    bis_valid: Mapped[bool] = mapped_column(Boolean, default=False)
    estimated_value_inr: Mapped[float] = mapped_column(Float, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
