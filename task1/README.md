# task1 — ML Model API

FastAPI service that trains and serves a Ridge regression model for housing price prediction.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Returns `{"status":"ok","model_loaded":true}` |
| `POST` | `/predict` | Single prediction |
| `POST` | `/predict/batch` | Batch predictions |
| `GET` | `/model-info` | Coefficients, intercept, training metrics |

## Training

```bash
pip install -r requirements.txt

# Override data path if needed
export TRAIN_DATA_PATH=/path/to/House\ Price\ Dataset.csv

python train.py
```

Produces `app/model.pkl`. The script trains a `Ridge(alpha=1.0)` model with `StandardScaler` on all 7 features and prints R², MAE, RMSE.

## Running

```bash
uvicorn app.main:app --port 8000
# Swagger UI: http://localhost:8000/docs
```

## Docker

```bash
docker build -t housing-model .
docker run -p 8000:8000 housing-model
```

> The model file `app/model.pkl` must exist before the container starts. Either commit it or mount it as a volume.

## Request Schema

```json
{
  "features": {
    "square_footage": 2000,
    "bedrooms": 3,
    "bathrooms": 2.0,
    "year_built": 2000,
    "lot_size": 7500,
    "distance_to_city_center": 5.0,
    "school_rating": 8.0
  }
}
```
