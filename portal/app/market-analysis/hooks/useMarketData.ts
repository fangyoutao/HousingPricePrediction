"use client";

import { useState, useEffect, useCallback } from "react";
import { getMarketStats, getProperties, postWhatIf } from "@/lib/api";
import type { MarketStats, PropertyData, HouseFeatures } from "@/lib/types";

interface UseMarketDataReturn {
  stats: MarketStats | null;
  properties: PropertyData[];
  loading: boolean;
  error: string | null;
  filters: { minPrice?: number; maxPrice?: number; minBedrooms?: number; maxBedrooms?: number };
  setFilters: (f: { minPrice?: number; maxPrice?: number; minBedrooms?: number; maxBedrooms?: number }) => void;
  refresh: () => Promise<void>;
  // What-if
  whatIfResult: number | null;
  whatIfLoading: boolean;
  runWhatIf: (f: HouseFeatures) => Promise<void>;
}

export function useMarketData(): UseMarketDataReturn {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
  }>({});
  const [whatIfResult, setWhatIfResult] = useState<number | null>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, propsData] = await Promise.all([
        getMarketStats(),
        getProperties(filters),
      ]);
      setStats(statsData);
      setProperties(propsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load market data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.minPrice, filters.maxPrice, filters.minBedrooms, filters.maxBedrooms]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const runWhatIf = useCallback(async (features: HouseFeatures) => {
    setWhatIfLoading(true);
    try {
      const res = await postWhatIf(features as unknown as Record<string, unknown>);
      setWhatIfResult(res.predictedPrice);
    } catch (e) {
      setWhatIfResult(null);
      throw e;
    } finally {
      setWhatIfLoading(false);
    }
  }, []);

  return {
    stats,
    properties,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchData,
    whatIfResult,
    whatIfLoading,
    runWhatIf,
  };
}
