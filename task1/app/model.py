"""
Model loader — loads the trained model pickle at startup.
"""
import pickle
import os
import numpy as np
import warnings

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")

_model_payload = None


def load_model():
    global _model_payload
    with open(MODEL_PATH, "rb") as f:
        _model_payload = pickle.load(f)
    return _model_payload


def get_model():
    if _model_payload is None:
        return load_model()
    return _model_payload


def predict(features: list) -> float:
    payload = get_model()
    model = payload["model"]
    scaler = payload.get("scaler")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        arr = np.array(features).reshape(1, -1)
        if scaler:
            arr = scaler.transform(arr)
        return float(model.predict(arr)[0])


def predict_batch(features_batch: list[list]) -> list[float]:
    payload = get_model()
    model = payload["model"]
    scaler = payload.get("scaler")
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        arr = np.array(features_batch)
        if scaler:
            arr = scaler.transform(arr)
        return [float(v) for v in model.predict(arr)]


def model_info() -> dict:
    payload = get_model()
    return {
        "coefficients": payload["coefficients"],
        "intercept": payload["intercept"],
        "metrics": payload["metrics"],
        "features": payload["features"],
    }


def is_loaded() -> bool:
    return _model_payload is not None


def features_from_dict(d) -> list:
    """Extract feature values from a dict-like object using only the model's feature list."""
    payload = get_model()
    trained_features = payload["features"]
    return [getattr(d, f) for f in trained_features]
