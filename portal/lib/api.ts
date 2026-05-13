const PYTHON_API = "http://localhost:8001";
const JAVA_API = "http://localhost:8080";

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }
  return res.json();
}

// --- Python Backend (App 1) ---

export async function predictPrice(features: Record<string, unknown>) {
  return fetchJSON<{ predicted_price: number; currency: string }>(
    `${PYTHON_API}/predict`,
    {
      method: "POST",
      body: JSON.stringify({ features }),
    }
  );
}

export async function getHistory() {
  return fetchJSON<
    {
      id: number;
      features: Record<string, unknown>;
      predicted_price: number;
      created_at: string;
    }[]
  >(`${PYTHON_API}/history`);
}

export async function getModelInfo() {
  return fetchJSON<{
    coefficients: Record<string, number>;
    intercept: number;
    metrics: Record<string, number>;
    features: string[];
  }>(`${PYTHON_API}/model-info`);
}

// --- Java Backend (App 2) ---

export async function getMarketStats() {
  return fetchJSON<{
    totalProperties: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    medianPrice: number;
    avgSquareFootage: number;
    avgBedrooms: number;
    avgBathrooms: number;
    avgSchoolRating: number;
    bedroomsDistribution: Record<string, number>;
    yearDecadeDistribution: Record<string, number>;
  }>(`${JAVA_API}/api/stats`);
}

export async function getProperties(filters?: {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters?.minBedrooms) params.set("minBedrooms", String(filters.minBedrooms));
  if (filters?.maxBedrooms) params.set("maxBedrooms", String(filters.maxBedrooms));
  const qs = params.toString();
  return fetchJSON<
    {
      id: number;
      squareFootage: number;
      bedrooms: number;
      bathrooms: number;
      yearBuilt: number;
      lotSize: number;
      distanceToCityCenter: number;
      schoolRating: number;
      price: number;
    }[]
  >(`${JAVA_API}/api/properties${qs ? `?${qs}` : ""}`);
}

export async function postWhatIf(features: Record<string, unknown>) {
  return fetchJSON<{ predictedPrice: number; currency: string }>(
    `${JAVA_API}/api/what-if`,
    {
      method: "POST",
      body: JSON.stringify(features),
    }
  );
}
