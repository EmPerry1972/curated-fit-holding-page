import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["500", "600"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Apply as an Exercise Professional | Curated Fit",
  description:
    "Apply to join Curated Fit's selected network of exercise professionals. Considered profiles and matched introductions ahead of the Auckland launch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable}`}>
      <body>{children}<Analytics /></body>
    </html>
  );
}
