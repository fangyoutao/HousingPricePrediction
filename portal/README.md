# Portal — HSBC Property Portal

Next.js 16 frontend for the Housing Price Prediction system.

## Pages

| Route | Description |
|---|---|
| `/` | Home — links to both apps |
| `/estimator` | Property Value Estimator — form input, ML prediction, comparison table, history |
| `/market-analysis` | Market Analysis — KPI dashboard, property table, filters, what-if analysis, CSV/PDF export |

## Features

- **Price Estimator** — submit property features, receive ML-backed price prediction
- **Feature contribution chart** — breakdown of how each feature group contributes to the prediction, derived from real model coefficients
- **Comparison view** — side-by-side comparison of up to 4 properties
- **Estimate history** — last 50 predictions persisted in localStorage
- **Market dashboard** — avg/median/min/max price, bedroom distribution chart, price range visualisation
- **Filterable property table** — sortable by any column, filter by price and bedroom range
- **What-if analysis** — calls the Java backend (which calls the ML model) to estimate price for custom inputs
- **Export** — download filtered data as CSV or PDF
- **i18n** — English / Chinese, saved to localStorage

## Development

```bash
npm install
cp .env.example .env.local   # adjust API URLs if needed
npm run dev                  # http://localhost:3000
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_PYTHON_API` | `http://localhost:8001` | backend-python (BFF) base URL |
| `NEXT_PUBLIC_JAVA_API` | `http://localhost:8080` | backend-java (market analysis) base URL |

## Build

```bash
npm run build
npm run start
```

## Tech Stack

- **Next.js 16** (App Router)
- **Tailwind CSS 4**
- **Recharts** — chart rendering
- **Lucide React** — icons
- **jsPDF** — PDF export
- **TypeScript 5**
