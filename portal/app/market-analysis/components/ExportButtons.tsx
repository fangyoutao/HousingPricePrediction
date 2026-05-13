"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { Download, FileText } from "lucide-react";
import type { PropertyData } from "@/lib/types";

interface ExportButtonsProps {
  properties: PropertyData[];
}

export function ExportButtons({ properties }: ExportButtonsProps) {
  const { t } = useTranslation();
  const exportCSV = () => {
    const headers = [
      "ID", "Square Footage", "Bedrooms", "Bathrooms",
      "Year Built", "Lot Size", "Distance to Center",
      "School Rating", "Price",
    ];
    const rows = properties.map((p) => [
      p.id,
      p.squareFootage,
      p.bedrooms,
      p.bathrooms,
      p.yearBuilt,
      p.lotSize,
      p.distanceToCityCenter,
      p.schoolRating,
      p.price,
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "property_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    // Use dynamic import for jsPDF
    const { default: jsPDF } = await import("jspdf");

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(16);
    doc.text("Property Data Report", 14, 20);
    doc.setFontSize(8);

    const headers = [
      "ID", "Sq Ft", "Beds", "Baths", "Year",
      "Lot Size", "Distance", "School", "Price",
    ];
    const rows = properties.slice(0, 50).map((p) => [
      String(p.id),
      String(p.squareFootage),
      String(p.bedrooms),
      String(p.bathrooms),
      String(p.yearBuilt),
      String(p.lotSize),
      String(p.distanceToCityCenter),
      String(p.schoolRating),
      `$${p.price.toLocaleString()}`,
    ]);

    (doc as unknown as { autoTable: (opts: Record<string, unknown>) => void }).autoTable?.({
      head: [headers],
      body: rows,
      startY: 30,
      styles: { fontSize: 7 },
    });

    // Fallback if autoTable is not available
    if (!(doc as unknown as { autoTable: unknown }).autoTable) {
      let y = 30;
      doc.text(headers.join(" | "), 14, y);
      y += 6;
      for (const row of rows) {
        doc.text(row.join(" | "), 14, y);
        y += 5;
        if (y > 180) break;
      }
    }

    doc.save("property_data.pdf");
  };

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={exportCSV}>
        <Download className="mr-1.5 h-4 w-4" />
        {t("market.export.csv")}
      </Button>
      <Button variant="outline" size="sm" onClick={exportPDF}>
        <FileText className="mr-1.5 h-4 w-4" />
        {t("market.export.pdf")}
      </Button>
    </div>
  );
}
