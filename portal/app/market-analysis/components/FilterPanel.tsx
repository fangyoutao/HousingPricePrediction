"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { RotateCcw } from "lucide-react";
import { useState } from "react";

interface FilterPanelProps {
  onApply: (filters: {
    minPrice?: number;
    maxPrice?: number;
    minBedrooms?: number;
    maxBedrooms?: number;
  }) => void;
}

export function FilterPanel({ onApply }: FilterPanelProps) {
  const { t } = useTranslation();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [maxBedrooms, setMaxBedrooms] = useState("");

  const apply = () => {
    onApply({
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
      maxBedrooms: maxBedrooms ? Number(maxBedrooms) : undefined,
    });
  };

  const reset = () => {
    setMinPrice("");
    setMaxPrice("");
    setMinBedrooms("");
    setMaxBedrooms("");
    onApply({});
  };

  return (
    <Card title={t("market.filters.title")}>
      <div className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t("market.filters.minPrice")}
            type="number"
            placeholder="e.g. 200000"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <Input
            label={t("market.filters.maxPrice")}
            type="number"
            placeholder="e.g. 400000"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label={t("market.filters.minBedrooms")}
            type="number"
            min={1}
            max={10}
            placeholder="e.g. 2"
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(e.target.value)}
          />
          <Input
            label={t("market.filters.maxBedrooms")}
            type="number"
            min={1}
            max={10}
            placeholder="e.g. 4"
            value={maxBedrooms}
            onChange={(e) => setMaxBedrooms(e.target.value)}
          />
        </div>
        <div className="flex gap-2 pt-2">
          <Button size="sm" onClick={apply} className="flex-1">
            {t("market.filters.apply")}
          </Button>
          <Button size="sm" variant="outline" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
