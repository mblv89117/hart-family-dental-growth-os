import type { Metadata } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { Analytics } from "@/components/Analytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { site } from "@/lib/site";
import "./globals.css";

const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = Outfit({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || site.domain),
  title: {
    default: `${site.brand} | Yucca Valley & Desert Hot Springs`,
    template: `%s | ${site.brand}`,
  },
  description: site.description,
  openGraph: {
    title: site.brand,
    description: site.description,
    url: site.domain,
    siteName: site.brand,
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <Analytics />
        <AttributionCapture />
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
