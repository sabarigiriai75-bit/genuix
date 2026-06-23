import re
from typing import Any

# BIS fineness marks used on Indian hallmarked gold (parts per thousand)
KARAT_TO_FINENESS: dict[str, str] = {
    "24K": "999",
    "22K": "916",
    "21K": "875",
    "18K": "750",
    "14K": "585",
}

FINENESS_PATTERN = re.compile(r"\b(999|995|916|875|750|585|375)\b")
HALLMARK_CODE_PATTERN = re.compile(r"\b[A-Z]{2,4}\d{4,8}\b", re.IGNORECASE)


def validate_bis_hallmark(claimed_karat: str, hallmark_code: str, description: str) -> dict[str, Any]:
    """Lightweight BIS hallmark checks for Indian market compliance hints."""
    karat = claimed_karat.strip().upper()
    expected_fineness = KARAT_TO_FINENESS.get(karat)
    combined = f"{hallmark_code} {description}".upper()

    found_fineness = FINENESS_PATTERN.findall(combined)
    fineness_match = expected_fineness in found_fineness if expected_fineness and found_fineness else None
    code_match = bool(HALLMARK_CODE_PATTERN.search(hallmark_code or description))

    valid = bool(expected_fineness and (fineness_match or code_match))

    notes: list[str] = []
    if not hallmark_code and not description:
        notes.append("No hallmark code or fineness mark provided.")
    if expected_fineness:
        notes.append(f"Expected BIS fineness for {karat}: {expected_fineness}")
    if found_fineness:
        notes.append(f"Detected fineness marks: {', '.join(found_fineness)}")
    if fineness_match is False:
        notes.append("Fineness mark does not match claimed karat — verify with assayer.")
    if code_match:
        notes.append("Assay centre / jeweller code pattern detected.")

    return {
        "valid": valid,
        "claimed_karat": karat,
        "expected_fineness": expected_fineness,
        "detected_fineness": found_fineness,
        "code_detected": code_match,
        "notes": notes,
    }
