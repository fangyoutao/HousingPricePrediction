"use client";

import { useMarketData } from "./hooks/useMarketData";
import { Dashboard } from "./components/DashBoard";
import { FilterPanel } from "./components/FilterPanel";
import { WhatIfAnalysis } from "./components/WhatIfAnalysis";
import { DataTable } from "./components/DataTable";
import { ExportButtons } from "./components/ExportButtons";
import { useTranslation } from "@/components/TranslationProvider";
import { ErrorFallback } from "@/components/ui/ErrorFallback";
import { Button } from "@/components/ui/Button";
import { RotateCcw } from "lucide-react";

export default function MarketAnalysisPage() {
  const { t } = useTranslation();
  const {
    stats,
    properties,
    loading,
    error,
    setFilters,
    refresh,
    whatIfResult,
    whatIfLoading,
    runWhatIf,
  } = useMarketData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("market.title")}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t("market.subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButtons properties={properties} />
          <Button variant="ghost" size="sm" onClick={refresh}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {error && (
        <ErrorFallback message={error} onRetry={refresh} />
      )}

      <Dashboard stats={stats} loading={loading} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <FilterPanel onApply={setFilters} />
          <WhatIfAnalysis onRun={runWhatIf} result={whatIfResult} loading={whatIfLoading} />
        </div>
        <div className="lg:col-span-2">
          <DataTable properties={properties} />
        </div>
      </div>
    </div>
  );
}
