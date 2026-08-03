import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, Prose } from "@/components/PageHero";
import { SectionHeading } from "@/components/Ui";
import { serviceCategories } from "@/lib/services";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dental Services",
  description:
    "General dentistry, restorative care, dentures, dental implants, and in-office technology in Desert Hot Springs and Yucca Valley.",
  alternates: {
    canonical: `${site.domain}/services`,
  },
  openGraph: {
    title: "Dental Services",
    description:
      "General dentistry, restorative care, dentures, dental implants, and in-office technology in Desert Hot Springs and Yucca Valley.",
    url: `${site.domain}/services`,
  },
};

export default function ServicesIndexPage() {
  return (
    <>
      <PageHero
        title="Dental services"
        body="Comprehensive care at our Desert Hot Springs and Yucca Valley offices — from new patient exams and family dentistry to implants, dentures, and digital imaging."
        primaryHref="/contact#request"
      />
      <Prose>
        <SectionHeading
          title="Browse by category"
          body="Select a category to learn more about specific treatments and request an appointment."
        />
        <ul className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {serviceCategories.map((cat) => (
            <li key={cat.id} className="py-6">
              <Link href={`/services/${cat.slug}`} className="group block">
                <h2 className="font-display text-2xl text-sky-deep transition group-hover:text-brand md:text-3xl">
                  {cat.title}
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-ink-soft">{cat.description}</p>
                <p className="mt-3 text-sm font-medium text-sage">View services →</p>
              </Link>
            </li>
          ))}
        </ul>
      </Prose>
    </>
  );
}
