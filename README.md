# Housing Price Prediction — Full-Stack System

A full-stack property valuation and market analysis platform consisting of a machine learning pricing model, two backend services, and a Next.js web portal.

## Architecture

```
┌─────────────────────────────────────────┐
│         portal  (Next.js :3000)         │
│   Property Estimator | Market Analysis  │
└──────────────┬──────────────┬───────────┘
               │              │
               ▼              ▼
┌──────────────────┐  ┌────────────────────┐
│  backend-python  │  │   backend-java     │
│  BFF / History   │  │  Market Analysis   │
│  FastAPI  :8001  │  │  Spring Boot :8080  │
└────────┬─────────┘  └────────┬───────────┘
         │                     │
         └──────────┬──────────┘
                    ▼
         ┌──────────────────┐
         │     task1        │
         │   ML Model API   │
         │  FastAPI  :8000  │
         └──────────────────┘
```

| Service | Tech | Port | Responsibility |
|---|---|---|---|
| `task1` | Python / FastAPI / scikit-learn | 8000 | Ridge regression model, `/predict`, `/predict/batch`, `/model-info` |
| `backend-python` | Python / FastAPI / SQLite | 8001 | BFF proxy, prediction history (SQLite), CORS for portal |
| `backend-java` | Java 21 / Spring Boot | 8080 | Market stats, property filtering, what-if analysis (calls task1) |
| `portal` | Next.js 16 / Tailwind CSS | 3000 | Property Estimator + Market Analysis dashboard |

---

## Quick Start (local)

### Prerequisites

- Python 3.12+
- Java 21 + Maven
- Node.js 20+

### 1 — Train the model

```bash
cd task1
pip install -r requirements.txt

# Optional: override data path via env var
# export TRAIN_DATA_PATH=/path/to/House\ Price\ Dataset.csv

python train.py
# Produces: app/model.pkl
```

### 2 — Start task1 (ML Model API)

```bash
cd task1
uvicorn app.main:app --port 8000
```

Swagger UI: http://localhost:8000/docs

### 3 — Start backend-python (BFF)

```bash
cd backend-python
pip install -r requirements.txt

# Optional env vars:
# MODEL_API_BASE=http://localhost:8000
# DB_PATH=./app/history.db
# ALLOWED_ORIGINS=http://localhost:3000

uvicorn app.main:app --port 8001
```

Swagger UI: http://localhost:8001/docs

### 4 — Start backend-java (Market Analysis)

```bash
cd backend-java
mvn spring-boot:run

# Optional env var:
# MODEL_API_BASE_URL=http://localhost:8000
```

API base: http://localhost:8080/api

### 5 — Start the portal

```bash
cd portal
npm install

# Copy and adjust environment variables
cp .env.example .env.local

npm run dev
```

Open http://localhost:3000

---

## Docker (per service)

Each service ships its own `Dockerfile`. Example:

```bash
# task1
docker build -t housing-model ./task1
docker run -p 8000:8000 housing-model

# backend-python
docker build -t housing-bff ./backend-python
docker run -p 8001:8001 \
  -e MODEL_API_BASE=http://host.docker.internal:8000 \
  -e DB_PATH=/data/history.db \
  -v $(pwd)/data:/data \
  housing-bff

# backend-java
docker build -t housing-market ./backend-java
docker run -p 8080:8080 \
  -e MODEL_API_BASE_URL=http://host.docker.internal:8000 \
  housing-market
```

---

## Environment Variables

### task1

| Variable | Default | Description |
|---|---|---|
| `TRAIN_DATA_PATH` | `../../House Price Dataset.csv` | Path to training CSV (used by `train.py`) |

### backend-python

| Variable | Default | Description |
|---|---|---|
| `MODEL_API_BASE` | `http://localhost:8000` | task1 ML API base URL |
| `DB_PATH` | `app/history.db` | SQLite database file path |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allowed origins |

### backend-java

| Variable | Default | Description |
|---|---|---|
| `MODEL_API_BASE_URL` | `http://localhost:8000` | task1 ML API base URL for what-if calls |

### portal

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_PYTHON_API` | `http://localhost:8001` | backend-python base URL |
| `NEXT_PUBLIC_JAVA_API` | `http://localhost:8080` | backend-java base URL |

---

## API Reference

### task1 — ML Model API

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness check, confirms model is loaded |
| `POST` | `/predict` | Single property price prediction |
| `POST` | `/predict/batch` | Batch predictions |
| `GET` | `/model-info` | Model coefficients, intercept, and training metrics |

**Predict request body:**
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

### backend-python — BFF

| Method | Path | Description |
|---|---|---|
| `POST` | `/predict` | Proxy to task1, saves result to SQLite history |
| `GET` | `/history` | Last 50 predictions (persisted across restarts) |
| `GET` | `/model-info` | Proxy to task1 model info |

### backend-java — Market Analysis

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stats` | Aggregate market statistics |
| `GET` | `/api/properties` | Property list with optional filters |
| `POST` | `/api/what-if` | Price prediction via ML model |

**Properties filter params:** `minPrice`, `maxPrice`, `minBedrooms`, `maxBedrooms`

---

## Model

The model is a **Ridge regression** (`alpha=1.0`) trained with `StandardScaler` on 50 properties.

**Features used:**

| Feature | Description |
|---|---|
| `square_footage` | Total interior area (sq ft) |
| `bedrooms` | Number of bedrooms |
| `bathrooms` | Number of bathrooms |
| `year_built` | Construction year |
| `lot_size` | Lot area (sq ft) |
| `distance_to_city_center` | Distance in miles |
| `school_rating` | Local school rating (0–10) |

**Training metrics** (approximate, 80/20 split):

| Metric | Value |
|---|---|
| R² | ~0.99 |
| MAE | ~$3,000 |
| RMSE | ~$4,000 |

---

## Project Structure

```
HousingPricePrediction/
├── task1/                        # ML model service
│   ├── train.py                  # Model training script
│   ├── app/
│   │   ├── main.py
│   │   ├── model.py              # Model loader & inference
│   │   ├── schemas.py
│   │   └── model.pkl             # Generated by train.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend-python/               # BFF / history service
│   ├── app/
│   │   ├── main.py
│   │   ├── services.py           # Async httpx client
│   │   ├── db.py                 # SQLite persistence
│   │   └── schemas.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── backend-java/                 # Market analysis service
│   ├── src/main/java/com/hsbc/market/
│   │   ├── controller/MarketController.java
│   │   ├── service/MarketService.java
│   │   ├── model/Property.java
│   │   └── config/
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   └── house_data.csv
│   ├── pom.xml
│   └── Dockerfile
│
└── portal/                       # Next.js frontend
    ├── app/
    │   ├── page.tsx              # Home
    │   ├── estimator/            # Property Value Estimator
    │   └── market-analysis/      # Market Analysis dashboard
    ├── components/               # Shared UI components
    ├── lib/
    │   ├── api.ts                # API client
    │   ├── types.ts
    │   └── translations/         # i18n (en / zh)
    ├── .env.example
    └── package.json
```
