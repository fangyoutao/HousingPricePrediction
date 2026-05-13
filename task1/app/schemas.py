from pydantic import BaseModel, Field
from typing import List


class HouseFeatures(BaseModel):
    square_footage: float = Field(..., description="Total square footage of the property")
    bedrooms: int = Field(..., ge=1, le=10, description="Number of bedrooms")
    bathrooms: float = Field(..., ge=0.5, le=10, description="Number of bathrooms")
    year_built: int = Field(..., ge=1800, le=2030, description="Year the property was built")
    lot_size: float = Field(..., description="Lot size in square feet")
    distance_to_city_center: float = Field(..., ge=0, description="Distance to city center in miles")
    school_rating: float = Field(..., ge=0, le=10, description="Local school rating (0-10)")


class PredictRequest(BaseModel):
    features: HouseFeatures


class BatchPredictRequest(BaseModel):
    features: List[HouseFeatures]


class PredictResponse(BaseModel):
    predicted_price: float
    currency: str = "USD"


class BatchPredictResponse(BaseModel):
    predictions: List[PredictResponse]


class ModelInfoResponse(BaseModel):
    coefficients: dict
    intercept: float
    metrics: dict
    features: list[str]


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
