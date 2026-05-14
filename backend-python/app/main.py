import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.schemas import (
    HouseFeatures,
    PredictRequest,
    PredictResponse,
    PredictHistoryRecord,
    ModelInfoResponse,
)
from app.services import predict_via_model_api, get_model_info_from_api, close_client
from app import db

ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await db.init_db()
    yield
    await close_client()


app = FastAPI(
    title="Property Value Estimator API",
    description="Backend service for the Property Value Estimator app. Proxies predictions to the ML model API.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _features_to_dict(f: HouseFeatures) -> dict:
    return f.model_dump()


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict(req: PredictRequest):
    features_dict = _features_to_dict(req.features)
    try:
        price = await predict_via_model_api(features_dict)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model API error: {str(e)}")

    price = round(price, 2)
    await db.save_prediction(features_dict, price)
    return PredictResponse(predicted_price=price)


@app.get("/history", response_model=list[PredictHistoryRecord], tags=["History"])
async def get_history():
    rows = await db.get_history(limit=50)
    return [
        PredictHistoryRecord(
            id=r["id"],
            features=HouseFeatures(**r["features"]),
            predicted_price=r["predicted_price"],
            created_at=r["created_at"],
        )
        for r in rows
    ]


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def model_info():
    try:
        info = await get_model_info_from_api()
        return info
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model API error: {str(e)}")
