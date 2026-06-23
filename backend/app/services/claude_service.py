import json
from typing import Any

from anthropic import Anthropic, APIError

from app.config import settings

SYSTEM_PROMPT = """You are Genuix, an expert jewelry authentication assistant for the Indian gold market.
Consider BIS hallmark rules, 22K as the dominant retail standard, and common fraud patterns (under-karat, fake hallmarks).
The payload may include a "bis_check" object from automated hallmark parsing — factor it into your analysis.
Analyze the provided jewelry details and return a JSON object with exactly these keys:
- "verdict": one of "verified", "suspicious", or "rejected"
- "confidence": float 0-1
- "karat_estimate": string like "22K"
- "summary": one sentence overview
- "findings": array of 3-5 short bullet strings
- "recommendations": array of 2-3 actionable strings
Respond with ONLY valid JSON, no markdown fences."""


def _mock_verification(payload: dict[str, Any], reason: str = "") -> dict[str, Any]:
    weight = float(payload.get("weight_grams", 10))
    claimed = str(payload.get("claimed_karat", "22K")).upper()
    has_hallmark = bool(payload.get("has_hallmark", False))
    bis = payload.get("bis_check") or {}

    verdict = "verified" if has_hallmark and bis.get("valid") else "suspicious"
    if has_hallmark and weight > 0 and not bis.get("valid"):
        verdict = "suspicious"
    elif has_hallmark and bis.get("valid"):
        verdict = "verified"

    confidence = 0.82 if verdict == "verified" else 0.58

    findings = [
        f"Claimed karat: {claimed}",
        f"Weight: {weight}g",
        "Hallmark present" if has_hallmark else "No hallmark declared — manual assay recommended",
    ]
    if bis.get("notes"):
        findings.extend(bis["notes"][:2])
    if reason:
        findings.append(f"Claude unavailable — using local analysis ({reason})")
    else:
        findings.append("Demo mode — add valid ANTHROPIC_API_KEY for live Claude analysis")

    return {
        "verdict": verdict,
        "confidence": confidence,
        "karat_estimate": claimed if claimed else "22K",
        "summary": f"Local analysis for {weight}g piece claimed as {claimed}.",
        "findings": findings,
        "recommendations": [
            "Verify BIS hallmark with the official registry",
            "Weigh on a calibrated jeweler's scale",
            "Request XRF assay for high-value pieces",
        ],
        "mode": "mock_fallback" if reason else "mock",
    }


async def verify_jewelry(payload: dict[str, Any]) -> dict[str, Any]:
    if not settings.anthropic_api_key or settings.force_mock_claude:
        return _mock_verification(payload)

    client = Anthropic(api_key=settings.anthropic_api_key)
    user_content = json.dumps(payload, indent=2)

    try:
        message = client.messages.create(
            model=settings.claude_model,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_content}],
        )
    except APIError as exc:
        return _mock_verification(payload, reason=str(exc))

    raw = message.content[0].text if message.content else "{}"
    try:
        result = json.loads(raw)
        result["mode"] = "claude"
        return result
    except json.JSONDecodeError:
        return {
            "verdict": "suspicious",
            "confidence": 0.5,
            "karat_estimate": payload.get("claimed_karat", "unknown"),
            "summary": "Claude returned a non-JSON response.",
            "findings": [raw[:500]],
            "recommendations": ["Retry verification or contact support."],
            "mode": "claude_error",
        }
