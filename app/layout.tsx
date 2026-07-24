import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-serif" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Apply as an Exercise Professional | Curated Fit",
  description:
    "Apply to join Curated Fit's selected network of exercise professionals. Considered profiles and matched introductions ahead of the Auckland launch.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${plexMono.variable}`}>
      <body>{children}<Analytics /></body>
    </html>
  );
}
