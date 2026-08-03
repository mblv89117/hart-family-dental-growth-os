export type ServiceCategoryId =
  | "general-dentistry"
  | "restorative-dentistry"
  | "dentures"
  | "dental-implants"
  | "technology";

export type Service = {
  slug: string;
  title: string;
  categoryId: ServiceCategoryId;
  description: string;
  /** Optional supporting language merged from a duplicate label (e.g. Crowns → Dental Crowns) */
  supportingDescription?: string;
  isCategory?: boolean;
  metaTitle: string;
  metaDescription: string;
};

export type ServiceCategory = {
  id: ServiceCategoryId;
  slug: string;
  title: string;
  description: string;
  serviceSlugs: string[];
  metaTitle: string;
  metaDescription: string;
};

/**
 * Authoritative service copy from Hart Offices.docx.
 * Do not summarize or embellish; formatting-only edits allowed.
 */
export const serviceCategories: ServiceCategory[] = [
  {
    id: "general-dentistry",
    slug: "general-dentistry",
    title: "General Dentistry",
    description:
      "Hart Family Dental provides comprehensive dental care for individuals and families at every stage of life. Our services focus on prevention, early detection, restorative treatment, and maintaining healthy smiles for years to come.",
    serviceSlugs: [
      "tooth-pain-broken-teeth",
      "lost-crown",
      "new-patient-exams",
      "second-opinions",
      "family-dental-care",
    ],
    metaTitle: "General Dentistry",
    metaDescription:
      "General dentistry at Hart Family Dental in Desert Hot Springs and Yucca Valley, including new-patient exams, family care, second opinions, and urgent tooth concerns.",
  },
  {
    id: "restorative-dentistry",
    slug: "restorative-dentistry",
    title: "Restorative Dentistry",
    description:
      "Restorative dentistry repairs damaged teeth and replaces missing teeth to improve comfort, function, and appearance. Treatment may include fillings, crowns, bridges, inlays, onlays, dentures, implants, or a combination of services.",
    serviceSlugs: [
      "dental-crowns",
      "dental-bridges",
      "tooth-extractions",
      "inlays",
      "onlays",
      "full-mouth-reconstruction",
      "missing-tooth-replacement",
    ],
    metaTitle: "Restorative Dentistry",
    metaDescription:
      "Restorative dentistry including dental crowns, bridges, extractions, inlays, onlays, and missing-tooth replacement at Hart Family Dental.",
  },
  {
    id: "dentures",
    slug: "dentures",
    title: "Dentures",
    description:
      "Hart Family Dental provides full, partial, immediate, and implant-supported dentures, plus relines, adjustments, repairs, and replacements based on individual evaluation.",
    serviceSlugs: [
      "full-dentures",
      "partial-dentures",
      "immediate-dentures",
      "implant-supported-dentures",
      "denture-relines",
      "denture-adjustments",
      "denture-repairs",
      "replacement-dentures",
    ],
    metaTitle: "Dentures & Denture Repairs",
    metaDescription:
      "Full, partial, immediate, and implant-supported dentures, plus relines, adjustments, and repairs at Hart Family Dental in Desert Hot Springs and Yucca Valley.",
  },
  {
    id: "dental-implants",
    slug: "dental-implants",
    title: "Dental Implants",
    description:
      "Dental implants can replace one or more missing teeth and support crowns, bridges, or full-arch restorations. An implant consultation helps determine whether implants are appropriate for your oral health, goals, and budget.",
    serviceSlugs: [
      "single-dental-implants",
      "multiple-dental-implants",
      "full-arch-implants",
      "implant-crowns",
      "implant-supported-bridges",
      "implant-consultation",
      "bone-grafting",
    ],
    metaTitle: "Dental Implants",
    metaDescription:
      "Single, multiple, and full-arch dental implants, implant crowns and bridges, consultations, and bone grafting at Hart Family Dental.",
  },
  {
    id: "technology",
    slug: "technology",
    title: "Technology",
    description:
      "Hart Family Dental uses modern diagnostic technology, including 3D CBCT imaging and digital impressions, to support precise diagnosis and treatment planning.",
    serviceSlugs: ["3d-imaging-cbct", "digital-impressions"],
    metaTitle: "Dental Technology",
    metaDescription:
      "3D CBCT imaging and digital impressions supporting precise dental diagnosis and treatment planning at Hart Family Dental.",
  },
];

export const services: Service[] = [
  {
    slug: "tooth-pain-broken-teeth",
    title: "Tooth Pain and Broken Teeth",
    categoryId: "general-dentistry",
    description:
      "Tooth pain and broken teeth can make eating, speaking, and completing daily activities uncomfortable. Hart Family Dental evaluates the source of the problem and recommends appropriate treatment to relieve discomfort, protect the tooth, and prevent further damage.",
    metaTitle: "Tooth Pain and Broken Teeth",
    metaDescription:
      "Evaluation and treatment recommendations for tooth pain and broken teeth at Hart Family Dental in Desert Hot Springs and Yucca Valley.",
  },
  {
    slug: "lost-crown",
    title: "Lost Crown",
    categoryId: "general-dentistry",
    description:
      "A lost or loose dental crown can leave the underlying tooth sensitive and vulnerable to damage. Our team will examine the tooth and determine whether the crown can be reattached or if a replacement restoration is needed.",
    metaTitle: "Lost Crown",
    metaDescription:
      "Care for a lost or loose dental crown at Hart Family Dental. We evaluate whether reattachment or a replacement restoration is needed.",
  },
  {
    slug: "new-patient-exams",
    title: "New Patient Exams",
    categoryId: "general-dentistry",
    description:
      "A new patient exam provides a complete evaluation of your teeth, gums, bite, and overall oral health. The visit may include digital X-rays, a review of your dental and medical history, and a personalized treatment plan based on your needs and goals.",
    metaTitle: "New Patient Exams",
    metaDescription:
      "Schedule a new patient dental exam at Hart Family Dental in Desert Hot Springs or Yucca Valley. New patients are welcome.",
  },
  {
    slug: "second-opinions",
    title: "Second Opinions",
    categoryId: "general-dentistry",
    description:
      "A dental second opinion can help you better understand a diagnosis or recommended treatment. Our dentists will review your concerns, examine your oral health, and provide an independent explanation of the available options.",
    metaTitle: "Dental Second Opinions",
    metaDescription:
      "Request a dental second opinion at Hart Family Dental for an independent review of a diagnosis or recommended treatment.",
  },
  {
    slug: "family-dental-care",
    title: "Family Dental Care",
    categoryId: "general-dentistry",
    description:
      "Hart Family Dental provides comprehensive dental care for individuals and families at every stage of life. Our services focus on prevention, early detection, restorative treatment, and maintaining healthy smiles for years to come.",
    metaTitle: "Family Dental Care",
    metaDescription:
      "Family dental care for every stage of life at Hart Family Dental locations in Desert Hot Springs and Yucca Valley.",
  },
  {
    slug: "dental-crowns",
    title: "Dental Crowns",
    categoryId: "restorative-dentistry",
    description:
      "A dental crown is a custom-made restoration that covers and strengthens a damaged, weakened, or heavily restored tooth. Crowns can improve function, protect the remaining tooth structure, and restore a natural-looking appearance.",
    supportingDescription:
      "Crowns restore teeth that have been weakened by decay, fractures, large fillings, or root canal treatment. Each crown is designed to provide strength, stability, and a natural fit within your smile.",
    metaTitle: "Dental Crowns",
    metaDescription:
      "Custom dental crowns to strengthen damaged or weakened teeth and restore function and appearance at Hart Family Dental.",
  },
  {
    slug: "dental-bridges",
    title: "Dental Bridges",
    categoryId: "restorative-dentistry",
    description:
      "A dental bridge replaces one or more missing teeth using a custom restoration supported by neighboring teeth or dental implants. Bridges help restore your smile, improve chewing, and prevent nearby teeth from shifting.",
    supportingDescription:
      "Dental bridges fill gaps caused by missing teeth. They are designed to restore chewing function, support proper bite alignment, and create a complete, natural-looking smile.",
    metaTitle: "Dental Bridges",
    metaDescription:
      "Dental bridges to replace missing teeth, restore chewing function, and support a natural-looking smile at Hart Family Dental.",
  },
  {
    slug: "tooth-extractions",
    title: "Tooth Extractions",
    categoryId: "restorative-dentistry",
    description:
      "A tooth extraction may be recommended when a tooth is severely damaged, infected, impacted, or cannot be predictably restored. Our team carefully evaluates each case and focuses on providing a comfortable experience with clear aftercare instructions.",
    metaTitle: "Tooth Extractions",
    metaDescription:
      "Tooth extraction evaluations and care at Hart Family Dental when a tooth cannot be predictably restored.",
  },
  {
    slug: "inlays",
    title: "Inlays",
    categoryId: "restorative-dentistry",
    description:
      "A dental inlay is a custom-made restoration placed within the chewing surface of a damaged tooth. Inlays are often used when a standard filling may not provide enough strength but a full crown is not necessary.",
    metaTitle: "Dental Inlays",
    metaDescription:
      "Custom dental inlays for damaged chewing surfaces when a filling may not be enough and a full crown is not necessary.",
  },
  {
    slug: "onlays",
    title: "Onlays",
    categoryId: "restorative-dentistry",
    description:
      "A dental onlay repairs a larger portion of a damaged tooth, including one or more of its raised cusps. It preserves healthy tooth structure while providing additional strength and protection.",
    metaTitle: "Dental Onlays",
    metaDescription:
      "Dental onlays that repair larger portions of damaged teeth while preserving healthy tooth structure.",
  },
  {
    slug: "full-mouth-reconstruction",
    title: "Full Mouth Reconstruction",
    categoryId: "restorative-dentistry",
    description:
      "Full mouth reconstruction combines multiple restorative treatments to improve the health, function, comfort, and appearance of the entire mouth. Each treatment plan is customized based on the condition of the teeth, gums, bite, and jaw.",
    metaTitle: "Full Mouth Reconstruction",
    metaDescription:
      "Customized full mouth reconstruction combining restorative treatments based on individual evaluation at Hart Family Dental.",
  },
  {
    slug: "missing-tooth-replacement",
    title: "Missing Tooth Replacement",
    categoryId: "restorative-dentistry",
    description:
      "Replacing missing teeth can improve chewing, speech, facial support, and confidence. Depending on your needs, replacement options may include dental implants, bridges, partial dentures, or full dentures.",
    metaTitle: "Missing Tooth Replacement",
    metaDescription:
      "Missing tooth replacement options including implants, bridges, and dentures at Hart Family Dental.",
  },
  {
    slug: "full-dentures",
    title: "Full Dentures",
    categoryId: "dentures",
    description:
      "Full dentures replace all of the teeth in the upper arch, lower arch, or both. They are custom-designed to restore appearance and help patients speak and eat more comfortably.",
    metaTitle: "Full Dentures",
    metaDescription:
      "Custom full dentures to replace an entire upper or lower arch at Hart Family Dental in Desert Hot Springs and Yucca Valley.",
  },
  {
    slug: "partial-dentures",
    title: "Partial Dentures",
    categoryId: "dentures",
    description:
      "Partial dentures replace several missing teeth while preserving the remaining natural teeth. They are removable and designed to fit securely while restoring function and filling visible gaps.",
    metaTitle: "Partial Dentures",
    metaDescription:
      "Removable partial dentures that replace several missing teeth while preserving remaining natural teeth.",
  },
  {
    slug: "immediate-dentures",
    title: "Immediate Dentures",
    categoryId: "dentures",
    description:
      "Immediate dentures are placed shortly after the remaining teeth are removed, allowing patients to avoid going without teeth during the healing period. Adjustments or relining may be needed as the gums and bone change during recovery.",
    metaTitle: "Immediate Dentures",
    metaDescription:
      "Immediate dentures placed after tooth removal so patients can avoid going without teeth during healing.",
  },
  {
    slug: "implant-supported-dentures",
    title: "Implant-Supported Dentures",
    categoryId: "dentures",
    description:
      "Implant-supported dentures attach to dental implants for improved stability and retention. They can reduce movement while eating or speaking and may provide greater comfort than conventional removable dentures.",
    metaTitle: "Implant-Supported Dentures",
    metaDescription:
      "Implant-supported dentures for improved stability, retention, and comfort compared with conventional removable dentures.",
  },
  {
    slug: "denture-relines",
    title: "Denture Relines",
    categoryId: "dentures",
    description:
      "A denture reline reshapes the underside of a denture to improve its fit against the gums. Relining may be recommended when changes in the jaw or gum tissue cause a denture to feel loose or uncomfortable.",
    metaTitle: "Denture Relines",
    metaDescription:
      "Denture relines to improve fit when jaw or gum changes cause a denture to feel loose or uncomfortable.",
  },
  {
    slug: "denture-adjustments",
    title: "Denture Adjustments",
    categoryId: "dentures",
    description:
      "Denture adjustments help relieve pressure points, soreness, or uneven contact caused by changes in fit. Small modifications can improve comfort and help the denture function more effectively.",
    metaTitle: "Denture Adjustments",
    metaDescription:
      "Denture adjustments to relieve pressure points, soreness, or uneven contact and improve comfort.",
  },
  {
    slug: "denture-repairs",
    title: "Denture Repairs",
    categoryId: "dentures",
    description:
      "Cracked, chipped, or broken dentures may be repairable depending on the extent of the damage. Our team evaluates the denture and recommends the safest and most dependable repair option.",
    metaTitle: "Denture Repairs",
    metaDescription:
      "Evaluation and repair options for cracked, chipped, or broken dentures at Hart Family Dental.",
  },
  {
    slug: "replacement-dentures",
    title: "Replacement Dentures",
    categoryId: "dentures",
    description:
      "Dentures may need to be replaced when they become worn, damaged, loose, or no longer provide proper function. Replacement dentures are custom-made to improve fit, comfort, appearance, and stability.",
    metaTitle: "Replacement Dentures",
    metaDescription:
      "Custom replacement dentures when existing dentures are worn, damaged, loose, or no longer function properly.",
  },
  {
    slug: "single-dental-implants",
    title: "Single Dental Implants",
    categoryId: "dental-implants",
    description:
      "A single dental implant replaces one missing tooth without requiring support from neighboring teeth. The implant serves as an artificial tooth root and is restored with a custom implant crown.",
    metaTitle: "Single Dental Implants",
    metaDescription:
      "Single dental implants that replace one missing tooth and support a custom implant crown.",
  },
  {
    slug: "multiple-dental-implants",
    title: "Multiple Dental Implants",
    categoryId: "dental-implants",
    description:
      "Multiple dental implants can replace several missing teeth and support individual crowns or an implant-supported bridge. This approach provides a stable, long-term solution while helping preserve jawbone structure.",
    metaTitle: "Multiple Dental Implants",
    metaDescription:
      "Multiple dental implants to replace several missing teeth with crowns or an implant-supported bridge.",
  },
  {
    slug: "full-arch-implants",
    title: "Full-Arch Implants",
    categoryId: "dental-implants",
    description:
      "Full-arch implant treatment replaces an entire upper or lower row of teeth using a fixed or removable restoration supported by dental implants. It can provide greater stability and chewing ability than traditional dentures.",
    metaTitle: "Full-Arch Implants",
    metaDescription:
      "Full-arch dental implant treatment to replace an entire upper or lower row of teeth.",
  },
  {
    slug: "implant-crowns",
    title: "Implant Crowns",
    categoryId: "dental-implants",
    description:
      "An implant crown is the visible, tooth-shaped restoration attached to a dental implant. It is custom-designed to match the color, shape, and size of the surrounding teeth.",
    metaTitle: "Implant Crowns",
    metaDescription:
      "Custom implant crowns designed to match the color, shape, and size of surrounding teeth.",
  },
  {
    slug: "implant-supported-bridges",
    title: "Implant-Supported Bridges",
    categoryId: "dental-implants",
    description:
      "An implant-supported bridge replaces multiple missing teeth using dental implants for support. Because it does not rely on natural neighboring teeth, it can provide strong, stable, and natural-looking tooth replacement.",
    metaTitle: "Implant-Supported Bridges",
    metaDescription:
      "Implant-supported bridges that replace multiple missing teeth without relying on neighboring natural teeth.",
  },
  {
    slug: "implant-consultation",
    title: "Implant Consultation",
    categoryId: "dental-implants",
    description:
      "An implant consultation helps determine whether dental implants are appropriate for your oral health, goals, and budget. The visit may include an examination, digital imaging, a review of your medical history, and a discussion of treatment options.",
    metaTitle: "Implant Consultation",
    metaDescription:
      "Request a dental implant consultation at Hart Family Dental to review options based on your oral health and goals.",
  },
  {
    slug: "bone-grafting",
    title: "Bone Grafting",
    categoryId: "dental-implants",
    description:
      "Bone grafting helps rebuild areas of the jaw that have lost bone volume. It may be recommended before dental implant placement to create a stronger and more stable foundation.",
    metaTitle: "Bone Grafting",
    metaDescription:
      "Bone grafting to rebuild jawbone volume that may be recommended before dental implant placement.",
  },
  {
    slug: "3d-imaging-cbct",
    title: "3D Imaging (CBCT)",
    categoryId: "technology",
    description:
      "Cone beam computed tomography, or CBCT, creates detailed three-dimensional images of the teeth, jawbone, nerves, sinuses, and surrounding structures. These images support precise diagnosis and treatment planning for implants, extractions, and other procedures.",
    metaTitle: "3D Imaging (CBCT)",
    metaDescription:
      "CBCT 3D imaging for detailed views of teeth, jawbone, and surrounding structures to support treatment planning.",
  },
  {
    slug: "digital-impressions",
    title: "Digital Impressions",
    categoryId: "technology",
    description:
      "Digital impressions use a small handheld scanner to create a detailed three-dimensional model of your teeth and bite. They provide a comfortable alternative to traditional impression materials and can be used to design crowns, bridges, implants, dentures, and other restorations.",
    metaTitle: "Digital Impressions",
    metaDescription:
      "Digital dental impressions for comfortable, detailed 3D models used to design crowns, bridges, implants, and dentures.",
  },
];

export function getService(slug: string) {
  return services.find((s) => s.slug === slug);
}

export function getCategory(slug: string) {
  return serviceCategories.find((c) => c.slug === slug);
}

export function getServicesForCategory(categoryId: ServiceCategoryId) {
  return services.filter((s) => s.categoryId === categoryId);
}

export function servicePath(slug: string) {
  return `/services/${slug}`;
}

export function allServicePaths(): string[] {
  const categoryPaths = serviceCategories.map((c) => servicePath(c.slug));
  const servicePaths = services.map((s) => servicePath(s.slug));
  return [...categoryPaths, ...servicePaths];
}

/** Options for appointment forms — aligned to current service architecture */
export const appointmentServiceOptions = [
  "New patient visit",
  "Tooth pain / broken tooth",
  "General dentistry",
  "Restorative dentistry",
  "Dental crowns or bridges",
  "Dentures or denture repair",
  "Dental implants",
  "Implant consultation",
  "Technology / imaging question",
  "Financing information",
  "Other",
];

/** Old public routes → new canonical service or location paths (301). */
export const legacyRedirects: Record<string, string> = {
  "/yucca-valley": "/locations/yucca-valley",
  "/desert-hot-springs": "/locations/desert-hot-springs",
  "/dental-implants": "/services/dental-implants",
  "/full-mouth-dental-implants": "/services/full-arch-implants",
  "/restorative-dentistry": "/services/restorative-dentistry",
  "/emergency-dentistry": "/services/tooth-pain-broken-teeth",
  "/cosmetic-dentistry": "/services/general-dentistry",
  "/teeth-straightening": "/services/general-dentistry",
  "/smile-assessment": "/contact#request",
  "/cash-pay-dentistry": "/financing",
};
