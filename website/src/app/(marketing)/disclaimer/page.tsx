import type { Metadata } from "next";
import { LegalDoc } from "@/components/PageHero";

export const metadata: Metadata = { title: "Website Disclaimer" };

export default function DisclaimerPage() {
  return (
    <LegalDoc title="Website Disclaimer">
      <p>
        Information on this site is educational only. It is not a diagnosis, treatment recommendation, or guarantee of
        results. Individual outcomes vary. If you have a serious medical emergency, call 911.
      </p>
    </LegalDoc>
  );
}
