import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Private matching test | Curated Fit",
  referrer: "no-referrer",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false, noimageindex: true } },
};

export default function ClientMatchingTestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
