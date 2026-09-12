import { JsonLd } from "@/components/json-ld";
import type { FaqItem } from "@/lib/structured-data";
import { faqSchema } from "@/lib/structured-data";

/**
 * Renders a question-and-answer block and the matching FAQPage markup from the
 * same array. Search and answer engines discount FAQ schema that does not
 * appear on the page, so the two must never be authored separately.
 */
export function FaqSection({
  eyebrow,
  heading = "Common questions",
  id = "faq",
  items,
  schema = true,
}: {
  readonly eyebrow?: string;
  readonly heading?: string;
  readonly id?: string;
  readonly items: readonly FaqItem[];
  /** Set false when a parent page already emits the FAQPage node. */
  readonly schema?: boolean;
}) {
  return (
    <section aria-labelledby={`${id}-heading`} className="aeo-faq" id={id}>
      <div className="marketing-container aeo-faq__inner">
        <div className="aeo-faq__heading">
          {eyebrow ? <p className="section-index">{eyebrow}</p> : null}
          <h2 id={`${id}-heading`}>{heading}</h2>
        </div>
        <dl className="aeo-faq__list">
          {items.map((item) => (
            <div className="aeo-faq__item" key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      </div>
      {schema ? <JsonLd nodes={[faqSchema(items)]} /> : null}
    </section>
  );
}

/** Compact variant for documentation pages, which render inside `.docs-article`. */
export function DocsFaq({
  items,
  heading = "Frequently asked questions",
}: {
  readonly heading?: string;
  readonly items: readonly FaqItem[];
}) {
  return (
    <section aria-labelledby="docs-faq-heading" className="docs-section docs-faq" id="faq">
      <h2 id="docs-faq-heading">{heading}</h2>
      <dl className="docs-faq__list">
        {items.map((item) => (
          <div key={item.question}>
            <dt>{item.question}</dt>
            <dd>{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
