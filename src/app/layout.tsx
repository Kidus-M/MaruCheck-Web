import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd } from "@/components/json-ld";
import { AUTHOR_NAME, SITE_NAME, SITE_SHORT_DESCRIPTION, SITE_TAGLINE } from "@/lib/seo";
import { organizationSchema, websiteSchema } from "@/lib/structured-data";
import { MARUCHECK_SOURCE_URL } from "@/lib/public-release";
import { MARUCHECK_PRODUCTION_ORIGIN } from "@/lib/public-site";
import "./globals.css";
import "./marketing.css";
import "./marketing-v2.css";
import "./marketing-pages-v2.css";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: MARUCHECK_SOURCE_URL }],
  category: "Software Development",
  creator: AUTHOR_NAME,
  description: SITE_SHORT_DESCRIPTION,
  metadataBase: new URL(MARUCHECK_PRODUCTION_ORIGIN),
  openGraph: {
    description: SITE_SHORT_DESCRIPTION,
    locale: "en_US",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    type: "website",
    url: MARUCHECK_PRODUCTION_ORIGIN,
  },
  publisher: SITE_NAME,
  // Answer engines quote longer passages when the page does not cap snippet
  // length, so the preview limits are deliberately left unbounded.
  robots: {
    follow: true,
    googleBot: {
      follow: true,
      index: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    index: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  twitter: {
    card: "summary_large_image",
    description: SITE_SHORT_DESCRIPTION,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        {children}
        <JsonLd nodes={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}
