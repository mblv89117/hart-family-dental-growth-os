export type LocationId = "yucca-valley" | "desert-hot-springs";

export type Location = {
  id: LocationId;
  name: string;
  shortName: string;
  slug: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  phoneHref: string;
  fax?: string;
  mapQuery: string;
  serviceArea: string[];
  leadNotifyEmail: string;
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
  /** schema.org OpeningHoursSpecification-compatible day windows */
  openingHoursSpecification: Array<{
    dayOfWeek: string | string[];
    opens: string;
    closes: string;
  }>;
};

const optionAHours = {
  monday: "8:00 AM – 4:30 PM",
  tuesday: "8:00 AM – 4:30 PM",
  wednesday: "8:00 AM – 4:30 PM",
  thursday: "8:00 AM – 4:30 PM",
  friday: "9:00 AM – 2:00 PM",
  saturday: "Closed",
  sunday: "Closed",
} as const;

const optionANote =
  "Monday–Thursday 8:00 AM–4:30 PM · Friday 9:00 AM–2:00 PM · Saturday & Sunday Closed";

const optionAOpeningHours = [
  {
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday"],
    opens: "08:00",
    closes: "16:30",
  },
  {
    dayOfWeek: "Friday",
    opens: "09:00",
    closes: "14:00",
  },
];

export const leadOwner = {
  name: "Wendy Delgado",
  scope: "Both Yucca Valley and Desert Hot Springs desks",
};

export const locations: Location[] = [
  {
    id: "yucca-valley",
    name: "Hart Family Dental — Yucca Valley",
    shortName: "Yucca Valley",
    slug: "yucca-valley",
    street: "56728 Twentynine Palms Highway",
    city: "Yucca Valley",
    state: "CA",
    zip: "92284",
    phone: "(760) 365-6595",
    phoneHref: "tel:+17603656595",
    fax: "(760) 365-7203",
    mapQuery: "56728 Twentynine Palms Highway, Yucca Valley, CA 92284",
    leadNotifyEmail: "hartdentalyv@hotmail.com",
    serviceArea: [
      "Yucca Valley",
      "Joshua Tree",
      "Twentynine Palms",
      "Morongo Valley",
      "Landers",
      "Pioneertown",
    ],
    hours: { ...optionAHours },
    hoursNote: optionANote,
    openingHoursSpecification: optionAOpeningHours,
  },
  {
    id: "desert-hot-springs",
    name: "Hart Family Dental — Desert Hot Springs",
    shortName: "Desert Hot Springs",
    slug: "desert-hot-springs",
    street: "11523 Palm Drive",
    city: "Desert Hot Springs",
    state: "CA",
    zip: "92240",
    phone: "(760) 329-6713",
    phoneHref: "tel:+17603296713",
    fax: "(760) 329-1088",
    mapQuery: "11523 Palm Drive, Desert Hot Springs, CA 92240",
    leadNotifyEmail: "hartdental02@hotmail.com",
    serviceArea: [
      "Desert Hot Springs",
      "Palm Springs",
      "Cathedral City",
      "Palm Desert",
      "Rancho Mirage",
      "Sky Valley",
    ],
    hours: { ...optionAHours },
    hoursNote: optionANote,
    openingHoursSpecification: optionAOpeningHours,
  },
];

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}

export function getLocationById(id: string) {
  return locations.find((l) => l.id === id);
}
