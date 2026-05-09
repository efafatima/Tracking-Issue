

# complaints/severity_score.py

import re

# ------------------------------
# Weighted keywords for urgency
# ------------------------------
URGENT_WORDS = {
    "urgent": 2,
    "immediately": 3,
    "danger": 4,
    "harassment": 4,
    "safety": 4,
    "exam": 3,
    "deadline": 3,
    "not working": 2,
    "broken": 2,
    "failure": 2,
    "critical": 3,
    "problem": 1,
    "issue": 1
}

# ------------------------------
# Optional negative sentiment words (for future use)
# ------------------------------
NEGATIVE_WORDS = [
    "frustrated", "angry", "disappointed", "upset"
]

# ------------------------------
# Function: Clean text
# ------------------------------
def clean_text(text):
    """
    Lowercase, remove special characters, keep alphanumeric and spaces
    """
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", "", text)
    return text

# ------------------------------
# Function: Get severity
# ------------------------------
def get_severity(text):
    """
    Calculate severity score based on weighted keywords.
    Returns: 'Low', 'Medium', 'High'
    """
    text = clean_text(text)
    score = 0

    # --------------------------
    # Count weighted urgent words
    # --------------------------
    for word, weight in URGENT_WORDS.items():
        if word in text:
            score += weight

    # --------------------------
    # Optional: Penalize weak words (future use)
    # --------------------------
    for word in NEGATIVE_WORDS:
        if word in text:
            score += 1  # add small weight

    # --------------------------
    # Normalize / categorize
    # --------------------------
    if score >= 7:
        return "High"
    elif score >= 4:
        return "Medium"
    else:
        return "Low"

# ------------------------------
# Function: Get numerical score (optional for API)
# ------------------------------
def get_severity_score(text):
    """
    Returns numeric score (helpful for analytics)
    """
    text = clean_text(text)
    score = sum([URGENT_WORDS.get(word, 0) for word in URGENT_WORDS if word in text])
    return score
