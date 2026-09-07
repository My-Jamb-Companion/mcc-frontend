"use client";

import {useState} from "react";
import {Button, confettiCelebrate, Icon} from "@mcc/ui";
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
import {serializeTopicsPayload} from "../helper/content.mapper";
import {
  getApiErrorMessage,
  publishExamProgram,
  updateExamProgramContent,
} from "../services/exam.service";

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

function Step1({onNext}: {onNext: () => void}) {
  return <CreateDetails onNext={onNext} />;
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

export default function CreateExamProgramForm() {
  const [activeStep, setActiveStep] = useState<Step>("details");

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
      content: {topics: []},
      upload: {coverImage: null, promoVideo: null},
    },
  });

  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

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

  async function handlePublish() {
    if (!canPublish) return;

    const programId = methods.getValues("id");
    if (!programId) {
      setPublishError(
        "Missing exam program id — go back and complete Details first.",
      );
      return;
    }

    setPublishError(null);
    setIsPublishing(true);

    try {
      const values = methods.getValues();

      // Patch the cover image / promo video (and re-send content, in case
      // Step2 was left with unsaved edits) before flipping the program live.
      await updateExamProgramContent(programId, {
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

      await publishExamProgram(programId);

      confettiCelebrate(undefined, 1000, 300);
      setIsPublished(true);
    } catch (error) {
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

  function goNext() {
    const next = STEPS[activeIndex + 1];
    if (next) setActiveStep(next.id);
  }

  function goBack() {
    const prev = STEPS[activeIndex - 1];
    if (prev) setActiveStep(prev.id);
  }

  return (
    <FormProvider {...methods}>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Create exam program
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
              variant="outline"
              className="text-nowrap"
              shadow={"sm"}
              size={"sm"}
              leftIcon={<Icon icon="lucide:eye" size={16} />}
            >
              View as a student
            </Button>
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
          </div>
        </div>

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
            <button
              type="button"
              onClick={() => setPublishError(null)}
              className="font-semibold text-xs text-red-500 hover:text-red-700"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Steps */}
        {activeStep === "details" && <Step1 onNext={goNext} />}
        {activeStep === "content" && (
          <Step2
            onNext={goNext}
            onBack={goBack}
            exam={methods.getValues("exam")}
            subject={methods.getValues("subject")}
            programId={methods.getValues("id")}
          />
        )}
        {activeStep === "upload" && (
          <Step3
            exam={methods.getValues("exam")}
            subject={methods.getValues("subject")}
            onBack={goBack}
            isPublished={isPublished}
          />
        )}
      </div>
    </FormProvider>
  );
}
