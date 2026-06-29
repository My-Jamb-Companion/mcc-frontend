"use client";
import {AnimatePresence, motion} from "@mcc/ui";
import BrainyChatBox from "./BrainyChatBox";
import AssignmentSubjectSelector from "./AssigmentSubjectScrollBarSelector";
import BrainyFeatureCard from "./BrainyFeatureCard";
import {useRouter} from "next/navigation";
import {ChatMessage, useBrainy} from "../contexts/BrainyContext";
import BrainyExamActionCardGrid, {
  ActionCardConfig,
} from "./BrainyExamActionCard";

export interface FeatureCardConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

export default function Brainy() {
  const {
    subject,
    setSubject,
    mode,
    setMode,
    // sessions,
    // activeSessionId,
    createNewSession,
  } = useBrainy();
  const router = useRouter();

  return (
    <section className="grow flex flex-col gap-12 min-h-screen items-center justify-center px-4">
      <AnimatePresence mode="wait">
        {mode === "assignment" && (
          <motion.div
            key="assignment"
            initial={{opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -15}}
            transition={{duration: 0.25, ease: "easeInOut"}}
            className="w-full flex justify-center"
          >
            <AssignmentSubjectSelector
              selectedId={subject}
              onSelect={setSubject}
            />
          </motion.div>
        )}
        {mode === "exam" && (
          <div key="exam">
            {" "}
            <BrainyExamActionCardGrid
              eyebrow="Exam Preparations"
              heading="How do you want to prepare for your exams?"
              subtext="Upload anything and get interactive notes, flashcards, quizzes, and more"
              actions={EXAM_PREP_ACTIONS}
              onSelect={(id) => {
                // console.log("Action selected:", id);
              }}
            />
          </div>
        )}

        {mode === "research" && (
          <motion.div
            key="research"
            initial={{opacity: 0, y: 15}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -15}}
            transition={{duration: 0.25, ease: "easeInOut"}}
          >
            <div className="flex flex-col gap-3 sm:flex-row max-w-[700px]">
              {DEFAULT_FEATURES.map((feature) => (
                <BrainyFeatureCard
                  key={feature.id}
                  feature={feature}
                  onSelect={(featureId) =>
                    setMode(featureId as "assignment" | "exam")
                  }
                />
              ))}
            </div>
          </motion.div>
        )}

        <BrainyChatBox
          onSubmitQuestion={(question, files) => {
            const firstMessage: ChatMessage = {
              id: Math.random().toString(36).substring(7),
              sender: "user" as const,
              text: question,
              file: files,
              timestamp: new Date(),
            };
            const sessionId = createNewSession(
              question.length > 50
                ? `${question.slice(0, 47)}...`
                : question || "New Study Session",
              mode,
              subject || "general",
              [firstMessage],
            );
            router.push(`/brainy/chat/${sessionId}`);
          }}
        />
      </AnimatePresence>
    </section>
  );
}

const DEFAULT_FEATURES: FeatureCardConfig[] = [
  {
    id: "exam",
    icon: "ph:exam",
    title: "Prepare for your exam",
    description:
      "Transform lecture slides and notes into flashcards, quizzes, and fill-in-the-blank questions instantly.",
    badge: "Coming soon",
    disabled: true,
  },
  {
    id: "assignment",
    icon: "ph:book-open",
    title: "Get support with your assignment",
    description:
      "Generate summaries and interactive study materials to simplify complex assignments.",
  },
];
const EXAM_PREP_ACTIONS: ActionCardConfig[] = [
  {
    id: "upload",
    icon: "hugeicons:pencil-ruler",
    title: "Upload",
    description: "Image, file, audio, video.",
  },
  {
    id: "record",
    icon: "ph:book-open",
    title: "Record",
    description: "Record live lecture",
    badge: "Coming soon",
    disabled: true,
  },
  {
    id: "paste",
    icon: "ph:book-open",
    title: "Paste",
    description: "Youtube, website, text",
  },
];
