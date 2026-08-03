import { locationPath, locations } from "@/lib/locations";
import { serviceCategories, servicePath } from "@/lib/services";

export const site = {
  brand: "Hart Family Dental",
  legalName: "Harry Hart Dental Corporation",
  /** Canonical production URL — override with NEXT_PUBLIC_SITE_URL (e.g. https://hfdds.net). */
  domain: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hfdds.net",
  /** Long-term SEO domain (align after first cutover). */
  seoDomain: "https://hartfamilydds.com",
  interimDomain: "https://hfdds.net",
  tagline: "Care that lasts a lifetime",
  description:
    "Hart Family Dental provides general dentistry, restorative care, dental implants, dentures, CBCT imaging, and digital impressions in Desert Hot Springs and Yucca Valley.",
  homepageTitle: "Hart Family Dental | Dentist in Desert Hot Springs & Yucca Valley",
  homepageHeadline: "Comprehensive Dental Care for Healthy, Confident Smiles",
  homepageSupport:
    "Hart Family Dental provides personalized general, restorative, implant, and denture care at convenient locations in Desert Hot Springs and Yucca Valley.",
  logo: {
    horizontal: "/brand/hart-family-dental-logo-horizontal.png",
    horizontalSm: "/brand/hart-family-dental-logo-horizontal-800.png",
    /** Tight crop of horizontal lockup with white canvas removed (light UI). */
    horizontalLight: "/brand/hart-family-dental-logo-horizontal-light.png",
    horizontalLightSm: "/brand/hart-family-dental-logo-horizontal-light-880.png",
    mark: "/brand/hart-family-dental-logo-mark.png",
    markSm: "/brand/hart-family-dental-logo-mark-256.png",
    circular: "/brand/hart-family-dental-logo-circular.png",
    stackedTransparent: "/brand/hart-family-dental-logo-stacked-transparent.png",
    ogImage: "/brand/hart-family-dental-og-image.jpg",
    favicon: "/brand/hart-family-dental-favicon.png",
    appleTouchIcon: "/brand/hart-family-dental-apple-touch-icon.png",
  },
  npi: "1104492891",
};

export const nav = [
  { href: locationPath(locations.find((l) => l.id === "desert-hot-springs")!), label: "Desert Hot Springs" },
  { href: locationPath(locations.find((l) => l.id === "yucca-valley")!), label: "Yucca Valley" },
  { href: "/services", label: "Services" },
  { href: "/financing", label: "Payment" },
  { href: "/contact", label: "Contact" },
];

/** Homepage + nav service highlights — five categories from Hart Offices.docx */
export const services = serviceCategories.map((c) => ({
  href: servicePath(c.slug),
  title: c.title,
  blurb: c.description.split(".")[0] + ".",
}));

export const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/providers", label: "Providers" },
  { href: "/new-patients", label: "New patients" },
  { href: "/services", label: "Services" },
  { href: "/financing", label: "Payment & financing" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/accessibility", label: "Accessibility" },
];
