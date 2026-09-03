"use client";

import {useState, useEffect, useRef} from "react";
import {useSearchParams} from "next/navigation";
import {Button, confettiCelebrate, Icon, showError, showSuccess} from "@mcc/ui";
import {useForm, FormProvider} from "@mcc/features";
import ContentStep, {hasCompleteContent, uid} from "./CreateCoursesSteps/Step2";
import CreateDetails from "./CreateCoursesSteps/Step1";
import PromotionalCoverUpload, {
  hasCompleteUpload,
} from "./CreateCoursesSteps/Step3";
import CourseStudentView from "./studentPreview/CourseStudentView";
import {calculateTotalHours} from "../helper/helper";
import {
  AdditionalCourseTypes,
  CoursesFormValues,
  LEVELS,
  UpdateCoursePayload,
} from "../types/types";
import {useCourse} from "../hooks/useCourses";
import {serializeModulesPayload, toApiLevel} from "../helper/course.mapper";
import {
  getApiErrorMessage,
  publishCourse,
  updateCourse,
} from "../services/course.service";

export {LEVELS};

type Step = "details" | "content" | "upload";

const STEPS: {id: Step; label: string}[] = [
  {id: "details", label: "Details"},
  {id: "content", label: "Content"},
  {id: "upload", label: "Upload"},
];

// STEP 1
function Step1({
  onNext,
  saveDraft,
  existingCourseId,
}: {
  onNext: () => void;
  saveDraft: () => void;
  existingCourseId?: string;
}) {
  return (
    <CreateDetails
      onNext={onNext}
      saveDraft={saveDraft}
      existingCourseId={existingCourseId}
    />
  );
}

// STEP 2
function Step2({
  onNext,
  onBack,
  courseName,
  saveDraft,
}: {
  onNext: () => void;
  onBack: () => void;
  courseName: string;
  saveDraft: () => void;
}) {
  return (
    <div className="mt-5 h-full rounded-xl border border-muted/20 p-6">
      <ContentStep
        onNext={onNext}
        onBack={onBack}
        courseName={courseName}
        onSaveDraft={saveDraft}
      />
    </div>
  );
}

// STEP 3
function Step3({
  onBack,
  courseName,
  isPublished,
  saveDraft,
  isEdit,
}: {
  onBack: () => void;
  courseName: string;
  isPublished: boolean;
  saveDraft: () => void;
  isEdit: boolean;
}) {
  return (
    <div className="flex flex-col h-full mt-5 rounded-xl border border-muted/20 p-6">
      <PromotionalCoverUpload
        courseName={courseName}
        isPublished={isPublished}
        isEdit={isEdit}
      />

      <div className="flex items-center justify-between border-t border-gray-100 pt-5">
        {!isEdit && !isPublished && (
          <>
            <Button type="button" onClick={onBack} variant={"ghost"}>
              Back
            </Button>
            <Button type="button" variant={"outline"} onClick={saveDraft}>
              Save as draft
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ROOT FORM SHELL
export default function CreateCourseForm() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [activeStep, setActiveStep] = useState<Step>("details");
  const [isPublished, setIsPublished] = useState(false);
  const [previewView, setPreviewView] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // COURSE STORE
  // ─────────────────────────────────────────────
  const {
    data: existingCourse,
    isLoading: isLoadingCourse,
    isError: isCourseError,
  } = useCourse(editId);

  const [isEdit, setIsEdit] = useState(true);

  // ─────────────────────────────────────────────
  // FORM INITIALIZATION
  // ─────────────────────────────────────────────
  const methods = useForm<CoursesFormValues>({
    mode: "onChange",
    defaultValues: {
      id: uid(),
      status: "draft",
      courseName: "",
      category: "",
      instructorName: "",
      price: "",
      level: "all",
      description: "",
      learnItems: [],
      tags: [],
      content: {
        topics: [],
      },
      upload: {
        coverImage: null,
        promoVideo: null,
      },
    },
  });

  // Load course details into the form — but only once per course. Without
  // the ref guard, any background refetch of useCourse() (e.g. React
  // Query's default refetchOnWindowFocus firing when a file picker or
  // another tab steals and returns focus) would re-run this effect and
  // silently wipe out every unsaved edit via methods.reset(), even though
  // nothing the user did asked for a reset.
  const loadedCourseIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (existingCourse && loadedCourseIdRef.current !== editId) {
      methods.reset(existingCourse);
      loadedCourseIdRef.current = editId;
    }
  }, [existingCourse, editId, methods]);

  // ─────────────────────────────────────────────
  // FORM DATA WATCHERS
  // ─────────────────────────────────────────────
  const activeIndex = STEPS.findIndex((step) => step.id === activeStep);
  const topics = methods.watch("content.topics") ?? [];
  const upload = methods.watch("upload") ?? {
    coverImage: null,
    promoVideo: null,
  };

  const isDetailsComplete = methods.formState.isValid;
  const isContentComplete = hasCompleteContent(topics);
  const isUploadComplete = hasCompleteUpload(upload);
  const canPublish = isDetailsComplete && isContentComplete && isUploadComplete;

  // ─────────────────────────────────────────────
  // BUILD COMPLETE COURSE PAYLOAD
  // ─────────────────────────────────────────────
  function buildCoursePayload(
    status: "draft" | "published",
  ): CoursesFormValues {
    const rawFormValues: CoursesFormValues & AdditionalCourseTypes =
      methods.getValues();

    const moduleCount = rawFormValues.content.topics.reduce(
      (total, topic) => total + topic.modules.length,
      0,
    );

    const basePrice = Number(rawFormValues.price || 0);
    const modulePrice =
      moduleCount > 0 ? Math.round(basePrice / moduleCount) : 0;

    const additionalData: AdditionalCourseTypes = {
      stats: {
        rating: rawFormValues.stats?.rating ?? 0,
        reviewCount: rawFormValues.stats?.reviewCount ?? 0,
        enrolledStudents: rawFormValues.stats?.enrolledStudents ?? 0,
        totalHours: calculateTotalHours(rawFormValues.content.topics),
        practiceTests: rawFormValues.stats?.practiceTests ?? 0,
        additionalResources: rawFormValues.stats?.additionalResources ?? 0,
        downloadableResources: rawFormValues.stats?.downloadableResources ?? 0,
      },
      features: rawFormValues.features ?? {
        assignments: false,
        mobileAndTVAccess: false,
        fullLifetimeAccess: false,
        certificateOnCompletion: false,
      },
      currency: "$",
      modulePrice,
      lastUpdated: new Date().toISOString(),
      availableLanguage: ["English"],
      certificate: "Certificate of Completion",
    };

    return {
      ...rawFormValues,
      ...additionalData,
      status,
    };
  }

  function toUpdatePayload(payload: CoursesFormValues): UpdateCoursePayload {
    return {
      title: payload.courseName,
      category: payload.category,
      teacher_id: payload.instructorName,
      price: Number(payload.price || 0),
      level: toApiLevel(payload.level),
      description: payload.description,
      learning_outcomes: payload.learnItems,
      tags: payload.tags,
      cover_image_url:
        payload.upload?.coverImageUrl ||
        payload.upload?.coverImage?.remoteUrl ||
        payload.upload?.coverImage?.previewUrl,
      promo_video_url:
        payload.upload?.promoVideoUrl ||
        payload.upload?.promoVideo?.remoteUrl ||
        payload.upload?.promoVideo?.previewUrl,
      modules: serializeModulesPayload(payload.content.topics),
    };
  }

  // ─────────────────────────────────────────────
  // SAVE AS DRAFT (PATCH)
  // ─────────────────────────────────────────────
  async function handleSaveDraft() {
    try {
      setApiError(null);
      setIsSavingDraft(true);
      const finalPayload = buildCoursePayload("draft");

      if (finalPayload.id) {
        await updateCourse(finalPayload.id, toUpdatePayload(finalPayload));
      }

      methods.reset(finalPayload);
      setIsPublished(false);
      showSuccess("Course draft saved successfully!");
    } catch (err) {
      console.error("Failed to save draft:", err);
      const errorMsg = getApiErrorMessage(
        err,
        "Failed to save course draft. Please try again.",
      );
      setApiError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsSavingDraft(false);
    }
  }

  // ─────────────────────────────────────────────
  // PUBLISH (PATCH + POST /publish)
  // ─────────────────────────────────────────────
  async function handlePublish() {
    if (!canPublish) return;

    try {
      setApiError(null);
      setIsPublishing(true);
      const finalPayload = buildCoursePayload("published");

      if (finalPayload.id) {
        await updateCourse(finalPayload.id, toUpdatePayload(finalPayload));
        await publishCourse(finalPayload.id);
      }

      methods.reset(finalPayload);
      confettiCelebrate(undefined, 1000, 300);
      setIsPublished(true);
      setIsEdit(false);
      showSuccess("Course published successfully!");
    } catch (err) {
      console.error("Failed to publish course:", err);
      const errorMsg = getApiErrorMessage(
        err,
        "Failed to publish course. Please try again.",
      );
      setApiError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsPublishing(false);
    }
  }

  // ─────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────
  function goNext() {
    const next = STEPS[activeIndex + 1];
    if (next) setActiveStep(next.id);
  }

  function goBack() {
    const prev = STEPS[activeIndex - 1];
    if (prev) setActiveStep(prev.id);
  }

  if (editId && isLoadingCourse) {
    return <p className="text-sm text-muted">Loading course…</p>;
  }

  if (editId && isCourseError) {
    return (
      <p className="text-sm text-red-600">
        Failed to load this course. Please try again.
      </p>
    );
  }

  return (
    <>
      {previewView ? (
        <>
          <div className="flex items-center justify-between mb-5">
            <Button
              variant={"secondary"}
              size={"sm"}
              className="bg-gray-200"
              leftIcon={
                <div className="w-3 h-3 rounded-full bg-gray-500 animate-pulse" />
              }
            >
              Preview Mode
            </Button>

            <Button
              variant={"outline"}
              onClick={() => setPreviewView(false)}
              leftIcon={<Icon icon="lucide:pen" size={14} />}
              size={"sm"}
            >
              Back to edit view
            </Button>
          </div>

          <CourseStudentView course={methods.getValues()} />
        </>
      ) : (
        <FormProvider {...methods}>
          <div className="flex flex-col h-full">
            {apiError && (
              <div className="mb-4 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                <div className="flex items-center gap-2">
                  <Icon icon="lucide:alert-circle" size={18} className="shrink-0 text-red-500" />
                  <span>{apiError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setApiError(null)}
                  className="font-semibold text-xs text-red-500 hover:text-red-700"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h1 className="text-xl font-semibold text-gray-900">
                {editId ? "Edit course" : "Create course"}
              </h1>

              {/* Step indicators */}
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
                          i === activeIndex ? "text-gray-900" : "text-gray-400"
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
                  variant={!canPublish ? "secondary" : "outline"}
                  className={!canPublish ? "text-muted/60" : ""}
                  shadow={"sm"}
                  size={"sm"}
                  leftIcon={<Icon icon="lucide:eye" size={16} />}
                  onClick={() => setPreviewView(true)}
                  disabled={!canPublish || isPublishing || isSavingDraft}
                >
                  View as a student
                </Button>
                <Button
                  type="button"
                  variant={canPublish ? "primary" : "secondary"}
                  size={"sm"}
                  disabled={!canPublish || isPublishing || isSavingDraft}
                  loading={isPublishing}
                  loadingText="Publishing..."
                  className={!canPublish ? "text-muted/60" : ""}
                  onClick={handlePublish}
                >
                  {editId ? "Update & Publish" : "Publish"}
                </Button>
              </div>
            </div>

            {/* Steps */}
            {activeStep === "details" && (
              <Step1
                onNext={goNext}
                saveDraft={handleSaveDraft}
                existingCourseId={editId ?? undefined}
              />
            )}
            {activeStep === "content" && (
              <Step2
                onNext={goNext}
                onBack={goBack}
                courseName={methods.watch("courseName")}
                saveDraft={handleSaveDraft}
              />
            )}
            {activeStep === "upload" && (
              <Step3
                courseName={methods.watch("courseName")}
                onBack={goBack}
                isPublished={isPublished}
                saveDraft={handleSaveDraft}
                isEdit={isEdit}
              />
            )}
          </div>
        </FormProvider>
      )}
    </>
  );
}
