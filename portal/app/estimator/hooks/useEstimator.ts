"use client";

import { useState, useCallback, useEffect } from "react";
import { predictPrice, getModelInfo } from "@/lib/api";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { HouseFeatures, PredictHistoryRecord, ModelInfo } from "@/lib/types";

interface EstimatorState {
  loading: boolean;
  error: string | null;
  result: number | null;
}

export function useEstimator() {
  const [state, setState] = useState<EstimatorState>({
    loading: false,
    error: null,
    result: null,
  });
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [history, setHistory] = useLocalStorage<PredictHistoryRecord[]>(
    "estimator_history",
    []
  );
  const [comparison, setComparison] = useLocalStorage<
    { features: HouseFeatures; price: number }[]
  >("estimator_comparison", []);

  useEffect(() => {
    getModelInfo()
      .then(setModelInfo)
      .catch(() => {/* model info is optional — chart degrades gracefully */});
  }, []);

  const submit = useCallback(async (features: HouseFeatures) => {
    setState({ loading: true, error: null, result: null });
    try {
      const res = await predictPrice(features as unknown as Record<string, unknown>);
      const record: PredictHistoryRecord = {
        id: Date.now(),
        features,
        predicted_price: res.predicted_price,
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => [record, ...prev].slice(0, 50));
      setState({ loading: false, error: null, result: res.predicted_price });
      return res.predicted_price;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Prediction failed";
      setState({ loading: false, error: msg, result: null });
      throw e;
    }
  }, [setHistory]);

  const addToComparison = useCallback(
    (features: HouseFeatures, price: number) => {
      setComparison((prev) => [...prev, { features, price }].slice(-4));
    },
    [setComparison]
  );

  const removeFromComparison = useCallback(
    (index: number) => {
      setComparison((prev) => prev.filter((_, i) => i !== index));
    },
    [setComparison]
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, [setHistory]);

  return {
    ...state,
    modelInfo,
    history,
    comparison,
    submit,
    addToComparison,
    removeFromComparison,
    clearHistory,
  };
}
