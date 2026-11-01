"use client";

import {useEffect, useRef, useState} from "react";
import Link from "next/link";
import {useQueryClient} from "@tanstack/react-query";
import {Button, confettiCelebrate, Icon, showError, showSuccess} from "@mcc/ui";
import {useForm, FormProvider} from "@mcc/features";
import ContentStep, {
  type Topic,
  hasCompleteContent,
} from "./CreateProgramSteps/Step2";
import PromotionalCoverUpload, {
  type UploadedFile,
  hasCompleteUpload,
} from "./CreateProgramSteps/Step3";
import CreateDetails from "./CreateProgramSteps/Step1";
import {serializeTopicsPayload, unfinishedLectureCount} from "../helper/content.mapper";
import {
  getApiErrorMessage,
  publishExamProgram,
  unpublishExamProgram,
} from "../services/exam.service";
import {useExamProgramEdit} from "../hooks/useExamPrograms";
import {useSaveProgramContent} from "../hooks/useSaveProgramContent";
import {isContentChanged} from "../helper/contentSave";
import ExamStudentView from "./studentPreview/ExamStudentView";
import {
  examProgramTitle,
  hasPreviewableExamContent,
} from "../helper/studentView";
import {useCatalogOptions} from "@/src/features/exam-catalog/hooks/useCatalog";

type Step = "details" | "content" | "upload";

const STEPS: {id: Step; label: string}[] = [
  {id: "details", label: "Details"},
  {id: "content", label: "Content"},
  {id: "upload", label: "Upload"},
];

export const LEVELS = [
  {id: "all", label: "All levels", fill: 0},
  {id: "beginner", label: "Beginner", fill: 0.33},
  {id: "intermediate", label: "Intermediate", fill: 0.66},
  {id: "advanced", label: "Advanced", fill: 1},
] as const;

// FORM TYPES

type Step1Values = {
  /** Backend-issued program id, set once Step1 has successfully created it. */
  id: string;
  exam: string;
  subject: string;
  category: string;
  instructor: string;
  price: string;
  level: (typeof LEVELS)[number]["id"];
  description: string;
  learnItems: string[];
  tags: string[];
};

export type ExamProgramFormValues = Step1Values & {
  /**
   * The content version this editor holds (from the server when the program was loaded, then from each save). Sent with
   * every content save so a save made from an out-of-date copy is refused instead of deleting newer work.
   */
  contentVersion?: number | null;
  content: {
    topics: Topic[];
  };
  upload: {
    coverImage: UploadedFile | null;
    promoVideo: UploadedFile | null;
    coverImageUrl?: string;
    promoVideoUrl?: string;
  };
};

// STEP 1

function Step1({onNext, live}: {onNext: () => void; live: boolean}) {
  return <CreateDetails onNext={onNext} live={live} />;
}

// STEP 2

function Step2({
  onNext,
  onBack,
  exam,
  subject,
  programId,
}: {
  onNext: () => void;
  onBack: () => void;
  exam: string;
  subject: string;
  programId: string;
}) {
  return (
    <div className="mt-5 h-full rounded-xl border border-muted/20 p-6">
      <ContentStep
        onNext={onNext}
        onBack={onBack}
        exam={exam}
        subject={subject}
        programId={programId}
      />
    </div>
  );
}

// STEP 3

function Step3({
  onBack,
  exam,
  subject,
  isPublished,
}: {
  onBack: () => void;
  exam: string;
  subject: string;
  isPublished: boolean;
}) {
  return (
    <div className="flex flex-col h-full mt-5 rounded-xl border border-muted/20 p-6">
      <PromotionalCoverUpload
        exam={exam}
        subject={subject}
        isPublished={isPublished}
      />

      {!isPublished && (
        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-5">
          <Button type="button" onClick={onBack} variant={"ghost"}>
            Back
          </Button>
        </div>
      )}
    </div>
  );
}

// ROOT FORM SHELL

export default function CreateExamProgramForm({editId}: {editId?: string}) {
  const [activeStep, setActiveStep] = useState<Step>("details");
  const queryClient = useQueryClient();
  const {
    data: existing,
    isLoading: isLoadingExisting,
    isError: isExistingError,
    isFetchedAfterMount: existingIsFresh,
    refetch: refetchExisting,
  } = useExamProgramEdit(editId);

  const methods = useForm<ExamProgramFormValues>({
    mode: "onChange",
    defaultValues: {
      id: "",
      exam: "",
      subject: "",
      category: "",
      instructor: "",
      price: "",
      level: "all",
      description: "",
      learnItems: [],
      tags: [],
      contentVersion: null,
      content: {topics: []},
      upload: {coverImage: null, promoVideo: null},
    },
  });

  const saveContent = useSaveProgramContent(methods as unknown as Parameters<typeof useSaveProgramContent>[0]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUnpublishing, setIsUnpublishing] = useState(false);
  const [previewView, setPreviewView] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);
  // The server refused a save because the content changed since this page opened: the only way on is to reload.
  const [contentChanged, setContentChanged] = useState(false);
  const [pricingBannerDismissed, setPricingBannerDismissed] = useState(false);
  const programId = methods.watch("id");

  // Load the program into the form once. Without the guard, a background
  // refetch (e.g. window focus after a file picker) would reset the form and
  // silently discard unsaved edits.
  const loadedIdRef = useRef<string | null>(null);
  useEffect(() => {
    // Only from a copy fetched since this page opened, never one the query cache kept from an earlier visit: that copy is
    // the program as it was then, and saving a form filled from it deletes everything added since.
    if (existing && existingIsFresh && loadedIdRef.current !== editId) {
      methods.reset(existing.values);
      loadedIdRef.current = editId ?? null;
    }
  }, [existing, existingIsFresh, editId, methods]);

  // A live program can be edited in place, like a course: what is saved is
  // what students see, so the header offers "Save changes" instead of "Publish".
  const isLive = existing?.status === "published";
  const [isSavingLive, setIsSavingLive] = useState(false);

  const examOptions = useCatalogOptions("types", methods.watch("exam")).options;
  const subjectOptions = useCatalogOptions("subjects", methods.watch("subject")).options;
  const examName =
    examOptions.find((o) => o.value === methods.watch("exam"))?.label ?? "";
  const subjectName =
    subjectOptions.find((o) => o.value === methods.watch("subject"))?.label ?? "";

  const activeIndex = STEPS.findIndex((s) => s.id === activeStep);

  const topics = methods.watch("content.topics") ?? [];
  const upload = methods.watch("upload") ?? {
    coverImage: null,
    promoVideo: null,
  };
  const isDetailsComplete = methods.formState.isValid;
  const isContentComplete = hasCompleteContent(topics);
  const isUploadComplete = hasCompleteUpload(upload);
  const canPublish = isDetailsComplete && isContentComplete && isUploadComplete;
  const [isPublished, setIsPublished] = useState(false);

  async function handleUnpublish() {
    if (!programId) return;
    setIsUnpublishing(true);
    try {
      await unpublishExamProgram(programId);
      showSuccess("Moved back to drafts. Students can no longer see it.");
      queryClient.invalidateQueries({queryKey: ["exam-programs"]});
      await refetchExisting();
    } catch (error) {
      showError(
        getApiErrorMessage(error, "Failed to unpublish. Please try again."),
      );
    } finally {
      setIsUnpublishing(false);
    }
  }

  /** Saves the content, cover image and promo video the form holds (what Publish and Save changes both need). */
  async function saveContentAndMedia(programId: string) {
    const values = methods.getValues();
    // Patch the cover image / promo video (and re-send content, in case
    // Step2 was left with unsaved edits).
    await saveContent(programId, {
      topics: serializeTopicsPayload(values.content.topics),
      cover_image_url:
        values.upload.coverImageUrl ||
        values.upload.coverImage?.remoteUrl ||
        values.upload.coverImage?.previewUrl,
      promo_video_url:
        values.upload.promoVideoUrl ||
        values.upload.promoVideo?.remoteUrl ||
        values.upload.promoVideo?.previewUrl,
    });
  }

  /** The reasons the form cannot be saved as it is, or null. */
  function blockingProblem(): string | null {
    if (!methods.getValues("id")) {
      return "Missing exam program id — go back and complete Details first.";
    }
    const unfinished = unfinishedLectureCount(methods.getValues("content.topics"));
    if (unfinished > 0) {
      return `Wait for ${unfinished === 1 ? "a lecture" : `${unfinished} lectures`} to finish uploading before ${isLive ? "saving" : "publishing"}.`;
    }
    return null;
  }

  async function handlePublish() {
    if (!canPublish) return;

    const problem = blockingProblem();
    if (problem) {
      setPublishError(problem);
      return;
    }
    const programId = methods.getValues("id") as string;

    setPublishError(null);
    setIsPublishing(true);

    try {
      await saveContentAndMedia(programId);

      await publishExamProgram(programId);
      queryClient.invalidateQueries({queryKey: ["exam-programs"]});
      queryClient.invalidateQueries({queryKey: ["exam-program"]});

      confettiCelebrate(undefined, 1000, 300);
      setIsPublished(true);
    } catch (error) {
      setContentChanged(isContentChanged(error));
      setPublishError(
        getApiErrorMessage(
          error,
          "Failed to publish exam program. Please try again.",
        ),
      );
    } finally {
      setIsPublishing(false);
    }
  }

  /** A live program: save what is on screen. It stays published. */
  async function handleSaveLive() {
    if (!canPublish) return;

    const problem = blockingProblem();
    if (problem) {
      setPublishError(problem);
      return;
    }
    const programId = methods.getValues("id") as string;

    setPublishError(null);
    setIsSavingLive(true);
    try {
      await saveContentAndMedia(programId);
      queryClient.invalidateQueries({queryKey: ["exam-programs"]});
      queryClient.invalidateQueries({queryKey: ["exam-program"]});
      await refetchExisting();
      showSuccess("Changes saved. Students can see them now.");
    } catch (error) {
      setContentChanged(isContentChanged(error));
      setPublishError(
        getApiErrorMessage(error, "Failed to save your changes. Please try again."),
      );
    } finally {
      setIsSavingLive(false);
    }
  }

  function goNext() {
    const next = STEPS[activeIndex + 1];
    if (next) setActiveStep(next.id);
  }

  function goBack() {
    const prev = STEPS[activeIndex - 1];
    if (prev) setActiveStep(prev.id);
  }

  if (editId && !isExistingError && (isLoadingExisting || !existingIsFresh)) {
    return <p className="text-sm text-muted">Loading exam program…</p>;
  }

  if (editId && (isExistingError || !existing)) {
    return (
      <p className="text-sm text-red-600">
        Failed to load this exam program. Please try again.
      </p>
    );
  }

  if (previewView) {
    const values = methods.getValues();
    return (
      <>
        <div className="flex items-center justify-between mb-5">
          <Button
            variant="secondary"
            size="sm"
            className="bg-gray-200"
            leftIcon={<div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />}
          >
            Preview Mode
          </Button>
          <Button
            variant="outline"
            onClick={() => setPreviewView(false)}
            leftIcon={<Icon icon="lucide:pen" size={14} />}
            size="sm"
          >
            Back to edit view
          </Button>
        </div>
        <ExamStudentView
          title={examProgramTitle(examName, subjectName)}
          description={values.description}
          coverUrl={
            values.upload?.coverImageUrl ||
            values.upload?.coverImage?.remoteUrl ||
            values.upload?.coverImage?.previewUrl ||
            null
          }
          price={Number(values.price || 0)}
          topics={values.content?.topics ?? []}
        />
      </>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-full">
        {programId && !editId && !pricingBannerDismissed && (
          <div className="mb-4 flex items-center justify-between rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
            <div className="flex items-center gap-2">
              <Icon icon="lucide:banknote" size={18} className="shrink-0 text-violet-500" />
              <span>
                This exam program doesn&apos;t have a real price yet. Set one up in{" "}
                <Link
                  href={`/finance/pricing/programs/exam/${encodeURIComponent(programId)}/self_paced`}
                  className="font-semibold underline hover:text-violet-900"
                >
                  Finance &gt; Pricing
                </Link>
                .
              </span>
            </div>
            <button
              type="button"
              onClick={() => setPricingBannerDismissed(true)}
              className="font-semibold text-xs text-violet-500 hover:text-violet-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {editId ? "Edit exam program" : "Create exam program"}
          </h1>

          {/* Step indicators read-only; navigation is via footer buttons */}
          <div className="flex items-center gap-2">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                      i <= activeIndex
                        ? "border-violet-600 bg-violet-600"
                        : "border-gray-300 bg-white"
                    }`}
                  >
                    {i <= activeIndex && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      i === activeIndex ? "text-gray-900" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span className="h-px w-10 bg-gray-200" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="text-nowrap"
              shadow={"sm"}
              size={"sm"}
              leftIcon={<Icon icon="lucide:eye" size={16} />}
              disabled={!hasPreviewableExamContent(topics)}
              title={
                hasPreviewableExamContent(topics)
                  ? undefined
                  : "Add a lecture or questions to preview"
              }
              onClick={() => setPreviewView(true)}
            >
              View as a student
            </Button>
            <Button
              type="button"
              variant="outline"
              className="text-nowrap"
              shadow={"sm"}
              size={"sm"}
              leftIcon={<Icon icon="solar:clipboard-check-linear" size={16} />}
              disabled={!programId}
              title={
                programId
                  ? "Set up full-length timed mock exams for this program (opens in a new tab, so nothing here is lost)"
                  : "Save the details first"
              }
              onClick={() => window.open(`/dashboard/exam-program/mocks?id=${programId}`, "_blank")}
            >
              Mock exams
            </Button>
            {isLive ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  size={"sm"}
                  disabled={isUnpublishing || isSavingLive}
                  loading={isUnpublishing}
                  loadingText="Unpublishing..."
                  onClick={handleUnpublish}
                >
                  Unpublish
                </Button>
                <Button
                  type="button"
                  variant={canPublish ? "primary" : "secondary"}
                  size={"sm"}
                  disabled={!canPublish || isSavingLive || isUnpublishing}
                  loading={isSavingLive}
                  loadingText="Saving..."
                  title={
                    canPublish
                      ? undefined
                      : "A live program needs its details, content, cover image and promo video complete"
                  }
                  onClick={handleSaveLive}
                >
                  Save changes
                </Button>
              </>
            ) : (
              <Button
                type="button"
                variant={canPublish ? "primary" : "secondary"}
                size={"sm"}
                disabled={!canPublish || isPublishing}
                loading={isPublishing}
                loadingText="Publishing..."
                onClick={handlePublish}
              >
                Publish
              </Button>
            )}
          </div>
        </div>

        {isLive && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <Icon icon="lucide:info" size={18} className="shrink-0" />
            <span>
              This program is live. Changes you save here are seen by students
              straight away. Use Save changes in the header when you are done.
            </span>
          </div>
        )}

        {publishError && (
          <div className="mt-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <div className="flex items-center gap-2">
              <Icon
                icon="lucide:alert-circle"
                size={18}
                className="shrink-0 text-red-500"
              />
              <span>{publishError}</span>
            </div>
            {contentChanged ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="shrink-0 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Reload the page
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setPublishError(null)}
                className="font-semibold text-xs text-red-500 hover:text-red-700"
              >
                Dismiss
              </button>
            )}
          </div>
        )}

        <fieldset className="min-w-0 flex-1 border-0 p-0">
          {activeStep === "details" && <Step1 onNext={goNext} live={isLive} />}
          {activeStep === "content" && (
            <Step2
              onNext={goNext}
              onBack={goBack}
              exam={examName}
              subject={subjectName}
              programId={methods.getValues("id")}
            />
          )}
          {activeStep === "upload" && (
            <Step3
              exam={examName}
              subject={subjectName}
              onBack={goBack}
              isPublished={isPublished}
            />
          )}
        </fieldset>
      </div>
    </FormProvider>
  );
}
