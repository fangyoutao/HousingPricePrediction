import os
import httpx

MODEL_API_BASE = os.environ.get("MODEL_API_BASE", "http://localhost:8000")

_client: httpx.AsyncClient | None = None


def get_client() -> httpx.AsyncClient:
    global _client
    if _client is None or _client.is_closed:
        _client = httpx.AsyncClient(base_url=MODEL_API_BASE, timeout=30.0)
    return _client


async def close_client() -> None:
    global _client
    if _client and not _client.is_closed:
        await _client.aclose()
        _client = None


async def predict_via_model_api(features: dict) -> float:
    resp = await get_client().post("/predict", json={"features": features})
    resp.raise_for_status()
    return resp.json()["predicted_price"]


async def predict_batch_via_model_api(features_list: list[dict]) -> list[float]:
    resp = await get_client().post("/predict/batch", json={"features": features_list})
    resp.raise_for_status()
    return [p["predicted_price"] for p in resp.json()["predictions"]]


async def get_model_info_from_api() -> dict:
    resp = await get_client().get("/model-info")
    resp.raise_for_status()
    return resp.json()
