# backend-python — Property Value Estimator BFF

FastAPI service that proxies prediction requests to the ML model API and persists prediction history in SQLite.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/predict` | Forward to task1, save result to SQLite |
| `GET` | `/history` | Last 50 predictions (survives restarts) |
| `GET` | `/model-info` | Forward model metadata from task1 |

## Running

```bash
pip install -r requirements.txt

# Environment variables (all optional)
export MODEL_API_BASE=http://localhost:8000
export DB_PATH=./app/history.db
export ALLOWED_ORIGINS=http://localhost:3000

uvicorn app.main:app --port 8001
# Swagger UI: http://localhost:8001/docs
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MODEL_API_BASE` | `http://localhost:8000` | task1 ML API base URL |
| `DB_PATH` | `app/history.db` | SQLite file path |
| `ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated CORS allowed origins |

## Docker

```bash
docker build -t housing-bff .
docker run -p 8001:8001 \
  -e MODEL_API_BASE=http://host.docker.internal:8000 \
  -e DB_PATH=/data/history.db \
  -v $(pwd)/data:/data \
  housing-bff
```

## Notes

- Uses `httpx.AsyncClient` for fully async calls to task1 (no thread-pool blocking)
- SQLite via `aiosqlite` — lightweight, zero-config persistence
- History is limited to the 50 most recent predictions per query
