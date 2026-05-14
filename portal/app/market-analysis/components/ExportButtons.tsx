"use client";

import { Button } from "@/components/ui/Button";
import { useTranslation } from "@/components/TranslationProvider";
import { Download, FileText } from "lucide-react";
import type { PropertyData } from "@/lib/types";

interface ExportButtonsProps {
  properties: PropertyData[];
}

const PDF_COLS = [
  { label: "ID",       width: 12 },
  { label: "Sq Ft",    width: 24 },
  { label: "Beds",     width: 14 },
  { label: "Baths",    width: 14 },
  { label: "Year",     width: 18 },
  { label: "Lot Size", width: 24 },
  { label: "Distance", width: 22 },
  { label: "School",   width: 18 },
  { label: "Price",    width: 32 },
] as const;

export function ExportButtons({ properties }: ExportButtonsProps) {
  const { t } = useTranslation();

  const exportCSV = () => {
    const headers = PDF_COLS.map((c) => c.label);
    const rows = properties.map((p) => [
      p.id, p.squareFootage, p.bedrooms, p.bathrooms,
      p.yearBuilt, p.lotSize, p.distanceToCityCenter, p.schoolRating, p.price,
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
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ orientation: "landscape" });

    const PAGE_W = 277; // A4 landscape usable width (mm)
    const MARGIN = 14;
    const ROW_H = 6;
    const HEADER_Y = 28;

    doc.setFontSize(14);
    doc.text("Property Data Report", MARGIN, 18);

    const rows = properties.slice(0, 50).map((p) => [
      String(p.id),
      p.squareFootage.toLocaleString(),
      String(p.bedrooms),
      String(p.bathrooms),
      String(p.yearBuilt),
      p.lotSize.toLocaleString(),
      String(p.distanceToCityCenter),
      String(p.schoolRating),
      `$${p.price.toLocaleString()}`,
    ]);

    // Header row
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    let x = MARGIN;
    PDF_COLS.forEach((col) => {
      doc.text(col.label, x, HEADER_Y);
      x += col.width;
    });

    // Divider line
    doc.setLineWidth(0.3);
    doc.line(MARGIN, HEADER_Y + 1.5, MARGIN + PDF_COLS.reduce((s, c) => s + c.width, 0), HEADER_Y + 1.5);

    // Data rows
    doc.setFont("helvetica", "normal");
    let y = HEADER_Y + ROW_H;
    for (const row of rows) {
      if (y > 195) break; // A4 landscape height limit
      x = MARGIN;
      row.forEach((cell, i) => {
        doc.text(cell, x, y);
        x += PDF_COLS[i].width;
      });
      y += ROW_H;
    }

    // Footer
    doc.setFontSize(6);
    doc.setTextColor(150);
    doc.text(
      `Generated ${new Date().toLocaleString()} — ${properties.length} properties`,
      MARGIN,
      205
    );

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
