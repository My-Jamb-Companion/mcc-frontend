"use client";
import {useEffect, useRef, useState} from "react";
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
import FlashcardGenerator, {type MaterialSource} from "./FlashcardGenerator";
import Link from "next/link";
import {isRetryable, sendChatMessage, UNAVAILABLE_NOTICE} from "../services/brainy.service";
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

  const [examView, setExamView] = useState<"actions" | MaterialSource>("actions");
  useEffect(() => {
    if (mode !== "exam") setExamView("actions");
  }, [mode]);

  // Shared by the composer below and by the dashboard hand-off (?q=). `origin`
  // lets the hand-off start a plain research chat regardless of which mode
  // this tab last left selected.
  const startChat = async (
    question: string,
    files: File[],
    origin?: {mode: "research"; subject: string},
  ) => {
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
      origin?.mode ?? mode,
      origin?.subject ?? (subject || "general"),
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
          isRetryable(result) ? undefined : UNAVAILABLE_NOTICE,
          isRetryable(result),
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
  };

  // The dashboard's Ask-Brainy card sends /brainy/new?q=<question>. Without
  // this the param was ignored and the student landed on an empty composer.
  // Read from window.location (client-only, no Suspense boundary needed) and
  // cleared before sending so Back doesn't resend it; the ref stops React
  // StrictMode's double-run from creating two sessions.
  const handedOff = useRef(false);
  useEffect(() => {
    if (handedOff.current) return;
    const q = new URLSearchParams(window.location.search).get("q")?.trim();
    if (!q) return;
    handedOff.current = true;
    window.history.replaceState(null, "", window.location.pathname);
    startChat(q, [], {mode: "research", subject: "general"}).catch((error) =>
      showError(extractApiError(error, "Couldn't start your chat. Please try again.")),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
                <>
                  <div className="mb-2 flex justify-end">
                    <Link
                      href="/learnings/study-sets"
                      className="text-sm font-medium text-btn-primary hover:underline"
                    >
                      My study sets
                    </Link>
                  </div>
                  <BrainyExamActionCardGrid
                    eyebrow="Exam Preparations"
                    heading="How do you want to prepare for your exams?"
                    subtext="Turn your notes, slides, photos or a live lecture into flashcards to study from."
                    actions={EXAM_PREP_ACTIONS}
                    onSelect={(id) => {
                      if (id === "paste" || id === "upload" || id === "record") setExamView(id);
                    }}
                  />
                </>
              ) : (
                <FlashcardGenerator source={examView} onBack={() => setExamView("actions")} />
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

          <BrainyChatBox onSubmitQuestion={startChat} />
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
    description: "Turn your notes, slides, photos or a lecture into flashcards to study from.",
  },
  {
    id: "assignment",
    icon: "ph:book-open",
    title: "Get support with your assignment",
    description:
      "Generate summaries and interactive study materials to simplify complex assignments.",
  },
];
// Upload reads documents and photos (POST /brainy/study-material) and Record uses
// the browser's own speech recognition, so both feed the same flashcard
// workbench as Paste. Audio/video *files* still have no server-side
// transcription -- the Upload screen says so plainly.
const EXAM_PREP_ACTIONS: ActionCardConfig[] = [
  {
    id: "upload",
    icon: "hugeicons:pencil-ruler",
    title: "Upload",
    description: "PDF, Word, PowerPoint, text, or a photo of your notes.",
  },
  {
    id: "record",
    icon: "ph:microphone",
    title: "Record",
    description: "Record a live lecture",
  },
  {
    id: "paste",
    icon: "ph:book-open",
    title: "Paste",
    description: "Paste your notes or study material",
  },
];
