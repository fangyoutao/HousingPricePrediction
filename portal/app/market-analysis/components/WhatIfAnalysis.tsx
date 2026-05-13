"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency } from "@/lib/utils";
import type { HouseFeatures } from "@/lib/types";

interface WhatIfAnalysisProps {
  onRun: (features: HouseFeatures) => Promise<void>;
  result: number | null;
  loading: boolean;
}

export function WhatIfAnalysis({ onRun, result, loading }: WhatIfAnalysisProps) {
  const { t } = useTranslation();
  const [features, setFeatures] = useState<HouseFeatures>({
    square_footage: 2000,
    bedrooms: 3,
    bathrooms: 2,
    year_built: 2000,
    lot_size: 7500,
    distance_to_city_center: 5,
    school_rating: 8,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onRun(features);
  };

  return (
    <Card title={t("market.whatif.title")} subtitle={t("market.whatif.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t("estimator.form.sqft")}
            type="number"
            value={features.square_footage}
            onChange={(e) => setFeatures((f) => ({ ...f, square_footage: Number(e.target.value) }))}
          />
          <Input
            label={t("estimator.form.bedrooms")}
            type="number"
            value={features.bedrooms}
            onChange={(e) => setFeatures((f) => ({ ...f, bedrooms: Number(e.target.value) }))}
          />
          <Input
            label={t("estimator.form.bathrooms")}
            type="number"
            step={0.5}
            value={features.bathrooms}
            onChange={(e) => setFeatures((f) => ({ ...f, bathrooms: Number(e.target.value) }))}
          />
          <Input
            label={t("estimator.form.yearBuilt")}
            type="number"
            value={features.year_built}
            onChange={(e) => setFeatures((f) => ({ ...f, year_built: Number(e.target.value) }))}
          />
          <Input
            label={t("estimator.form.lotSize")}
            type="number"
            value={features.lot_size}
            onChange={(e) => setFeatures((f) => ({ ...f, lot_size: Number(e.target.value) }))}
          />
          <Input
            label={t("estimator.form.distance")}
            type="number"
            step={0.1}
            value={features.distance_to_city_center}
            onChange={(e) => setFeatures((f) => ({ ...f, distance_to_city_center: Number(e.target.value) }))}
          />
          <Input
            label={t("estimator.form.schoolRating")}
            type="number"
            step={0.1}
            value={features.school_rating}
            onChange={(e) => setFeatures((f) => ({ ...f, school_rating: Number(e.target.value) }))}
          />
        </div>

        <Button type="submit" loading={loading}>
          {t("market.whatif.calculate")}
        </Button>

        {result !== null && (
          <div className="rounded-lg bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-600">{t("market.whatif.estimatedPrice")}</p>
            <p className="text-2xl font-bold text-blue-700">
              {formatCurrency(result)}
            </p>
          </div>
        )}
      </form>
    </Card>
  );
}
