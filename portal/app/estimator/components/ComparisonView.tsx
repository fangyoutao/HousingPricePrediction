"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency } from "@/lib/utils";
import type { HouseFeatures } from "@/lib/types";
import { X } from "lucide-react";

interface ComparisonViewProps {
  items: { features: HouseFeatures; price: number }[];
  onRemove: (index: number) => void;
}

export function ComparisonView({ items, onRemove }: ComparisonViewProps) {
  const { t } = useTranslation();

  if (items.length === 0) return null;

  return (
    <Card
      title={t("estimator.compare.title")}
      subtitle={t("estimator.compare.subtitle", {
        n: items.length,
        ies: items.length === 1 ? "y" : "ies",
      })}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-4 text-left font-medium text-gray-500">{t("estimator.compare.feature")}</th>
              {items.map((_, i) => (
                <th key={i} className="px-2 py-2 text-left font-medium text-gray-500">
                  #{i + 1}
                  <button
                    onClick={() => onRemove(i)}
                    className="ml-2 inline-flex text-gray-400 hover:text-red-500"
                    aria-label={`Remove property ${i + 1}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {([
              [t("estimator.compare.price"), (i: number) => formatCurrency(items[i].price)],
              [t("estimator.result.sqft"), (i: number) => items[i].features.square_footage.toLocaleString()],
              [t("estimator.result.beds"), (i: number) => String(items[i].features.bedrooms)],
              [t("estimator.result.baths"), (i: number) => String(items[i].features.bathrooms)],
              [t("estimator.result.year"), (i: number) => String(items[i].features.year_built)],
              [t("estimator.result.lot"), (i: number) => `${items[i].features.lot_size.toLocaleString()} sqft`],
              [t("estimator.result.distance"), (i: number) => `${items[i].features.distance_to_city_center} mi`],
              [t("estimator.result.school"), (i: number) => String(items[i].features.school_rating)],
            ] as const).map(([label, getVal]) => (
              <tr key={label}>
                <td className="py-2 pr-4 font-medium text-gray-700">{label}</td>
                {items.map((_, i) => (
                  <td key={i} className="px-2 py-2 text-gray-900">
                    {getVal(i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
