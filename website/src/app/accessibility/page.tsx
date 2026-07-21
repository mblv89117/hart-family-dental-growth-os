import type { Metadata } from "next";
import { LegalDoc } from "@/components/PageHero";

export const metadata: Metadata = { title: "Accessibility Statement" };

export default function AccessibilityPage() {
  return (
    <LegalDoc title="Accessibility Statement">
      <p>
        Hart Family Dental aims to provide a website usable by people with disabilities and works toward WCAG 2.2 Level AA
        where feasible. If you encounter a barrier, call Yucca Valley (760) 365-6595 or Desert Hot Springs (760) 329-6713
        and we will help you obtain information or request an appointment another way.
      </p>
    </LegalDoc>
  );
}
