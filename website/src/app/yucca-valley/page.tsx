import type { Metadata } from "next";
import { LocationPage } from "@/components/LocationPage";
import { getLocation } from "@/lib/locations";

const location = getLocation("yucca-valley")!;

export const metadata: Metadata = {
  title: "Dentist in Yucca Valley",
  description:
    "Hart Family Dental in Yucca Valley — family dentistry, implants, restorative care, and dentist-supervised straightening at 56728 Twentynine Palms Highway.",
};

export default function Page() {
  return <LocationPage location={location} />;
}
