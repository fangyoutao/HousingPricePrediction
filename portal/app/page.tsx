"use client";

import Link from "next/link";
import { Building2, BarChart3, ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/TranslationProvider";

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          {t("home.title")}
        </h1>
        <p className="mt-3 text-lg text-gray-500">
          {t("home.subtitle")}
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Link
          href="/estimator"
          className="group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-300"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
            <Building2 className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-blue-600">
            {t("home.estimator.title")}
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            {t("home.estimator.desc")}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-blue-600 gap-1 group-hover:gap-2 transition-all">
            {t("home.estimator.cta")} <ArrowRight className="h-4 w-4" />
          </span>
        </Link>

        <Link
          href="/market-analysis"
          className="group rounded-xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-green-300"
        >
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
            <BarChart3 className="h-6 w-6" />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900 group-hover:text-green-600">
            {t("home.market.title")}
          </h2>
          <p className="mb-4 text-sm text-gray-500">
            {t("home.market.desc")}
          </p>
          <span className="inline-flex items-center text-sm font-medium text-green-600 gap-1 group-hover:gap-2 transition-all">
            {t("home.market.cta")} <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}
