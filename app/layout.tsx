import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL } from "@/lib/env";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL), title: { default: "The Humanity & Cooperation Initiative | ORIVANA", template: "%s | Humanity & Cooperation Initiative" },
  description: "Free articles, webinars, tools and programmes to help people understand and cooperate across differences. An ORIVANA initiative with The Humanity Movement.",
  icons: { icon: "/brand/favicon.png" }, openGraph: { images: ["/brand/og.jpg"], siteName: "The Humanity & Cooperation Initiative", type: "website" }, alternates: { types: { "application/rss+xml": `${SITE_URL}/rss.xml` } },
};
export default function Root({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><head>
    <link rel="preconnect" href="https://fonts.googleapis.com" /><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;0,8..60,700;1,8..60,400&display=swap" />
  </head><body><a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3">Skip to content</a>{children}<Analytics /></body></html>);
}
