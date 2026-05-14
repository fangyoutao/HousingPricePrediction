"use client";

import { useState, useCallback } from "react";
import { PropertyForm } from "./components/PropertyForm";
import { PredictionResult } from "./components/PredictionResult";
import { EstimateHistory } from "./components/EstimateHistory";
import { ComparisonView } from "./components/ComparisonView";
import { useEstimator } from "./hooks/useEstimator";
import { useTranslation } from "@/components/TranslationProvider";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import type { HouseFeatures } from "@/lib/types";

export default function EstimatorPage() {
  const { t } = useTranslation();
  const {
    loading,
    result,
    modelInfo,
    history,
    comparison,
    submit,
    addToComparison,
    removeFromComparison,
    clearHistory,
  } = useEstimator();

  const [lastFeatures, setLastFeatures] = useState<HouseFeatures | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (features: HouseFeatures) => {
      setSubmitError(null);
      try {
        await submit(features);
        setLastFeatures(features);
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : t("common.error"));
      }
    },
    [submit, t]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t("estimator.title")}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {t("estimator.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <PropertyForm onSubmit={handleSubmit} loading={loading} />

        {submitError && (
          <ErrorFallback message={submitError} onRetry={() => setSubmitError(null)} />
        )}

        {result !== null && lastFeatures && (
          <PredictionResult
            price={result}
            features={lastFeatures}
            modelCoefficients={modelInfo?.coefficients ?? null}
            onAddToComparison={() => addToComparison(lastFeatures, result)}
          />
        )}

        {!result && !submitError && (
          <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
            <div>
              <p className="text-lg font-medium text-gray-400">{t("common.noPrediction")}</p>
              <p className="mt-1 text-sm text-gray-400">
                {t("common.noPredictionHint")}
              </p>
            </div>
          </div>
        )}
      </div>

      <ComparisonView items={comparison} onRemove={removeFromComparison} />
      <EstimateHistory history={history} onClear={clearHistory} />
    </div>
  );
}
