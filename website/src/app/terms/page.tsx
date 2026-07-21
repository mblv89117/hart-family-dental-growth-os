import type { Metadata } from "next";
import { LegalDoc } from "@/components/PageHero";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Use">
      <p>
        This website provides general information about Hart Family Dental. Content is not medical advice and does not
        create a dentist-patient relationship. Treatment decisions require evaluation by a licensed dentist. Services are
        subject to availability and clinical appropriateness.
      </p>
    </LegalDoc>
  );
}
