export const IMPLANT_OFFER = {
  title: "$999 Implant + PMMA Flex Crown",
  fee: "$999",
  feeNote: "This is Hart Family Dental’s normal fee. It is not a sale, discount, or limited-time offer.",
  includes: [
    "implant fixture / placement",
    "abutment",
    "PMMA Flex Crown (provisional)",
    "local anesthesia",
    "surgical supplies and materials",
    "lab fees",
    "post-op / follow-up",
  ],
  pmmaProvisional:
    "The PMMA Flex Crown included in the $999 fee is a provisional (temporary) crown.",
  permanentCrownNotIncluded: "A permanent crown is not included in the $999 fee.",
  permanentCrownFee: "$1,100 additional",
  examCtRequired: "Exam + CT Scan is required and costs $100.",
  eligibility: "Clinical eligibility is determined after evaluation. Website information is not a diagnosis.",
  relatedPricing: [
    { label: "Simple extraction", fee: "$200" },
    { label: "Surgical extraction", fee: "$300" },
    { label: "Bone graft", fee: "$300 flat" },
  ],
  payment: "Cash, credit, and debit are accepted.",
  financing: "CareCredit financing is available for qualified applicants. Approval is never guaranteed.",
  forbiddenLanguage: ["sale", "special", "discount", "save", "limited time", "expires"],
} as const;

export const IMPLANT_OFFER_DISCLOSURE = [
  `${IMPLANT_OFFER.title} is Hart Family Dental’s normal fee for implant placement with a PMMA Flex Crown.`,
  IMPLANT_OFFER.pmmaProvisional,
  `${IMPLANT_OFFER.permanentCrownNotIncluded} A permanent crown is ${IMPLANT_OFFER.permanentCrownFee}.`,
  IMPLANT_OFFER.examCtRequired,
  IMPLANT_OFFER.eligibility,
  IMPLANT_OFFER.financing,
  IMPLANT_OFFER.payment,
].join(" ");

export function implantOfferContainsForbiddenLanguage(text: string): string[] {
  const blob = text.toLowerCase();
  return IMPLANT_OFFER.forbiddenLanguage.filter((term) => blob.includes(term));
}
