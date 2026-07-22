export const site = {
  brand: "Hart Family Dental",
  legalName: "Harry Hart Dental Corporation",
  /** Canonical production URL — override with NEXT_PUBLIC_SITE_URL (e.g. https://hfdds.net). */
  domain: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://hfdds.net",
  /** Long-term SEO domain (align after first cutover). */
  seoDomain: "https://hartfamilydds.com",
  interimDomain: "https://hfdds.net",
  tagline: "Approachable family dentistry. Advanced care when you need it.",
  description:
    "Hart Family Dental serves Yucca Valley and Desert Hot Springs with friendly family dentistry, dental implants, restorative care, and dentist-supervised teeth straightening.",
};

export const nav = [
  { href: "/yucca-valley", label: "Yucca Valley" },
  { href: "/desert-hot-springs", label: "Desert Hot Springs" },
  { href: "/dental-implants", label: "Implants" },
  { href: "/teeth-straightening", label: "Straightening" },
  { href: "/financing", label: "Financing" },
  { href: "/contact", label: "Contact" },
];

export const services = [
  {
    href: "/dental-implants",
    title: "Dental implants",
    blurb: "Replace missing teeth with options built for comfort, function, and confidence.",
  },
  {
    href: "/full-mouth-dental-implants",
    title: "Full-mouth implants",
    blurb: "Explore fuller smile restoration pathways with clear consult next steps.",
  },
  {
    href: "/teeth-straightening",
    title: "Dentist-supervised straightening",
    blurb: "A simpler path to a straighter smile — always with dentist oversight, never DIY.",
  },
  {
    href: "/cosmetic-dentistry",
    title: "Cosmetic dentistry",
    blurb: "Whitening, veneers, and smile refreshes when clinically appropriate.",
  },
  {
    href: "/restorative-dentistry",
    title: "Restorative dentistry",
    blurb: "Crowns, bridges, dentures, and care that helps you eat and smile comfortably.",
  },
  {
    href: "/emergency-dentistry",
    title: "Emergency dentistry",
    blurb: "Tooth pain, broken teeth, and urgent concerns — call us for the soonest opening.",
  },
];

export const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/providers", label: "Providers" },
  { href: "/new-patients", label: "New patients" },
  { href: "/smile-assessment", label: "Smile assessment" },
  { href: "/reviews", label: "Reviews" },
  { href: "/faq", label: "FAQ" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/accessibility", label: "Accessibility" },
];
