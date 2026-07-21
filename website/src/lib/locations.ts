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
    serviceArea: [
      "Yucca Valley",
      "Joshua Tree",
      "Twentynine Palms",
      "Morongo Valley",
      "Landers",
      "Pioneertown",
    ],
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
    serviceArea: [
      "Desert Hot Springs",
      "Palm Springs",
      "Cathedral City",
      "Palm Desert",
      "Rancho Mirage",
      "Sky Valley",
    ],
  },
];

export function getLocation(slug: string) {
  return locations.find((l) => l.slug === slug);
}
