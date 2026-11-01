"use client";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {extractApiError} from "@mcc/api";
import {useAuthStore} from "@mcc/store";
import {Button, Icon} from "@mcc/ui";
import {useInitializeCoursePayment} from "@/src/features/courses/hooks/useCourses";
import {ApiCourse} from "@/src/features/courses/services/course.service";
import {FormatPicker} from "@/src/features/components/FormatPicker";
import {WhatYouGet} from "@/src/features/components/WhatYouGet";
import {defaultFormat, defaultTierId, priceOf, tiersFor, type LiveFormat} from "@/src/features/courses/helper/liveFormats";
import {useUnlockCourseWithGems} from "@/src/features/wallet/hooks/useWallet";
import {GemUnlockCard} from "@/src/features/components/GemUnlockCard";
import {coverFallback} from "@/src/features/components/coverFallback";

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
  const formats = course.formats ?? [];
  // Live teaching is optional: the buyer picks self-paced, a live group or 1-to-1, each priced on its own.
  const [format, setFormat] = useState<LiveFormat | null>(() => defaultFormat(formats));
  // Buyers do not choose a tier: every purchase is charged the admin's default tier, in whichever format they pick.
  const tierId = defaultTierId(formats, course.tier_prices, price);
  const selectedPrice = priceOf(tiersFor(formats, format, course.tier_prices), tierId, price);

  const unlock = useUnlockCourseWithGems();

  const handleUnlock = () => {
    setError(null);
    unlock.mutate(
      {courseId: course.course_id, tierId: tierId ?? undefined, liveFormat: format ? "self_paced" : undefined},
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
        tierId: tierId ?? undefined,
        liveFormat: format ?? undefined,
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

        <span className="text-subtle cursor-default text-nowrap truncate">
          {course.title}
        </span>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="pb-8">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
            <img
              src={course.cover_image_url || FALLBACK_IMAGE}
              alt={course.title}
              onError={coverFallback}
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

          {!isFree && <FormatPicker formats={formats} selected={format} tierId={tierId} onSelect={setFormat} />}

          <WhatYouGet kind="course" formats={formats} format={format} />

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

          {!isFree && (
            <GemUnlockCard price={Number(selectedPrice)} format={format} noun="course" pending={unlock.isPending} onUnlock={handleUnlock} />
          )}
        </div>
      </div>
    </section>
  );
}
