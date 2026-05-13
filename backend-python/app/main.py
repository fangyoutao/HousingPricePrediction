from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from app.schemas import (
    HouseFeatures,
    PredictRequest,
    PredictResponse,
    PredictHistoryRecord,
    ModelInfoResponse,
)
from app.services import predict_via_model_api, get_model_info_from_api

# In-memory history store
_history: list = []
_history_counter: int = 0


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title="Property Value Estimator API",
    description="Backend service for the Property Value Estimator app. Proxies predictions to the ML model API.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _features_to_list(f: HouseFeatures) -> list:
    return [
        f.square_footage,
        f.bedrooms,
        f.bathrooms,
        f.year_built,
        f.lot_size,
        f.distance_to_city_center,
        f.school_rating,
    ]


@app.post("/predict", response_model=PredictResponse, tags=["Prediction"])
async def predict(req: PredictRequest):
    global _history_counter
    try:
        price = await predict_via_model_api(_features_to_list(req.features))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model API error: {str(e)}")

    _history_counter += 1
    _history.append(
        PredictHistoryRecord(
            id=_history_counter,
            features=req.features,
            predicted_price=round(price, 2),
            created_at=datetime.now(timezone.utc),
        )
    )

    return PredictResponse(predicted_price=round(price, 2))


@app.get("/history", response_model=list[PredictHistoryRecord], tags=["History"])
async def get_history():
    return list(reversed(_history[-50:]))


@app.get("/model-info", response_model=ModelInfoResponse, tags=["Model"])
async def model_info():
    try:
        info = await get_model_info_from_api()
        return info
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Model API error: {str(e)}")
