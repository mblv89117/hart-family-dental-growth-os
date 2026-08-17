import {
  IMPLANT_OFFER,
  IMPLANT_OFFER_DISCLOSURE,
} from "@/lib/implant-offer";

export function ImplantOfferDisclosure() {
  return (
    <section
      aria-labelledby="implant-offer-heading"
      className="rounded-[1.25rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow)] md:p-6"
    >
      <h2 id="implant-offer-heading" className="font-display text-2xl text-sky-deep">
        {IMPLANT_OFFER.title}
      </h2>
      <p className="mt-2 text-sm font-medium text-ink">{IMPLANT_OFFER.feeNote}</p>
      <p className="mt-3 text-sm text-ink-soft">{IMPLANT_OFFER_DISCLOSURE}</p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-sm font-semibold text-ink">Included in $999</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {IMPLANT_OFFER.includes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-ink">Not included / additional</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            <li>Permanent crown: {IMPLANT_OFFER.permanentCrownFee}</li>
            <li>{IMPLANT_OFFER.examCtRequired}</li>
            {IMPLANT_OFFER.relatedPricing.map((row) => (
              <li key={row.label}>
                {row.label}: {row.fee}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
