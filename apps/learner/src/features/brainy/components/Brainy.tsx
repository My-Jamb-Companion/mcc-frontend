"use client";
import {useEffect, useState} from "react";
import {AnimatePresence, Icon, motion, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import BrainyChatBox from "./BrainyChatBox";
import AssignmentSubjectSelector from "./AssigmentSubjectScrollBarSelector";
import BrainyFeatureCard from "./BrainyFeatureCard";
import {usePathname, useRouter} from "next/navigation";
import {ChatMessage, useBrainy} from "../contexts/BrainyContext";
import BrainyExamActionCardGrid, {
  ActionCardConfig,
} from "./BrainyExamActionCard";
import FlashcardGenerator from "./FlashcardGenerator";
import Link from "next/link";
import {sendChatMessage} from "../services/brainy.service";
import {useQueryClient} from "@tanstack/react-query";
import AllowanceMeter from "./AllowanceMeter";
import {isAllowanceUsed} from "../helper/charge";
import {ALLOWANCE_QUERY_KEY, USAGE_QUERY_KEY} from "../hooks/useBrainyChat";
import {uploadAttachments} from "../helper/uploadAttachments";

export interface FeatureCardConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

export default function Brainy() {
  const queryClient = useQueryClient();
  const {
    subject,
    setSubject,
    mode,
    setMode,
    // sessions,
    // activeSessionId,
    createNewSession,
    addMessageToSession,
  } = useBrainy();
  const router = useRouter();

  const [examView, setExamView] = useState<"actions" | "flashcards">("actions");
  useEffect(() => {
    if (mode !== "exam") setExamView("actions");
  }, [mode]);

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
            <div key="exam" className="w-full">
              {examView === "actions" ? (
                <BrainyExamActionCardGrid
                  eyebrow="Exam Preparations"
                  heading="How do you want to prepare for your exams?"
                  subtext="Paste your notes and get instant flashcards to study from."
                  actions={EXAM_PREP_ACTIONS}
                  onSelect={(id) => {
                    if (id === "paste") setExamView("flashcards");
                  }}
                />
              ) : (
                <FlashcardGenerator onBack={() => setExamView("actions")} />
              )}
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
            onSubmitQuestion={async (question, files) => {
              const firstMessage: ChatMessage = {
                id: Math.random().toString(36).substring(7),
                sender: "user" as const,
                text: question,
                file: files,
                timestamp: new Date(),
              };

              // Extract attachment text before anything else: an unsupported
              // file should stop the send with a clear message rather than
              // silently asking the model about a document it never received.
              let attachments;
              try {
                attachments = await uploadAttachments(files);
              } catch (error) {
                showError(
                  extractApiError(error, "That file couldn't be read. Try a PDF or text file."),
                );
                return;
              }

              const sessionId = await createNewSession(
                question.length > 50
                  ? `${question.slice(0, 47)}...`
                  : question || "New Study Session",
                mode,
                subject || "general",
                [firstMessage],
              );
              router.push(`/brainy/chat/${sessionId}`);

              // Plain promise chain, not the useMutation hook: Brainy.tsx
              // unmounts the instant router.push above navigates away, and
              // a hook-bound mutation's onSuccess/onError is not guaranteed
              // to fire once its owning component is gone. This resolves
              // independently of any component's lifecycle.
              sendChatMessage(question, {sessionId, attachments}).then(
                (result) =>
                  // generated: false -> the provider returned nothing usable;
                  // flagged so the thread offers a retry rather than passing
                  // a failure off as Brainy's answer.
                  addMessageToSession(
                    sessionId,
                    "ai",
                    result.reply,
                    undefined,
                    !result.generated,
                    result.usage,
                    result.charge,
                  ),
                (error) =>
                  addMessageToSession(
                    sessionId,
                    "ai",
                    "My brain is fuzzy right now. Please try again.",
                    undefined,
                    true,
                    null,
                    null,
                    isAllowanceUsed(error)
                      ? extractApiError(error, "You've used your Brainy allowance. Add gems to keep going.")
                      : undefined,
                  ),
              ).finally(() => {
                queryClient.invalidateQueries({queryKey: USAGE_QUERY_KEY});
                queryClient.invalidateQueries({queryKey: ALLOWANCE_QUERY_KEY});
              });
            }}
          />
          <AllowanceMeter className="mt-2" />
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
    <header className="sm:hidden absolute left-0 top-5 w-full flex items-center justify-between py-2 z-10 bg-white backdrop-blur-md">
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
    description: "Paste your notes and get instant flashcards to study from.",
  },
  {
    id: "assignment",
    icon: "ph:book-open",
    title: "Get support with your assignment",
    description:
      "Generate summaries and interactive study materials to simplify complex assignments.",
  },
];
// Only "paste" is wired to anything real (POST /brainy/flashcards) --
// "Upload" (image/file/audio/video) and "Record live lecture" need OCR,
// transcription, or audio-capture infrastructure the backend doesn't have,
// so both stay honestly marked "Coming soon" rather than looking clickable
// with nothing behind them.
const EXAM_PREP_ACTIONS: ActionCardConfig[] = [
  {
    id: "upload",
    icon: "hugeicons:pencil-ruler",
    title: "Upload",
    description: "Image, file, audio, video.",
    badge: "Coming soon",
    disabled: true,
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
    description: "Paste your notes or study material",
  },
];
