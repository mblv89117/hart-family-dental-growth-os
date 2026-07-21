import type { Metadata } from "next";
import { LegalDoc } from "@/components/PageHero";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy">
      <p>
        <strong>Draft for legal review.</strong> Hart Family Dental / Harry Hart Dental Corporation operates dental
        offices in Yucca Valley and Desert Hot Springs, California.
      </p>
      <p>
        We collect contact and appointment request details you submit, technical analytics data, and communications you
        send us. We use this information to respond to requests, operate the website, send appointment-related messages,
        and — where you consent — practice updates.
      </p>
      <p>
        Do not submit sensitive medical details through marketing forms. Clinical records are governed by our HIPAA Notice
        of Privacy Practices at the office.
      </p>
      <p>
        SMS: By providing your mobile number and consenting, you agree to receive appointment-related texts. Message/data
        rates may apply. Reply STOP to opt out, HELP for help. Consent is not a condition of purchase or treatment.
      </p>
      <p>Email: You may unsubscribe from marketing email at any time.</p>
      <p>Contact: Yucca Valley (760) 365-6595 · Desert Hot Springs (760) 329-6713.</p>
    </LegalDoc>
  );
}
