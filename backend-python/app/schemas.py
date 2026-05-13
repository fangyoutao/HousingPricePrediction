from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class HouseFeatures(BaseModel):
    square_footage: float = Field(..., ge=100, le=10000)
    bedrooms: int = Field(..., ge=1, le=10)
    bathrooms: float = Field(..., ge=0.5, le=10)
    year_built: int = Field(..., ge=1800, le=2030)
    lot_size: float = Field(..., ge=100, le=100000)
    distance_to_city_center: float = Field(..., ge=0, le=100)
    school_rating: float = Field(..., ge=0, le=10)


class PredictRequest(BaseModel):
    features: HouseFeatures


class PredictResponse(BaseModel):
    predicted_price: float
    currency: str = "USD"


class PredictHistoryRecord(BaseModel):
    id: int
    features: HouseFeatures
    predicted_price: float
    created_at: datetime


class ModelInfoResponse(BaseModel):
    coefficients: dict
    intercept: float
    metrics: dict
    features: list[str]
