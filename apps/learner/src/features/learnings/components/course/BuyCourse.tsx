"use client";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {extractApiError} from "@mcc/api";
import {useAuthStore} from "@mcc/store";
import {Button, Icon} from "@mcc/ui";
import {useInitializeCoursePayment} from "@/src/features/courses/hooks/useCourses";
import {ApiCourse} from "@/src/features/courses/services/course.service";
import {TierPicker} from "@/src/features/components/TierPicker";
import {useGemPacks, useUnlockCourseWithGems, useWalletBalance} from "@/src/features/wallet/hooks/useWallet";
import {courseGemCost} from "@/src/features/wallet/helper/wallet";

const FALLBACK_IMAGE = "/assets/images/tower.jpg";

/**
 * The not-yet-enrolled preview/purchase screen for a real course. Only
 * title, description, cover image, price and tier_prices actually exist on
 * the real catalogue (app/features/academics/courses/schemas.py::CatalogueCourse)
 * -- unlike this component's previous demo-data version, this doesn't invent
 * ratings, curricula, stats or features the backend doesn't provide.
 */
export default function BuyCourse({course}: {course: ApiCourse}) {
  const router = useRouter();
  const email = useAuthStore((s) => s.user?.email);
  const initializePayment = useInitializeCoursePayment();
  const [error, setError] = useState<string | null>(null);

  const price = Number(course.price);
  const isFree = !price;
  const tiers = course.tier_prices ?? [];
  // The catalogue's flat price is always the default tier's price, so that's
  // the sensible pre-selected choice.
  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    () => tiers.find((t) => Number(t.price) === price)?.tier_id ?? tiers[0]?.tier_id ?? null,
  );
  const selectedPrice = tiers.find((t) => t.tier_id === selectedTierId)?.price ?? price;

  const unlock = useUnlockCourseWithGems();
  const {data: balance} = useWalletBalance();
  const {data: packs} = useGemPacks();
  const gemCost = !isFree && packs ? courseGemCost(Number(selectedPrice), packs.naira_per_gem) : 0;
  const purchasedGems = balance?.purchased_gems ?? 0;
  const canUnlock = gemCost > 0 && purchasedGems >= gemCost;

  const handleUnlock = () => {
    setError(null);
    unlock.mutate(
      {courseId: course.course_id, tierId: selectedTierId ?? undefined},
      {
        onSuccess: () => router.push("/learnings"),
        onError: (err) => setError(extractApiError(err, "Couldn't unlock the course. Please try again.")),
      },
    );
  };

  const handleEnroll = () => {
    setError(null);
    initializePayment.mutate(
      {
        courseId: course.course_id,
        courseType: isFree ? "free" : "paid",
        email: email || undefined,
        tierId: selectedTierId ?? undefined,
      },
      {
        onSuccess: (result) => {
          if (result.checkout_url) {
            window.location.href = result.checkout_url;
            return;
          }
          router.push("/learnings");
        },
        onError: (err) =>
          setError(extractApiError(err, "Couldn't start enrollment. Please try again.")),
      },
    );
  };

  return (
    <section className="px-4 pb-5">
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default text-nowrap truncate">
          {course.title}
        </span>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="pb-8">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
            <img
              src={course.cover_image_url || FALLBACK_IMAGE}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-8 flex flex-col gap-2 max-w-[60%] max-sm:max-w-full">
            <h1 className="text-3xl font-bold leading-tight">{course.title}</h1>
            {course.description && (
              <p className="text-sm text-subtle leading-relaxed">{course.description}</p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-5 w-full">
          <p className="text-4xl font-bold">
            {isFree ? (
              "Free"
            ) : (
              <>
                <span className="text-2xl align-super font-semibold">₦</span>
                {Number(selectedPrice).toLocaleString()}
              </>
            )}
          </p>

          {!isFree && (
            <TierPicker tiers={tiers} selectedTierId={selectedTierId} onSelect={setSelectedTierId} />
          )}

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center gap-3 pt-1">
            <Button onClick={handleEnroll} disabled={initializePayment.isPending} width="fit">
              <p className="font-semibold flex items-center gap-2 mx-auto w-fit px-4">
                <Icon icon="solar:cart-large-2-bold" size={18} color="white" />
                <span>
                  {initializePayment.isPending
                    ? "Starting enrollment…"
                    : isFree
                      ? "Enroll for free"
                      : "Enroll course"}
                </span>
              </p>
            </Button>
          </div>

          {gemCost > 0 && (
            <div className="flex flex-col gap-2 rounded-2xl border border-muted/25 p-4">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Icon icon="ri:vip-diamond-fill" size={16} className="text-sky-500" />
                Or unlock it with {gemCost.toLocaleString()} gems
              </p>
              <p className="text-xs text-subtle">
                Only gems you bought can unlock a course. You have {purchasedGems.toLocaleString()} bought gem
                {purchasedGems === 1 ? "" : "s"}.
              </p>
              {canUnlock ? (
                <Button onClick={handleUnlock} disabled={unlock.isPending} width="fit" variant="outline">
                  <span className="px-4">{unlock.isPending ? "Unlocking…" : `Unlock for ${gemCost.toLocaleString()} gems`}</span>
                </Button>
              ) : (
                <Link href="/wallet" className="text-sm font-semibold text-violet-600 underline underline-offset-2">
                  Buy gems
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
