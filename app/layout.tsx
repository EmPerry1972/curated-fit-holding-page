import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-serif" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Curated Fit — Find your Fit",
  description:
    "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
  metadataBase: new URL("https://www.curatedfit.co.nz"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Curated Fit",
    title: "Curated Fit — Find your Fit",
    description: "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
    url: "https://www.curatedfit.co.nz",
    locale: "en_NZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curated Fit — Find your Fit",
    description: "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${plexMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Curated Fit",
              slogan: "Find your Fit.",
              description:
                "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
              url: "https://www.curatedfit.co.nz",
              areaServed: {
                "@type": "City",
                name: "Auckland",
                address: { "@type": "PostalAddress", addressCountry: "NZ" },
              },
            }),
          }}
        />
        {children}<Analytics /></body>
    </html>
  );
}
