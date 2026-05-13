"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/components/TranslationProvider";
import type { HouseFeatures } from "@/lib/types";

interface PropertyFormProps {
  onSubmit: (features: HouseFeatures) => Promise<void>;
  loading: boolean;
}

const initial: HouseFeatures = {
  square_footage: 2000,
  bedrooms: 3,
  bathrooms: 2,
  year_built: 2000,
  lot_size: 7500,
  distance_to_city_center: 5,
  school_rating: 8,
};

const fields: {
  key: keyof HouseFeatures;
  labelKey: string;
  min: number;
  max: number;
  step?: number;
}[] = [
  { key: "square_footage", labelKey: "estimator.form.sqft", min: 100, max: 10000, step: 10 },
  { key: "bedrooms", labelKey: "estimator.form.bedrooms", min: 1, max: 10, step: 1 },
  { key: "bathrooms", labelKey: "estimator.form.bathrooms", min: 0.5, max: 10, step: 0.5 },
  { key: "year_built", labelKey: "estimator.form.yearBuilt", min: 1800, max: 2030, step: 1 },
  { key: "lot_size", labelKey: "estimator.form.lotSize", min: 100, max: 100000, step: 100 },
  { key: "distance_to_city_center", labelKey: "estimator.form.distance", min: 0, max: 100, step: 0.1 },
  { key: "school_rating", labelKey: "estimator.form.schoolRating", min: 0, max: 10, step: 0.1 },
];

export function PropertyForm({ onSubmit, loading }: PropertyFormProps) {
  const { t } = useTranslation();
  const [features, setFeatures] = useState<HouseFeatures>(initial);
  const [errors, setErrors] = useState<Partial<Record<keyof HouseFeatures, string>>>({});

  const handleChange = (key: keyof HouseFeatures, value: string) => {
    const num = value === "" ? 0 : Number(value);
    setFeatures((prev) => ({ ...prev, [key]: num }));
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof HouseFeatures, string>> = {};
    for (const field of fields) {
      const val = features[field.key];
      if (val < field.min) newErrors[field.key] = `Min ${field.min}`;
      else if (val > field.max) newErrors[field.key] = `Max ${field.max}`;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(features);
  };

  return (
    <Card title={t("estimator.form.title")} subtitle={t("estimator.form.subtitle")}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {fields.map((field) => (
            <Input
              key={field.key}
              label={t(field.labelKey as Parameters<typeof t>[0])}
              type="number"
              min={field.min}
              max={field.max}
              step={field.step}
              value={features[field.key]}
              onChange={(e) => handleChange(field.key, e.target.value)}
              error={errors[field.key]}
            />
          ))}
        </div>
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={loading} size="lg">
            {t("estimator.form.submit")}
          </Button>
        </div>
      </form>
    </Card>
  );
}
