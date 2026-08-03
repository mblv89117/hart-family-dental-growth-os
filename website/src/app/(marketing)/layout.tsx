import { Analytics } from "@/components/Analytics";
import { AttributionCapture } from "@/components/AttributionCapture";
import { JsonLd } from "@/components/JsonLd";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { SkipLink } from "@/components/SkipLink";
import { StickyCtaBar } from "@/components/StickyCtaBar";
import { websiteGraph } from "@/lib/schema";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Analytics />
      <AttributionCapture />
      <SiteHeader />
      <main id="main-content">{children}</main>
      <SiteFooter />
      <StickyCtaBar />
      <JsonLd data={websiteGraph()} />
    </>
  );
}
