async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: options?.method && options.method !== "GET"
      ? { "Content-Type": "application/json", ...options?.headers }
      : { ...options?.headers },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error (${res.status}): ${text}`);
  }
  return res.json();
}

// --- Python Backend (App 1) ---
// Proxied by Next.js rewrites: /api/python/* → localhost:8001/*

export async function predictPrice(features: Record<string, unknown>) {
  return fetchJSON<{ predicted_price: number; currency: string }>(
    "/api/python/predict",
    {
      method: "POST",
      body: JSON.stringify({ features }),
    }
  );
}

export async function predictPriceBatch(featuresList: Record<string, unknown>[]) {
  return fetchJSON<{ predictions: { predicted_price: number; currency: string }[] }>(
    "/api/python/predict/batch",
    {
      method: "POST",
      body: JSON.stringify({ features: featuresList }),
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
  >("/api/python/history");
}

export async function getModelInfo() {
  return fetchJSON<{
    coefficients: Record<string, number>;
    intercept: number;
    metrics: Record<string, number>;
    features: string[];
  }>("/api/python/model-info");
}

// --- Java Backend (App 2) ---
// Proxied by Next.js rewrites: /api/java/* → localhost:8080/api/*

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
  }>("/api/java/stats");
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
  >(`/api/java/properties${qs ? `?${qs}` : ""}`);
}

function snakeToCamel(obj: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

export async function postWhatIf(features: Record<string, unknown>) {
  return fetchJSON<{ predictedPrice: number; currency: string }>(
    "/api/java/what-if",
    {
      method: "POST",
      body: JSON.stringify(snakeToCamel(features)),
    }
  );
}

export async function postWhatIfBatch(featuresList: Record<string, unknown>[]) {
  return fetchJSON<{ predictedPrice: number; currency: string }[]>(
    "/api/java/what-if/batch",
    {
      method: "POST",
      body: JSON.stringify(featuresList.map(snakeToCamel)),
    }
  );
}
