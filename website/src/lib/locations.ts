export type LocationId = "yucca-valley" | "desert-hot-springs";

export type Location = {
  id: LocationId;
  name: string;
  shortName: string;
  slug: string;
  /** Canonical public path, e.g. /locations/yucca-valley */
  path: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneHref: string;
  fax?: string;
  mapQuery: string;
  directionsUrl: string;
  mapEmbedUrl: string;
  /** Public office inbox used for patient email + lead routing */
  email: string;
  emailHref: string;
  /** Nearby communities / recognizable area context — derived from service area, not invented POIs */
  landmarks: string[];
  /** Parking guidance — call-ahead for accessibility; no unconfirmed lot claims */
  parkingNote: string;
  serviceArea: string[];
  leadNotifyEmail: string;
  languages: string[];
  paymentMethods: string[];
  /** Professional statement — offices do not currently accept insurance */
  insuranceNote: string;
  financingCurrent: string[];
  financingComingSoon: string[];
  membershipComingSoon: string;
  acceptingNewPatients: boolean;
  sameDayAppointments: boolean;
  emergencyAppointments: boolean;
  emergencyNote: string;
  lastPatientAppointment: string;
  hours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  hoursNote: string;
  openingHoursSpecification: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
  social: {
    facebook?: string;
    yelp?: string;
    googleBusinessProfile?: string;
  };
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
};

export const leadOwner = {
  name: "Wendy Delgado",
  scope: "Both Yucca Valley and Desert Hot Springs desks",
};

export const paymentFinancingCopy =
  "Hart Family Dental currently accepts cash, credit cards, and debit cards. CareCredit financing is available for qualified applicants. Additional financing options and the Hart Family Dental Membership Plan are being developed and will be announced when available.";

export const insurancePublicNote =
  "Hart Family Dental does not currently accept dental insurance. Patients pay with cash, credit card, or debit card. Our team can discuss CareCredit financing for qualified applicants.";

const sharedPayment = ["Cash", "Credit card", "Debit card"] as const;
const sharedFinancingCurrent = ["CareCredit"] as const;
const sharedFinancingComingSoon = ["Cherry", "Sunbit"] as const;
const membershipComingSoon = "Hart Family Dental Membership Plan";

export const locations: Location[] = [
  {
    id: "desert-hot-springs",
    name: "Hart Family Dental — Desert Hot Springs",
    shortName: "Desert Hot Springs",
    slug: "desert-hot-springs",
    path: "/locations/desert-hot-springs",
    street: "11523 Palm Drive",
    city: "Desert Hot Springs",
    state: "CA",
    zip: "92240",
    phone: "(760) 314-4160",
    phoneHref: "tel:+17603144160",
    fax: "(760) 329-1088",
    mapQuery: "11523 Palm Drive, Desert Hot Springs, CA 92240",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent("11523 Palm Drive, Desert Hot Springs, CA 92240"),
    mapEmbedUrl:
      "https://www.google.com/maps?q=" +
      encodeURIComponent("11523 Palm Drive, Desert Hot Springs, CA 92240") +
      "&output=embed",
    email: "hartdental02@hotmail.com",
    emailHref: "mailto:hartdental02@hotmail.com",
    leadNotifyEmail: "hartdental02@hotmail.com",
    landmarks: [
      "Palm Drive corridor in Desert Hot Springs",
      "Convenient for patients from Palm Springs and Cathedral City",
      "Serves the northwest Coachella Valley and Sky Valley area",
    ],
    parkingNote:
      "Contact the office if you need assistance locating the entrance or planning your visit.",
    serviceArea: [
      "Desert Hot Springs",
      "Palm Springs",
      "Cathedral City",
      "Palm Desert",
      "Rancho Mirage",
      "Sky Valley",
    ],
    languages: ["English", "Spanish"],
    paymentMethods: [...sharedPayment],
    insuranceNote: insurancePublicNote,
    financingCurrent: [...sharedFinancingCurrent],
    financingComingSoon: [...sharedFinancingComingSoon],
    membershipComingSoon,
    acceptingNewPatients: true,
    sameDayAppointments: true,
    emergencyAppointments: false,
    emergencyNote:
      "Emergency appointments are not currently available at the Desert Hot Springs office. For urgent tooth pain or a broken tooth during business hours, call us and we will help you with the soonest available option. For life-threatening emergencies, call 911.",
    lastPatientAppointment: "3:30 PM",
    hours: {
      monday: "Closed",
      tuesday: "Closed",
      wednesday: "8:00 AM – 4:00 PM",
      thursday: "Closed",
      friday: "Closed",
      saturday: "Closed",
      sunday: "Closed",
    },
    hoursNote: "Wednesday 8:00 AM–4:00 PM · Last patient appointment 3:30 PM · Closed other days",
    openingHoursSpecification: [
      {
        dayOfWeek: "Wednesday",
        opens: "08:00",
        closes: "16:00",
      },
    ],
    social: {
      facebook: "https://www.facebook.com/hartfamilydentaldhs/",
      yelp: "https://www.yelp.com/biz/hart-family-dental-desert-hot-springs",
      googleBusinessProfile: "https://share.google/rZOWsM5Bf0Fmiu4yU",
    },
    h1: "Hart Family Dental in Desert Hot Springs, CA",
    metaTitle: "Dentist in Desert Hot Springs, CA",
    metaDescription:
      "Hart Family Dental in Desert Hot Springs offers general dentistry, restorative care, implants, and dentures. Call (760) 314-4160. New patients welcome; open Wednesdays.",
    intro:
      "Our Desert Hot Springs office on Palm Drive provides personalized dental care with English- and Spanish-speaking team members. New patients are welcome, and same-day appointments may be available depending on the schedule.",
  },
  {
    id: "yucca-valley",
    name: "Hart Family Dental — Yucca Valley",
    shortName: "Yucca Valley",
    slug: "yucca-valley",
    path: "/locations/yucca-valley",
    street: "56728 Twentynine Palms Highway",
    city: "Yucca Valley",
    state: "CA",
    zip: "92284",
    phone: "(760) 389-7707",
    phoneHref: "tel:+17603897707",
    fax: "(760) 365-7203",
    mapQuery: "56728 Twentynine Palms Highway, Yucca Valley, CA 92284",
    directionsUrl:
      "https://www.google.com/maps/dir/?api=1&destination=" +
      encodeURIComponent("56728 Twentynine Palms Highway, Yucca Valley, CA 92284"),
    mapEmbedUrl:
      "https://www.google.com/maps?q=" +
      encodeURIComponent("56728 Twentynine Palms Highway, Yucca Valley, CA 92284") +
      "&output=embed",
    email: "hartdentalyv@hotmail.com",
    emailHref: "mailto:hartdentalyv@hotmail.com",
    leadNotifyEmail: "hartdentalyv@hotmail.com",
    landmarks: [
      "Twentynine Palms Highway (Hwy 62) in Yucca Valley",
      "Convenient for patients from Joshua Tree and Twentynine Palms",
      "Serves Morongo Valley, Landers, and Pioneertown area families",
    ],
    parkingNote:
      "Contact the office if you need assistance locating the entrance or planning your visit.",
    serviceArea: [
      "Yucca Valley",
      "Joshua Tree",
      "Twentynine Palms",
      "Morongo Valley",
      "Landers",
      "Pioneertown",
    ],
    languages: ["English", "Spanish"],
    paymentMethods: [...sharedPayment],
    insuranceNote: insurancePublicNote,
    financingCurrent: [...sharedFinancingCurrent],
    financingComingSoon: [...sharedFinancingComingSoon],
    membershipComingSoon,
    acceptingNewPatients: true,
    sameDayAppointments: true,
    emergencyAppointments: true,
    emergencyNote:
      "Emergency appointments may be available at the Yucca Valley office, subject to availability and clinical evaluation. Call us to describe your concern so we can advise on the soonest appropriate visit. For life-threatening emergencies, call 911.",
    lastPatientAppointment: "3:30 PM",
    hours: {
      monday: "8:00 AM – 4:00 PM",
      tuesday: "8:00 AM – 4:00 PM",
      wednesday: "Closed",
      thursday: "Closed",
      friday: "Closed",
      saturday: "Closed",
      sunday: "Closed",
    },
    hoursNote: "Monday–Tuesday 8:00 AM–4:00 PM · Last patient appointment 3:30 PM · Closed other days",
    openingHoursSpecification: [
      {
        dayOfWeek: ["Monday", "Tuesday"],
        opens: "08:00",
        closes: "16:00",
      },
    ],
    social: {
      facebook: "https://www.facebook.com/hartfamilydentalyv/",
      yelp: "https://www.yelp.com/biz/hart-family-dental-yucca-valley",
      googleBusinessProfile: "https://share.google/VVNz381E66m6FcbUP",
    },
    h1: "Hart Family Dental in Yucca Valley, CA",
    metaTitle: "Dentist in Yucca Valley, CA",
    metaDescription:
      "Hart Family Dental in Yucca Valley offers general dentistry, restorative care, implants, and dentures. Call (760) 389-7707. New patients welcome; open Monday and Tuesday.",
    intro:
      "Our Yucca Valley office on Twentynine Palms Highway serves High Desert families with general, restorative, implant, and denture care. The team speaks English and Spanish, and emergency appointments may be available subject to clinical evaluation.",
  },
];

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}

export function getLocationById(id: string) {
  return locations.find((l) => l.id === id);
}

export function locationPath(loc: Pick<Location, "path" | "slug">) {
  return loc.path || `/locations/${loc.slug}`;
}
