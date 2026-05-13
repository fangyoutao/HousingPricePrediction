"use client";

import { Card } from "@/components/ui/Card";
import { CardSkeleton } from "@/components/ui/Skeleton";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { MarketStats } from "@/lib/types";
import { Home, DollarSign, TrendingUp, Star } from "lucide-react";

interface DashboardProps {
  stats: MarketStats | null;
  loading: boolean;
}

export function Dashboard({ stats, loading }: DashboardProps) {
  const { t } = useTranslation();

  const kpiConfig = [
    {
      key: "avgPrice",
      label: t("market.stats.avgPrice"),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "medianPrice",
      label: t("market.stats.medianPrice"),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
      format: (v: number) => formatCurrency(v),
    },
    {
      key: "totalProperties",
      label: t("market.stats.total"),
      icon: Home,
      color: "text-purple-600",
      bg: "bg-purple-100",
      format: (v: number) => formatNumber(v),
    },
    {
      key: "avgSchoolRating",
      label: t("market.stats.avgSchool"),
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
      format: (v: number) => String(v),
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-6 text-center text-sm text-yellow-700">
        {t("common.noData")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpiConfig.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.key}>
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${kpi.bg}`}>
                  <Icon className={`h-6 w-6 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{kpi.label}</p>
                  <p className="text-xl font-bold text-gray-900">
                    {kpi.format(stats[kpi.key as keyof MarketStats] as number)}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Distribution Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title={t("market.stats.bedroomDist")}>
          {stats.bedroomsDistribution && (
            <div className="space-y-3">
              {Object.entries(stats.bedroomsDistribution)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([beds, count]) => {
                  const maxCount = Math.max(
                    ...Object.values(stats.bedroomsDistribution)
                  );
                  const pct = (count / maxCount) * 100;
                  return (
                    <div key={beds} className="flex items-center gap-3">
                      <span className="w-16 text-sm text-gray-600">{beds} {t("estimator.result.beds")}</span>
                      <div className="flex-1">
                        <div className="h-5 rounded-full bg-gray-100">
                          <div
                            className="h-5 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-sm font-medium text-gray-700">
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </Card>

        <Card title={t("market.stats.priceRange")}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t("market.stats.min")}</span>
              <span className="font-medium">{formatCurrency(stats.minPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t("market.stats.max")}</span>
              <span className="font-medium">{formatCurrency(stats.maxPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t("market.stats.avg")}</span>
              <span className="font-medium">{formatCurrency(stats.avgPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{t("market.stats.median")}</span>
              <span className="font-medium">{formatCurrency(stats.medianPrice)}</span>
            </div>
            <div className="mt-4">
              <div className="relative h-4 rounded-full bg-gray-100">
                <div
                  className="absolute h-4 rounded-full bg-gradient-to-r from-blue-300 to-blue-600"
                  style={{
                    left: "0%",
                    right: `${((stats.maxPrice - stats.avgPrice) / (stats.maxPrice - stats.minPrice)) * 50}%`,
                  }}
                />
                <div
                  className="absolute top-0 h-4 w-1 rounded-full bg-red-500"
                  style={{
                    left: `${((stats.avgPrice - stats.minPrice) / (stats.maxPrice - stats.minPrice)) * 100}%`,
                  }}
                />
              </div>
              <div className="mt-1 flex justify-between text-xs text-gray-400">
                <span>{formatCurrency(stats.minPrice)}</span>
                <span>{formatCurrency(stats.maxPrice)}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
