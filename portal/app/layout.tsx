import type { Metadata } from "next";
import { Navigation } from "@/components/Navigation";
import { TranslationProvider } from "@/components/TranslationProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Property Portal",
  description: "Property Value Estimator & Market Analysis",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 antialiased text-gray-900">
        <TranslationProvider>
          <Navigation />
          <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </TranslationProvider>
      </body>
    </html>
  );
}
