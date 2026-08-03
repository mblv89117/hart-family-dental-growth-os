import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: true,
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || site.domain),
  title: {
    default: site.homepageTitle,
    template: `%s | ${site.brand}`,
  },
  description: site.description,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: site.homepageTitle,
    description: site.description,
    url: site.domain,
    siteName: site.brand,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: site.logo.ogImage,
        width: 1200,
        height: 630,
        alt: "Hart Family Dental",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: site.homepageTitle,
    description: site.description,
    images: [site.logo.ogImage],
  },
  icons: {
    icon: [
      { url: site.logo.favicon, type: "image/png" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: site.logo.appleTouchIcon }],
  },
};

/**
 * Root layout stays synchronous (no headers()) so Next can hoist title/description
 * into <head> before </head> closes. Marketing chrome lives in (marketing)/layout.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head />
      <body className={`${display.variable} ${body.variable} antialiased`}>{children}</body>
    </html>
  );
}
