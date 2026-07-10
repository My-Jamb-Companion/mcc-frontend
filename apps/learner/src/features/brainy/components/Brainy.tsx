"use client";
import {AnimatePresence, Icon, motion} from "@mcc/ui";
import BrainyChatBox from "./BrainyChatBox";
import AssignmentSubjectSelector from "./AssigmentSubjectScrollBarSelector";
import BrainyFeatureCard from "./BrainyFeatureCard";
import {usePathname, useRouter} from "next/navigation";
import {ChatMessage, useBrainy} from "../contexts/BrainyContext";
import BrainyExamActionCardGrid, {
  ActionCardConfig,
} from "./BrainyExamActionCard";
import Link from "next/link";

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
    <section className="grow flex flex-col h-full items-center justify-start overflow-y-auto px-4 py-8 max-sm:pb-10 max-sm:pt-20">
      <div className="w-full max-w-[700px] flex flex-col items-center gap-12 my-auto">
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
                // onSelect={(id) => {
                // console.log("Action selected:", id);
                // }}
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
      </div>
    </section>
  );
}

export function HeadUnit() {
  const {toggleSidebar} = useBrainy();
  const pathname = usePathname();
  const pathNameArray = pathname.split("/");
  const chatIndex = pathNameArray.indexOf("chat");
  const isChatPage = chatIndex !== -1 && pathNameArray[chatIndex + 1];
  return (
    <header className="sm:hidden absolute left-0 top-5 w-full flex items-center justify-between py-3 px-1 border border-muted/20 rounded-2xl shadow-md z-10 bg-white dark:bg-card/30 backdrop-blur-md">
      <div className="flex items-center gap-3">
        {isChatPage && (
          <Link
            href={"/brainy"}
            className="p-2 rounded-full border border-muted/30 shadow-md dark:shadow-muted/20 cursor-pointer"
          >
            <Icon icon="ep:back" size={22} />
          </Link>
        )}
        <p className="text-2xl font-semibold whitespace-nowrap">
          Brainy<span className="text-primary">.AI</span>{" "}
        </p>
      </div>
      <button
        onClick={() => toggleSidebar()}
        className="p-2 rounded-full border border-muted/30 shadow-md dark:shadow-muted/20 cursor-pointer"
      >
        <Icon icon="jam:menu" size={22} />
      </button>
    </header>
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
