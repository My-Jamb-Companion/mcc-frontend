"use client";

import {useState} from "react";
import {Button, confettiCelebrate, Icon} from "@mcc/ui";
import {useForm, FormProvider} from "@mcc/features";
import ContentStep, {
  hasCompleteContent,
  Topic,
} from "./CreateCoursesSteps/Step2";
import CreateDetails from "./CreateCoursesSteps/Step1";
import PromotionalCoverUpload, {
  hasCompleteUpload,
  UploadedFile,
} from "./CreateCoursesSteps/Step3";

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
  courseName: string;
  category: string;
  instructor: string;
  price: string;
  level: (typeof LEVELS)[number]["id"];
  description: string;
  learnItems: string[];
  tags: string[];
};

export type CoursesFormValues = Step1Values & {
  content: {
    topics: Topic[];
  };
  upload: {
    coverImage: UploadedFile | null;
    promoVideo: UploadedFile | null;
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
  courseName,
}: {
  onNext: () => void;
  onBack: () => void;
  courseName: string;
}) {
  return (
    <div className="mt-5 h-full rounded-xl border border-muted/20 p-6">
      <ContentStep onNext={onNext} onBack={onBack} courseName={courseName} />
    </div>
  );
}

// STEP 3

function Step3({
  onBack,
  courseName,
  isPublished,
}: {
  onBack: () => void;
  courseName: string;
  isPublished: boolean;
}) {
  return (
    <div className="flex flex-col h-full mt-5 rounded-xl border border-muted/20 p-6">
      <PromotionalCoverUpload
        courseName={courseName}
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

export default function CreateCourseForm() {
  const [activeStep, setActiveStep] = useState<Step>("details");

  const methods = useForm<CoursesFormValues>({
    mode: "onChange",
    defaultValues: {
      courseName: "",
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
  const [prevviewView, setPreviewView] = useState(false);

  function handlePublish() {
    if (!canPublish) return;
    confettiCelebrate(undefined, 1000, 300);
    setIsPublished(true);
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
          <h1 className="text-xl font-semibold text-gray-900">Create course</h1>

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
              variant={!canPublish ? "secondary" : "outline"}
              className={!canPublish ? "text-muted/60" : ""}
              shadow={"sm"}
              size={"sm"}
              leftIcon={<Icon icon="lucide:eye" size={16} />}
              disabled={!canPublish}
              onClick={() => setPreviewView(true)}
            >
              View as a student
            </Button>
            <Button
              type="button"
              variant={canPublish ? "primary" : "secondary"}
              size={"sm"}
              disabled={!canPublish}
              className={!canPublish ? "text-muted/60" : ""}
              onClick={handlePublish}
            >
              Publish
            </Button>
          </div>
        </div>

        <>
          {/* Steps */}
          {activeStep === "details" && <Step1 onNext={goNext} />}
          {activeStep === "content" && (
            <Step2
              onNext={goNext}
              onBack={goBack}
              courseName={methods.watch("courseName")}
            />
          )}
          {activeStep === "upload" && (
            <Step3
              courseName={methods.watch("courseName")}
              onBack={goBack}
              isPublished={isPublished}
            />
          )}
        </>
      </div>
    </FormProvider>
  );
}
