import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { DM_Sans, Fraunces, Space_Mono } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({ subsets: ["latin"], weight: ["300"], variable: "--font-serif" });
const spaceMono = Space_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Apply as an Exercise Professional | Curated Fit",
  description:
    "Apply to join Curated Fit's selected network of exercise professionals. Considered profiles and matched introductions ahead of the Auckland launch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${dmSans.variable} ${fraunces.variable} ${spaceMono.variable}`}>
      <body>{children}<Analytics /></body>
    </html>
    );
}
