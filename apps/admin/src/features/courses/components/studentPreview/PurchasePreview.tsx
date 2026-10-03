"use client";

import {Button, Icon} from "@mcc/ui";

/**
 * What a student sees BEFORE enrolling -- the course / exam program page with
 * its cover, title, description, price and an Enrol button (a port of the
 * learner app's BuyCourse and BuyExam). The button does nothing here.
 * Price tiers appear for students only once prices are published from
 * Finance > Pricing, so they are not shown in this preview.
 */
export default function PurchasePreview({
  breadcrumbRoot,
  title,
  description,
  coverUrl,
  price,
  ctaLabel,
  ctaFreeLabel,
}: {
  breadcrumbRoot: string;
  title: string;
  description?: string;
  coverUrl?: string | null;
  price: number;
  ctaLabel: string;
  ctaFreeLabel: string;
}) {
  const isFree = !price;

  return (
    <section className="px-4 pb-5">
      <nav className="flex items-center gap-1 text-sm py-8">
        <span className="text-subtle">{breadcrumbRoot}</span>
        <span className="text-subtle">/</span>
        <span className="text-muted/50 cursor-default text-nowrap truncate">{title}</span>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="pb-8">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
            {coverUrl && <img src={coverUrl} alt={title} className="w-full h-full object-cover" />}
          </div>

          <div className="mt-8 flex flex-col gap-2 max-w-[60%] max-sm:max-w-full">
            <h1 className="text-3xl font-bold leading-tight">{title}</h1>
            {description && <p className="text-sm text-subtle leading-relaxed">{description}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <p className="text-4xl font-bold">
            {isFree ? (
              "Free"
            ) : (
              <>
                <span className="text-2xl align-super font-semibold">₦</span>
                {price.toLocaleString()}
              </>
            )}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <Button width="fit" onClick={() => {}} title="Students enrol here">
              <p className="font-semibold flex items-center gap-2 mx-auto w-fit px-4">
                <Icon icon="solar:cart-large-2-bold" size={18} color="white" />
                <span>{isFree ? ctaFreeLabel : ctaLabel}</span>
              </p>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
