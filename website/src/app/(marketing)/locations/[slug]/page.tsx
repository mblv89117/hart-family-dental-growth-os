import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LocationPage } from "@/components/LocationPage";
import { getLocation, locations } from "@/lib/locations";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return locations.map((loc) => ({ slug: loc.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) {
    return {};
  }
  return {
    title: location.metaTitle,
    description: location.metaDescription,
    alternates: {
      canonical: `${site.domain}${location.path}`,
    },
    openGraph: {
      title: location.metaTitle,
      description: location.metaDescription,
      url: `${site.domain}${location.path}`,
      images: [{ url: site.logo.ogImage, width: 1200, height: 630, alt: site.brand }],
    },
    twitter: {
      card: "summary_large_image",
      title: location.metaTitle,
      description: location.metaDescription,
      images: [site.logo.ogImage],
    },
  };
}

export default async function LocationRoutePage({ params }: Props) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) {
    notFound();
  }
  return <LocationPage location={location} />;
}
