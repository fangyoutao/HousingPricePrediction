"""
FastAPI application for Housing Price Prediction.
"""
from fastapi import FastAPI, HTTPException
from contextlib import asynccontextmanager

import logging

from app.schemas import (
    PredictRequest,
    PredictResponse,
    BatchPredictRequest,
    BatchPredictResponse,
    ModelInfoResponse,
    HealthResponse,
)
from app import model

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    model.load_model()
    yield


app = FastAPI(
    title="Housing Price Prediction API",
    description="Predict housing prices based on property features using a linear regression model.",
    version="1.0.0",
    lifespan=lifespan,
)


def _features_to_list(f):
    return model.features_from_dict(f)


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health():
    return HealthResponse(
        status="ok",
        model_loaded=model.is_loaded(),
    )


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict_single(req: PredictRequest):
    try:
        price = model.predict(_features_to_list(req.features))
        return PredictResponse(predicted_price=round(price, 2))
    except Exception:
        logger.exception("Prediction failed for features: %s", req.features)
        raise HTTPException(status_code=500, detail="Prediction failed")


@app.post("/predict/batch", response_model=BatchPredictResponse, tags=["Prediction"])
async def predict_batch(req: BatchPredictRequest):
    try:
        batch = [_features_to_list(f) for f in req.features]
        prices = model.predict_batch(batch)
        return BatchPredictResponse(
            predictions=[PredictResponse(predicted_price=round(p, 2)) for p in prices]
        )
    except Exception:
        logger.exception("Batch prediction failed for %d samples", len(req.features))
        raise HTTPException(status_code=500, detail="Batch prediction failed")


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def model_info():
    return model.model_info()
