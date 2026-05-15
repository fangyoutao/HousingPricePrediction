"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { formatCurrency } from "@/lib/utils";
import type { PropertyData } from "@/lib/types";
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

interface DataTableProps {
  properties: PropertyData[];
}

type SortKey = keyof PropertyData;

export function DataTable({ properties }: DataTableProps) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  useEffect(() => { setPage(1); }, [properties]);

  const sorted = useMemo(() => {
    return [...properties].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [properties, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = sorted.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (colKey !== sortKey) return <ChevronsUpDown className="h-3 w-3 text-gray-300" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3" />
    ) : (
      <ChevronDown className="h-3 w-3" />
    );
  };

  if (properties.length === 0) {
    return (
      <Card title={t("market.table.title")}>
        <p className="text-sm text-gray-400">{t("market.table.noMatch")}</p>
      </Card>
    );
  }

  const headers: { key: SortKey; label: string }[] = [
    { key: "id", label: "ID" },
    { key: "squareFootage", label: t("market.table.sqft") },
    { key: "bedrooms", label: t("market.table.beds") },
    { key: "bathrooms", label: t("market.table.baths") },
    { key: "yearBuilt", label: t("market.table.year") },
    { key: "price", label: t("common.price") },
    { key: "schoolRating", label: t("market.table.school") },
  ];

  return (
    <Card title={t("market.table.title")} subtitle={`${sorted.length} ${t("market.stats.total")}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              {headers.map(({ key, label }) => (
                <th
                  key={key}
                  className="cursor-pointer px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700"
                  onClick={() => toggleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {label}
                    <SortIcon colKey={key} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paged.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 text-gray-400">{p.id}</td>
                <td className="px-3 py-2.5 font-medium text-gray-900">
                  {p.squareFootage.toLocaleString()}
                </td>
                <td className="px-3 py-2.5 text-gray-700">{p.bedrooms}</td>
                <td className="px-3 py-2.5 text-gray-700">{p.bathrooms}</td>
                <td className="px-3 py-2.5 text-gray-700">{p.yearBuilt}</td>
                <td className="px-3 py-2.5">
                  <Badge variant="success">{formatCurrency(p.price)}</Badge>
                </td>
                <td className="px-3 py-2.5 text-gray-700">{p.schoolRating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            {t("market.table.showing")} {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, sorted.length)} {t("market.table.of")}{" "}
            {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600 min-w-[4rem] text-center">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
