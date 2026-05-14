"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency } from "@/lib/utils";
import type { HouseFeatures } from "@/lib/types";

interface PriceChartProps {
  price: number;
  features: HouseFeatures;
  modelCoefficients: Record<string, number> | null;
}

const FEATURE_GROUPS: { keys: (keyof HouseFeatures)[]; labelKey: string; color: string }[] = [
  { keys: ["square_footage", "bedrooms", "bathrooms"], labelKey: "estimator.chart.sizeRooms", color: "bg-blue-500" },
  { keys: ["distance_to_city_center", "lot_size"],     labelKey: "estimator.chart.location",  color: "bg-green-500" },
  { keys: ["school_rating"],                            labelKey: "estimator.chart.school",    color: "bg-yellow-500" },
  { keys: ["year_built"],                               labelKey: "estimator.chart.ageCondition", color: "bg-purple-500" },
];

function computeSegments(
  features: HouseFeatures,
  coefficients: Record<string, number>
): { labelKey: string; color: string; pct: number }[] {
  const contributions = FEATURE_GROUPS.map((group) => {
    const total = group.keys.reduce((sum, key) => {
      const coef = coefficients[key] ?? 0;
      const val = features[key] as number;
      return sum + Math.abs(coef * val);
    }, 0);
    return { ...group, contrib: total };
  });

  const grand = contributions.reduce((s, g) => s + g.contrib, 0);
  if (grand === 0) return contributions.map((g) => ({ ...g, pct: 25 }));

  return contributions.map((g) => ({
    labelKey: g.labelKey,
    color: g.color,
    pct: Math.round((g.contrib / grand) * 100),
  }));
}

export function PriceChart({ price, features, modelCoefficients }: PriceChartProps) {
  const { t } = useTranslation();

  const segments = useMemo(() => {
    if (!modelCoefficients) {
      // Fallback static display until model info loads
      return FEATURE_GROUPS.map((g) => ({ ...g, pct: 25 }));
    }
    return computeSegments(features, modelCoefficients);
  }, [features, modelCoefficients]);

  return (
    <Card title={t("estimator.chart.title")}>
      <div className="space-y-3">
        <div className="flex h-4 overflow-hidden rounded-full">
          {segments.map((s) => (
            <div
              key={s.labelKey}
              className={s.color}
              style={{ width: `${s.pct}%` }}
              title={`${t(s.labelKey as Parameters<typeof t>[0])}: ${s.pct}%`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {segments.map((s) => (
            <div key={s.labelKey} className="flex items-center gap-2">
              <span className={`inline-block h-2 w-2 rounded-full ${s.color}`} />
              <span className="text-gray-600">{t(s.labelKey as Parameters<typeof t>[0])}</span>
              <span className="ml-auto font-medium">{s.pct}%</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400">
          {t("estimator.result.estimatedValue")}: {formatCurrency(price)}
          {!modelCoefficients && " (loading model info…)"}
        </p>
      </div>
    </Card>
  );
}
