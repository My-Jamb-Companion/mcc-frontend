"use client";
import {AnimatePresence, motion} from "@mcc/ui";
import {useState} from "react";
import BrainyChatBox from "./BrainyChatBox";
import AssignmentSubjectSelector from "./AssigmentSubjectScrollBarSelector";
import BrainyFeatureCard from "./BrainyFeatureCard";
import {useRouter} from "next/navigation";
// import BrainyTypeSelector from "./BrainyTypeSelector";
export interface FeatureCardConfig {
  id: string;
  icon: string;
  title: string;
  description: string;
  badge?: string;
  disabled?: boolean;
}

export default function Brainy() {
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<"assignment" | "exam" | "new">("new");
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
        {mode === "exam" && <div key="exam" />}

        {mode === "new" && (
          <motion.div
            key="new"
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
          onFilesAdded={(files) => {
            console.log(
              "Files added:",
              files.map((f) => f.name),
            );
          }}
          onSubmitQuestion={(question, files) => {
            console.log("Question submitted:", question, files);
            router.push("/brainy/chat/wanna");
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
