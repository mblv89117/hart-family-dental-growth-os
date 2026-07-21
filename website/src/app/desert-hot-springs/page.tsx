import type { Metadata } from "next";
import { LocationPage } from "@/components/LocationPage";
import { getLocation } from "@/lib/locations";

const location = getLocation("desert-hot-springs")!;

export const metadata: Metadata = {
  title: "Dentist in Desert Hot Springs",
  description:
    "Hart Family Dental in Desert Hot Springs — welcoming dental care at 11523 Palm Drive. Call (760) 329-6713.",
};

export default function Page() {
  return <LocationPage location={location} />;
}
