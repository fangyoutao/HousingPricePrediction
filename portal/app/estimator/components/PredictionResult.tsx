"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency } from "@/lib/utils";
import type { HouseFeatures } from "@/lib/types";
import { PriceChart } from "./PriceChart";

interface PredictionResultProps {
  price: number;
  features: HouseFeatures;
  onAddToComparison: () => void;
}

export function PredictionResult({ price, features, onAddToComparison }: PredictionResultProps) {
  const { t } = useTranslation();

  const rows = [
    [t("estimator.result.sqft"), features.square_footage.toLocaleString()],
    [t("estimator.result.beds"), String(features.bedrooms)],
    [t("estimator.result.baths"), String(features.bathrooms)],
    [t("estimator.result.year"), String(features.year_built)],
    [t("estimator.result.lot"), `${features.lot_size.toLocaleString()} sqft`],
    [t("estimator.result.distance"), `${features.distance_to_city_center} mi`],
    [t("estimator.result.school"), String(features.school_rating)],
  ];

  return (
    <Card title={t("estimator.result.title")}>
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-sm text-gray-500">{t("estimator.result.estimatedValue")}</p>
          <p className="mt-1 text-4xl font-bold text-blue-600">
            {formatCurrency(price)}
          </p>
        </div>

        <PriceChart price={price} features={features} />

        <div className="grid grid-cols-2 gap-3 text-sm">
          {rows.map(([label, val]) => (
            <div key={label} className="flex justify-between rounded bg-gray-50 px-3 py-2">
              <span className="text-gray-500">{label}</span>
              <span className="font-medium text-gray-900">{val}</span>
            </div>
          ))}
        </div>

        <Button variant="outline" className="w-full" onClick={onAddToComparison}>
          {t("estimator.result.addToCompare")}
        </Button>
      </div>
    </Card>
  );
}
