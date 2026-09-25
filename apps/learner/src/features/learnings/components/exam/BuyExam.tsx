"use client";
import {useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {extractApiError} from "@mcc/api";
import {useAuthStore} from "@mcc/store";
import {Button, Icon} from "@mcc/ui";
import {useRegisterForProgram} from "@/src/features/exams/hooks/useExams";
import {ApiExamProgram} from "@/src/features/exams/services/exam.service";
import {TierPicker} from "@/src/features/components/TierPicker";

const FALLBACK_IMAGE = "/assets/images/tower.jpg";

/**
 * The not-yet-registered preview/purchase screen for an exam-prep program --
 * the exam-prep equivalent of ../course/BuyCourse.tsx. Only fields that
 * actually exist on the real catalogue
 * (app/features/academics/exams/schemas.py::ProgramCatalogueItem) are shown.
 */
export default function BuyExam({program}: {program: ApiExamProgram}) {
  const router = useRouter();
  const email = useAuthStore((s) => s.user?.email);
  const registerForProgram = useRegisterForProgram();
  const [error, setError] = useState<string | null>(null);

  const title = [program.exam_name, program.subject_name].filter(Boolean).join(" — ") ||
    "Exam prep program";
  const price = Number(program.price);
  const isFree = !price;
  const tiers = program.tier_prices ?? [];
  // The catalogue's flat price is always the default tier's price, so
  // that's the sensible pre-selected choice.
  const [selectedTierId, setSelectedTierId] = useState<string | null>(
    () => tiers.find((t) => Number(t.price) === price)?.tier_id ?? tiers[0]?.tier_id ?? null,
  );
  const selectedPrice = tiers.find((t) => t.tier_id === selectedTierId)?.price ?? price;

  const handleRegister = () => {
    setError(null);
    registerForProgram.mutate(
      {
        programId: program.program_id,
        email: email || undefined,
        tierId: selectedTierId ?? undefined,
      },
      {
        onSuccess: (result) => {
          if (result.checkout_url) {
            window.location.href = result.checkout_url;
            return;
          }
          router.push("/learnings/exams");
        },
        onError: (err) =>
          setError(extractApiError(err, "Couldn't start registration. Please try again.")),
      },
    );
  };

  return (
    <section className="px-4 pb-5">
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings/exams" className="text-subtle hover:underline">
          Exam prep
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default text-nowrap truncate">
          {title}
        </span>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="pb-8">
          <div className="w-full aspect-video rounded-2xl overflow-hidden bg-amber-800">
            <img
              src={program.cover_image_url || FALLBACK_IMAGE}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="mt-8 flex flex-col gap-2 max-w-[60%] max-sm:max-w-full">
            <h1 className="text-3xl font-bold leading-tight">{title}</h1>
            {program.description && (
              <p className="text-sm text-subtle leading-relaxed">{program.description}</p>
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
            <Button onClick={handleRegister} disabled={registerForProgram.isPending} width="fit">
              <p className="font-semibold flex items-center gap-2 mx-auto w-fit px-4">
                <Icon icon="solar:cart-large-2-bold" size={18} color="white" />
                <span>
                  {registerForProgram.isPending
                    ? "Starting registration…"
                    : isFree
                      ? "Register for free"
                      : "Register"}
                </span>
              </p>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
