import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppointmentForm } from "@/components/AppointmentForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { PageHero, Prose } from "@/components/PageHero";
import { ConversionStrip, FaqList, SectionHeading } from "@/components/Ui";
import { locationPath, locations } from "@/lib/locations";
import { breadcrumbSchema, faqSchema, serviceSchema } from "@/lib/schema";
import {
  getCategory,
  getService,
  getServicesForCategory,
  serviceCategories,
  services,
} from "@/lib/services";
import { site } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  const categorySlugs = serviceCategories.map((c) => ({ slug: c.slug }));
  const serviceSlugs = services.map((s) => ({ slug: s.slug }));
  return [...categorySlugs, ...serviceSlugs];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (category) {
    return {
      title: category.metaTitle,
      description: category.metaDescription,
      alternates: { canonical: `${site.domain}/services/${category.slug}` },
      openGraph: {
        title: category.metaTitle,
        description: category.metaDescription,
        url: `${site.domain}/services/${category.slug}`,
        images: [{ url: site.logo.ogImage, width: 1200, height: 630, alt: site.brand }],
      },
      twitter: {
        card: "summary_large_image",
        title: category.metaTitle,
        description: category.metaDescription,
        images: [site.logo.ogImage],
      },
    };
  }
  const service = getService(slug);
  if (service) {
    return {
      title: service.metaTitle,
      description: service.metaDescription,
      alternates: { canonical: `${site.domain}/services/${service.slug}` },
      openGraph: {
        title: service.metaTitle,
        description: service.metaDescription,
        url: `${site.domain}/services/${service.slug}`,
        images: [{ url: site.logo.ogImage, width: 1200, height: 630, alt: site.brand }],
      },
      twitter: {
        card: "summary_large_image",
        title: service.metaTitle,
        description: service.metaDescription,
        images: [site.logo.ogImage],
      },
    };
  }
  return {};
}

function LocationLinks() {
  return (
    <ul className="mt-3 space-y-2 text-sm">
      {locations.map((loc) => (
        <li key={loc.id}>
          <Link className="text-sage hover:underline focus-ring rounded" href={locationPath(loc)}>
            {loc.shortName}
          </Link>
          <span className="text-ink-soft"> · </span>
          <a href={loc.phoneHref} className="text-ink-soft hover:text-ink focus-ring rounded">
            {loc.phone}
          </a>
        </li>
      ))}
    </ul>
  );
}

function categoryFaqs(title: string): { q: string; a: string }[] {
  return [
    {
      q: `Is ${title.toLowerCase()} available at both offices?`,
      a: "Yes. Hart Family Dental offers this category of care at both Desert Hot Springs and Yucca Valley. Hours and emergency availability differ by location.",
    },
    {
      q: "How do I know which treatment is right for me?",
      a: "A clinical exam and individual evaluation determine what is appropriate. Website information is educational and not a diagnosis or treatment approval.",
    },
    {
      q: "Do you offer financing?",
      a: "CareCredit financing is available for qualified applicants. Approval is never guaranteed. Cash, credit, and debit are accepted; additional options are coming soon.",
    },
  ];
}

function serviceFaqs(title: string): { q: string; a: string }[] {
  return [
    {
      q: `What should I expect when asking about ${title.toLowerCase()}?`,
      a: "We listen to your goals, review your oral health, and explain options clearly. Recommendations are based on an individual evaluation — not online forms alone.",
    },
    {
      q: "Can new patients request this service?",
      a: "Yes. New patients are welcome at both offices. Request a visit online or by phone and our team will help you find an available time.",
    },
    {
      q: "Is CareCredit available?",
      a: "CareCredit financing is available for qualified applicants. Terms and approval are determined by the lender and are never guaranteed.",
    },
  ];
}

function CategoryPage({ slug }: { slug: string }) {
  const category = getCategory(slug)!;
  const childServices = category.serviceSlugs
    .map((s) => getService(s))
    .filter((s): s is NonNullable<typeof s> => Boolean(s));
  const faqs = categoryFaqs(category.title);
  const url = `${site.domain}/services/${category.slug}`;

  return (
    <>
      <PageHero
        title={category.title}
        body={category.description}
        primaryHref="#request"
        secondaryHref="/financing"
        secondaryLabel="CareCredit & payment"
      />
      <Prose>
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/services", label: "Services" },
            { label: category.title },
          ]}
        />
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading
                title="Benefits"
                body="Prevention, comfort, and lasting function — with clear explanations before any treatment begins."
              />
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink-soft">
                <li>Care available at Desert Hot Springs and Yucca Valley</li>
                <li>English- and Spanish-speaking team</li>
                <li>Modern diagnostics including CBCT and digital impressions where appropriate</li>
                <li>Transparent discussion of payment and CareCredit options</li>
              </ul>
            </section>
            <section>
              <SectionHeading title="Services in this category" />
              <ul className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {childServices.map((svc) => (
                  <li key={svc.slug} className="py-4">
                    <Link
                      href={`/services/${svc.slug}`}
                      className="font-medium text-sage hover:underline focus-ring rounded"
                    >
                      {svc.title}
                    </Link>
                    <p className="mt-1 text-sm text-ink-soft">{svc.description.split("\n\n")[0]}</p>
                  </li>
                ))}
              </ul>
            </section>
            <section>
              <SectionHeading
                title="Locations"
                body="Care in this category is available at both Hart Family Dental offices."
              />
              <LocationLinks />
            </section>
            <ConversionStrip />
            <section>
              <SectionHeading title="Common questions" />
              <div className="mt-6">
                <FaqList items={faqs} />
              </div>
            </section>
            <p className="text-sm">
              <Link href="/services" className="text-sage hover:underline focus-ring rounded">
                ← All service categories
              </Link>
            </p>
          </div>
          <AppointmentForm heading="Request an appointment" />
        </div>
      </Prose>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: site.domain },
          { name: "Services", url: `${site.domain}/services` },
          { name: category.title, url },
        ])}
      />
      <JsonLd
        data={serviceSchema({
          name: category.title,
          description: category.description,
          url,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
    </>
  );
}

function ServiceDetailPage({ slug }: { slug: string }) {
  const service = getService(slug)!;
  const category = serviceCategories.find((c) => c.id === service.categoryId)!;
  const siblings = getServicesForCategory(service.categoryId).filter((s) => s.slug !== service.slug);
  const paragraphs = [
    service.description,
    ...(service.supportingDescription ? [service.supportingDescription] : []),
  ].flatMap((block) => block.split("\n\n").filter(Boolean));
  const faqs = serviceFaqs(service.title);
  const url = `${site.domain}/services/${service.slug}`;

  return (
    <>
      <PageHero
        title={service.title}
        body={paragraphs[0] ?? service.description}
        primaryHref="#request"
        secondaryHref="/financing"
        secondaryLabel="CareCredit & payment"
      />
      <Prose>
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/services", label: "Services" },
            { href: `/services/${category.slug}`, label: category.title },
            { label: service.title },
          ]}
        />
        <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-10">
            <section>
              <SectionHeading title="Procedure overview" />
              <div className="mt-4 max-w-3xl space-y-4 text-sm text-ink-soft">
                {paragraphs.map((para) => (
                  <p key={para.slice(0, 48)}>{para}</p>
                ))}
              </div>
            </section>
            <section>
              <SectionHeading
                title="Benefits"
                body="Comfort, function, and confidence — with recommendations based on your individual evaluation."
              />
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-ink-soft">
                <li>Clear explanation of options before treatment</li>
                <li>Available at both Desert Hot Springs and Yucca Valley</li>
                <li>Coordination with restorative, implant, or denture care when needed</li>
                <li>Payment and CareCredit discussion for qualified applicants</li>
              </ul>
            </section>
            <section>
              <SectionHeading title="Locations" body="This service is offered at both offices." />
              <LocationLinks />
            </section>
            {siblings.length > 0 ? (
              <section>
                <SectionHeading title="Related services" />
                <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-ink-soft">
                  {siblings.map((s) => (
                    <li key={s.slug}>
                      <Link className="text-sage hover:underline focus-ring rounded" href={`/services/${s.slug}`}>
                        {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <ConversionStrip />
            <section>
              <SectionHeading title="Common questions" />
              <div className="mt-6">
                <FaqList items={faqs} />
              </div>
            </section>
            <p className="text-sm">
              <Link href={`/services/${category.slug}`} className="text-sage hover:underline focus-ring rounded">
                ← {category.title}
              </Link>
            </p>
          </div>
          <AppointmentForm defaultService={service.title} heading="Request an appointment" />
        </div>
      </Prose>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: site.domain },
          { name: "Services", url: `${site.domain}/services` },
          { name: category.title, url: `${site.domain}/services/${category.slug}` },
          { name: service.title, url },
        ])}
      />
      <JsonLd
        data={serviceSchema({
          name: service.title,
          description: service.description.replace(/\n\n/g, " "),
          url,
        })}
      />
      <JsonLd data={faqSchema(faqs)} />
    </>
  );
}

export default async function ServiceSlugPage({ params }: Props) {
  const { slug } = await params;
  if (getCategory(slug)) {
    return <CategoryPage slug={slug} />;
  }
  if (getService(slug)) {
    return <ServiceDetailPage slug={slug} />;
  }
  notFound();
}
