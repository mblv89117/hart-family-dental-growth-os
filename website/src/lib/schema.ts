import { locations } from "@/lib/locations";
import { serviceCategories, services } from "@/lib/services";
import { site } from "@/lib/site";

/** Organization + Website + SearchAction for sitewide knowledge graph. */
export function websiteGraph() {
  const orgId = `${site.domain}/#organization`;
  const websiteId = `${site.domain}/#website`;

  return [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "@id": orgId,
      name: site.brand,
      legalName: site.legalName,
      url: site.domain,
      logo: {
        "@type": "ImageObject",
        url: `${site.domain}${site.logo.mark}`,
        width: 512,
        height: 512,
      },
      image: `${site.domain}${site.logo.ogImage}`,
      sameAs: [
        "https://www.facebook.com/hartfamilydentalyv/",
        "https://www.facebook.com/hartfamilydentaldhs/",
      ],
      contactPoint: locations.map((loc) => ({
        "@type": "ContactPoint",
        telephone: loc.phone,
        contactType: "customer service",
        areaServed: loc.city,
        availableLanguage: loc.languages,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": websiteId,
      url: site.domain,
      name: site.brand,
      description: site.description,
      publisher: { "@id": orgId },
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${site.domain}/services?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
  ];
}

export function dentistLocationSchema(location: (typeof locations)[number]) {
  const sameAs = [
    location.social.facebook,
    location.social.yelp,
    location.social.googleBusinessProfile,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": ["Dentist", "LocalBusiness", "MedicalBusiness"],
    "@id": `${site.domain}${location.path}#dentist`,
    name: location.name,
    description: location.metaDescription,
    telephone: location.phone,
    email: location.leadNotifyEmail,
    faxNumber: location.fax,
    url: `${site.domain}${location.path}`,
    logo: `${site.domain}${site.logo.mark}`,
    image: `${site.domain}${site.logo.ogImage}`,
    priceRange: "$$",
    currenciesAccepted: "USD",
    paymentAccepted: location.paymentMethods.join(", "),
    address: {
      "@type": "PostalAddress",
      streetAddress: location.street,
      addressLocality: location.city,
      addressRegion: location.state,
      postalCode: location.zip,
      addressCountry: "US",
    },
    ...(sameAs.length ? { sameAs } : {}),
    openingHoursSpecification: location.openingHoursSpecification.map((spec) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: spec.dayOfWeek,
      opens: spec.opens,
      closes: spec.closes,
    })),
    areaServed: location.serviceArea.map((name) => ({
      "@type": "City",
      name,
    })),
    medicalSpecialty: "https://schema.org/Dentistry",
    availableLanguage: location.languages,
    isAcceptingNewPatients: location.acceptingNewPatients,
    parentOrganization: {
      "@type": "Organization",
      name: site.brand,
      url: site.domain,
    },
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

export function serviceSchema(input: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    description: input.description,
    url: input.url,
    provider: {
      "@type": "Dentist",
      name: site.brand,
      url: site.domain,
    },
    areaServed: locations.map((loc) => ({
      "@type": "City",
      name: loc.city,
    })),
  };
}

/** Machine-readable knowledge graph for AI marketing agents (no PII beyond public NAP). */
export function publicKnowledgeGraph() {
  return {
    version: "1.0",
    generatedAt: new Date().toISOString(),
    brand: {
      name: site.brand,
      legalName: site.legalName,
      domain: site.domain,
      tagline: site.tagline,
      description: site.description,
      npi: site.npi,
    },
    locations: locations.map((loc) => ({
      id: loc.id,
      name: loc.name,
      path: loc.path,
      nap: {
        street: loc.street,
        city: loc.city,
        state: loc.state,
        zip: loc.zip,
        phone: loc.phone,
        fax: loc.fax,
        email: loc.leadNotifyEmail,
      },
      hours: loc.hours,
      hoursNote: loc.hoursNote,
      serviceArea: loc.serviceArea,
      languages: loc.languages,
      paymentMethods: loc.paymentMethods,
      financingCurrent: loc.financingCurrent,
      financingComingSoon: loc.financingComingSoon,
      acceptingNewPatients: loc.acceptingNewPatients,
      sameDayAppointments: loc.sameDayAppointments,
      emergencyAppointments: loc.emergencyAppointments,
      landmarks: loc.landmarks,
      parkingNote: loc.parkingNote,
      social: loc.social,
    })),
    serviceCategories: serviceCategories.map((c) => ({
      id: c.id,
      slug: c.slug,
      title: c.title,
      description: c.description,
      path: `/services/${c.slug}`,
      services: c.serviceSlugs,
    })),
    services: services.map((s) => ({
      slug: s.slug,
      title: s.title,
      categoryId: s.categoryId,
      description: s.description,
      path: `/services/${s.slug}`,
    })),
  };
}
