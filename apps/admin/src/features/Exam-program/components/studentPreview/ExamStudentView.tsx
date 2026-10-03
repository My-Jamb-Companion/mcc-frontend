"use client";

import {useMemo, useState} from "react";
import {Icon} from "@mcc/ui";
import {youTubeEmbedUrl} from "@/src/features/courses/helper/video";
import CoursePlayer from "@/src/features/courses/components/studentPreview/CoursePlayer";
import InteractiveLesson from "@/src/features/courses/components/studentPreview/InteractiveLesson";
import PurchasePreview from "@/src/features/courses/components/studentPreview/PurchasePreview";
import {
  allExamLectures,
  StudentExamQuestion,
  toStudentExamTree,
} from "@/src/features/Exam-program/helper/studentView";
import type {Topic} from "../CreateProgramSteps/Step2";
import ExamQuizPreview from "./ExamQuizPreview";
import ExamTreePreview, {ActiveNode} from "./ExamTreePreview";

type Page = "learn" | "landing";

interface Session {
  label: string;
  questions: StudentExamQuestion[];
  timerMinutes?: number | null;
  passingScore?: number | null;
}

/**
 * "View as a student" for an exam program, mirroring the learner app's
 * ExamProgramContent: breadcrumb, lecture player with "Mark as complete", and
 * the content tree with Quiz / Practice / Test sessions. Built from the form
 * as it would be saved. "Before enrolling" shows the page a student sees
 * before registering. Nothing here is sent anywhere.
 */
export default function ExamStudentView({
  title,
  description,
  coverUrl,
  price,
  topics,
}: {
  title: string;
  description?: string;
  coverUrl?: string | null;
  price: number;
  topics: Topic[];
}) {
  const tree = useMemo(() => toStudentExamTree(topics), [topics]);
  const lectures = useMemo(() => allExamLectures(tree), [tree]);

  const [page, setPage] = useState<Page>("learn");
  const [active, setActive] = useState<ActiveNode | null>(
    lectures[0] ? {kind: "lecture", lectureId: lectures[0].id} : null,
  );
  const [session, setSession] = useState<Session | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const activeLecture =
    active?.kind === "lecture" ? (lectures.find((l) => l.id === active.lectureId) ?? null) : null;

  const markComplete = (id: string) => setCompleted((prev) => new Set(prev).add(id));

  const handleSelect = (node: ActiveNode) => {
    setActive(node);
    setSession(null);
    if (node.kind === "quiz" || node.kind === "practice") {
      const mod = tree
        .flatMap((t) => t.subTopics.flatMap((s) => s.modules))
        .find((m) => m.id === node.moduleId);
      if (mod) {
        setSession({
          label: node.kind === "quiz" ? "Quiz" : "Practice",
          questions: node.kind === "quiz" ? mod.quiz : mod.practice,
        });
      }
    } else if (node.kind === "test") {
      const sub = tree.flatMap((t) => t.subTopics).find((s) => s.id === node.subTopicId);
      if (sub) {
        setSession({
          label: "Test",
          questions: sub.test,
          timerMinutes: sub.testTimerMinutes,
          passingScore: sub.testPassingScore,
        });
      }
    }
  };

  return (
    <section className="flex flex-col">
      <div className="mb-4 inline-flex w-fit rounded-full bg-gray-100 p-1 text-sm font-semibold">
        {(
          [
            ["learn", "After registering"],
            ["landing", "Before registering"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setPage(key)}
            aria-pressed={page === key}
            className={`rounded-full px-4 py-1.5 ${page === key ? "bg-white shadow-sm" : "text-muted"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {page === "landing" ? (
        <PurchasePreview
          breadcrumbRoot="Exam prep"
          title={title}
          description={description}
          coverUrl={coverUrl}
          price={price}
          ctaLabel="Register"
          ctaFreeLabel="Register for free"
        />
      ) : (
        <>
          <nav className="flex items-center gap-1 text-sm py-8 px-4">
            <span className="text-subtle">Exam prep</span>
            <span className="text-subtle">/</span>
            <span className="text-muted/50 cursor-default text-nowrap truncate">{title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 px-4 pb-8">
            <div className="min-w-0">
              {session ? (
                <ExamQuizPreview
                  key={`${active && "moduleId" in active ? active.moduleId : active && "subTopicId" in active ? active.subTopicId : ""}-${session.label}`}
                  questions={session.questions}
                  label={session.label}
                  timerMinutes={session.timerMinutes}
                  passingScore={session.passingScore}
                  onDone={() => setSession(null)}
                />
              ) : !activeLecture ? (
                <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
                  {lectures.length === 0
                    ? "This program has no content yet."
                    : "Pick a lecture, quiz, practice or test from the content list."}
                </div>
              ) : activeLecture.kind === "html" ? (
                <InteractiveLesson
                  key={activeLecture.id}
                  html={activeLecture.html ?? ""}
                  onComplete={() => markComplete(activeLecture.id)}
                />
              ) : activeLecture.kind === "youtube" ? (
                <iframe
                  src={youTubeEmbedUrl(activeLecture.url) ?? undefined}
                  title={activeLecture.title}
                  className="aspect-video w-full rounded-2xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <CoursePlayer
                  src={activeLecture.url ?? undefined}
                  onEnded={() => markComplete(activeLecture.id)}
                />
              )}

              {!session && activeLecture && (
                <div className="mt-4 flex items-center justify-between px-1">
                  <p className="text-lg font-semibold">{activeLecture.title}</p>
                  {activeLecture.kind !== "html" && (
                    <button
                      type="button"
                      onClick={() => markComplete(activeLecture.id)}
                      disabled={completed.has(activeLecture.id)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        completed.has(activeLecture.id)
                          ? "border border-muted/20 text-subtle"
                          : "bg-primary text-white"
                      }`}
                    >
                      {completed.has(activeLecture.id) ? "Completed" : "Mark as complete"}
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 px-1">
                <Icon icon="ph:list-bullets" size={16} className="text-subtle" />
                <p className="text-sm font-semibold">Content</p>
              </div>
              <ExamTreePreview
                topics={tree}
                active={active}
                completedLectureIds={completed}
                onSelect={handleSelect}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
