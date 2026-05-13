"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { PredictHistoryRecord } from "@/lib/types";

interface EstimateHistoryProps {
  history: PredictHistoryRecord[];
  onClear: () => void;
}

export function EstimateHistory({ history, onClear }: EstimateHistoryProps) {
  const { t } = useTranslation();

  if (history.length === 0) {
    return (
      <Card title={t("estimator.history.title")}>
        <p className="text-sm text-gray-400">{t("estimator.history.empty")}</p>
      </Card>
    );
  }

  return (
    <Card
      title={t("estimator.history.title")}
      subtitle={t("estimator.history.suffix", { n: history.length })}
    >
      <div className="space-y-3">
        {history.slice(0, 10).map((record) => (
          <div
            key={record.id}
            className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3 text-sm"
          >
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {record.features.bedrooms} {t("estimator.result.beds")} /{" "}
                {record.features.bathrooms} {t("estimator.result.baths")} —{" "}
                {record.features.square_footage.toLocaleString()}{" "}
                {t("estimator.result.sqft")}
              </p>
              <p className="text-xs text-gray-400">
                {formatDate(record.created_at)}
              </p>
            </div>
            <Badge variant="success">
              {formatCurrency(record.predicted_price)}
            </Badge>
          </div>
        ))}
        {history.length > 0 && (
          <div className="flex justify-end pt-2">
            <Button variant="ghost" size="sm" onClick={onClear}>
              {t("estimator.history.clear")}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
