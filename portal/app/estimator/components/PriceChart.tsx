"use client";

import { Card } from "@/components/ui/Card";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency } from "@/lib/utils";
import type { HouseFeatures } from "@/lib/types";

interface PriceChartProps {
  price: number;
  features: HouseFeatures;
}

export function PriceChart({ price }: PriceChartProps) {
  const { t } = useTranslation();

  const segments = [
    { labelKey: "estimator.chart.sizeRooms", pct: 35, color: "bg-blue-500" },
    { labelKey: "estimator.chart.location", pct: 25, color: "bg-green-500" },
    { labelKey: "estimator.chart.school", pct: 20, color: "bg-yellow-500" },
    { labelKey: "estimator.chart.ageCondition", pct: 20, color: "bg-purple-500" },
  ];

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
        </p>
      </div>
    </Card>
  );
}
