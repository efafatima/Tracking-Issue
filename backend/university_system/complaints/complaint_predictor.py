import joblib
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_MODEL_PATH = os.path.join(BASE_DIR, "ml_model", "complaint_model.pkl")
_VEC_PATH   = os.path.join(BASE_DIR, "ml_model", "vectorizer.pkl")

_model      = None
_vectorizer = None
_load_error = None

try:
    _model      = joblib.load(_MODEL_PATH)
    _vectorizer = joblib.load(_VEC_PATH)
except Exception as e:
    _load_error = str(e)
    print(f"[complaint_predictor] WARNING: Could not load ML model: {e}")
    print("[complaint_predictor] Category prediction will return 'General' as fallback.")


def predict_category(text: str) -> str:
    if _model is None or _vectorizer is None:
        return "General"
    try:
        vec = _vectorizer.transform([text])
        return _model.predict(vec)[0]
    except Exception as e:
        print(f"[complaint_predictor] Prediction error: {e}")
        return "General"
