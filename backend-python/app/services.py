import asyncio
import requests

MODEL_API_BASE = "http://localhost:8000"


async def predict_via_model_api(features: list) -> float:
    """Call the Task 1 model API to get a prediction."""
    def _sync():
        resp = requests.post(
            f"{MODEL_API_BASE}/predict",
            json={
                "features": {
                    "square_footage": features[0],
                    "bedrooms": features[1],
                    "bathrooms": features[2],
                    "year_built": features[3],
                    "lot_size": features[4],
                    "distance_to_city_center": features[5],
                    "school_rating": features[6],
                }
            },
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()["predicted_price"]

    return await asyncio.to_thread(_sync)


async def get_model_info_from_api() -> dict:
    """Fetch model info from the Task 1 model API."""
    def _sync():
        resp = requests.get(f"{MODEL_API_BASE}/model-info", timeout=10)
        resp.raise_for_status()
        return resp.json()

    return await asyncio.to_thread(_sync)
