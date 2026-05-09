_model = None
_load_error = None


def _get_model():
    global _model, _load_error
    if _model is not None or _load_error is not None:
        return _model
    try:
        from sentence_transformers import SentenceTransformer

        _model = SentenceTransformer("all-MiniLM-L6-v2")
    except Exception as exc:
        _load_error = str(exc)
        print(f"[similarity] WARNING: SentenceTransformer unavailable: {exc}")
        print("[similarity] Duplicate detection disabled; all submissions will be accepted.")
    return _model


def find_similarity(new_text: str, existing_texts) -> float:
    """
    Returns max cosine similarity between new_text and existing_texts.
    Returns 0.0 if the local model cannot be loaded.
    """
    existing = list(existing_texts)
    if not new_text or not existing:
        return 0.0

    model = _get_model()
    if model is None:
        return 0.0

    try:
        import torch
        from sentence_transformers import util

        new_emb = model.encode(new_text, convert_to_tensor=True)
        exist_emb = model.encode(existing, convert_to_tensor=True)
        scores = util.cos_sim(new_emb, exist_emb)
        return torch.max(scores).item()
    except Exception as exc:
        print(f"[similarity] Similarity computation error: {exc}")
        return 0.0
