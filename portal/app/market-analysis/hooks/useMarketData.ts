"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getMarketStats, getProperties, postWhatIf } from "@/lib/api";
import type { MarketStats, PropertyData, HouseFeatures } from "@/lib/types";

interface Filters {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
}

interface UseMarketDataReturn {
  stats: MarketStats | null;
  properties: PropertyData[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (f: Filters) => void;
  refresh: () => Promise<void>;
  whatIfResult: number | null;
  whatIfLoading: boolean;
  runWhatIf: (f: HouseFeatures) => Promise<void>;
}

export function useMarketData(): UseMarketDataReturn {
  const [stats, setStats] = useState<MarketStats | null>(null);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({});
  const [whatIfResult, setWhatIfResult] = useState<number | null>(null);
  const [whatIfLoading, setWhatIfLoading] = useState(false);

  // Ref keeps fetchData's dep array stable while always seeing latest filters.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsData, propsData] = await Promise.all([
        getMarketStats(),
        getProperties(filtersRef.current),
      ]);
      setStats(statsData);
      setProperties(propsData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load market data");
    } finally {
      setLoading(false);
    }
  }, []); // stable — reads filters via ref, not closure

  useEffect(() => {
    fetchData();
  }, [fetchData, filters.minPrice, filters.maxPrice, filters.minBedrooms, filters.maxBedrooms]);

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
