import { Analytics } from "@vercel/analytics/react";
import { GoogleTagManager } from "@next/third-parties/google";
import type { Metadata } from "next";
import { Inter, Playfair_Display, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Set in .env.local locally and in the Vercel dashboard for each environment.
// Without it, no Tag Manager code is rendered at all.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["400"], style: ["normal", "italic"], variable: "--font-serif" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Curated Fit - Find your Fit",
  description:
    "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
  metadataBase: new URL("https://www.curatedfit.co.nz"),
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Curated Fit",
    title: "Curated Fit - Find your Fit",
    description: "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
    url: "https://www.curatedfit.co.nz",
    locale: "en_NZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "Curated Fit - Find your Fit",
    description: "Curated Fit helps you find an exercise professional suited to your goals, where you feel most comfortable, and the kind of support you prefer.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${plexMono.variable}`}>
      <body>
        {/* GoogleTagManager renders the dataLayer init and gtm.js only; the
            noscript fallback is not included, so it is added here. */}
        {GTM_ID ? (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        ) : null}
        {GTM_ID ? <GoogleTagManager gtmId={GTM_ID} /> : null}
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
