# backend-java — Property Market Analysis API

Spring Boot 3 service providing market statistics, property filtering, and what-if price analysis backed by the ML model.

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/stats` | Aggregate statistics (avg/median/min/max price, distributions) |
| `GET` | `/api/properties` | Full property list with optional filters |
| `POST` | `/api/what-if` | Price prediction via ML model |

### Filter parameters (`GET /api/properties`)

| Param | Type | Description |
|---|---|---|
| `minPrice` | `double` | Minimum price |
| `maxPrice` | `double` | Maximum price |
| `minBedrooms` | `int` (1–10) | Minimum bedroom count |
| `maxBedrooms` | `int` (1–10) | Maximum bedroom count |

### What-If request body

```json
{
  "squareFootage": 2000,
  "bedrooms": 3,
  "bathrooms": 2.0,
  "yearBuilt": 2000,
  "lotSize": 7500,
  "distanceToCityCenter": 5.0,
  "schoolRating": 8.0
}
```

## Running

```bash
# Optional env var
export MODEL_API_BASE_URL=http://localhost:8000

mvn spring-boot:run
# API base: http://localhost:8080/api
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `MODEL_API_BASE_URL` | `http://localhost:8000` | task1 ML API base URL (used by what-if) |

## Docker

```bash
docker build -t housing-market .
docker run -p 8080:8080 \
  -e MODEL_API_BASE_URL=http://host.docker.internal:8000 \
  housing-market
```

## Notes

- Property data is loaded from `src/main/resources/house_data.csv` at startup using `opencsv`
- Stats and filtered results are cached in-memory with Spring Cache (`ConcurrentMapCacheManager`)
- What-if predictions are forwarded to the task1 ML API via Spring `RestClient`, ensuring consistent results with the Estimator page
- CORS is configured centrally in `WebConfig` (allows `http://localhost:3000` by default)
