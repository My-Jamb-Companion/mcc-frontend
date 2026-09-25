"use client";
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {Icon} from "@mcc/ui";
import {youTubeEmbedUrl} from "@/src/features/learnings/helper/video";
import CoursePlayer from "../course/CoursePlayer";
import ExamContentTree, {ActiveNode} from "./ExamContentTree";
import ExamQuiz from "./ExamQuiz";
import {
  useProgramContent,
  useStartMockExam,
  useStartModuleSession,
  useUpdateProgramProgress,
} from "@/src/features/exams/hooks/useExams";
import {ApiExamLecture, ApiExamSession, ApiExamTopic} from "@/src/features/exams/services/exam.service";
import {ApiEnrolledProgram} from "@/src/features/exams/services/exam.service";

interface ExamProgramContentProps {
  programId: string;
  program: ApiEnrolledProgram;
}

function flattenLectures(topics: ApiExamTopic[]): ApiExamLecture[] {
  const lectures: ApiExamLecture[] = [];
  for (const t of topics) {
    for (const st of t.sub_topics) {
      for (const m of st.modules) {
        lectures.push(...m.lectures);
      }
    }
  }
  return lectures;
}

function findLecture(topics: ApiExamTopic[], lectureId: string): ApiExamLecture | null {
  for (const t of topics) {
    for (const st of t.sub_topics) {
      for (const m of st.modules) {
        const found = m.lectures.find((l) => l.lecture_id === lectureId);
        if (found) return found;
      }
    }
  }
  return null;
}

/**
 * The exam-prep equivalent of ../course/CourseContent.tsx, one level deeper
 * (topic -> sub-topic -> module -> lecture) and without the course version's
 * AI side panel / community / notes / facilitator tabs -- content browsing,
 * lecture playback, and quiz/practice/test sessions, all against the real
 * GET /exams/<id>/content and session endpoints.
 */
export default function ExamProgramContent({programId, program}: ExamProgramContentProps) {
  const {topics, isLoading} = useProgramContent(programId);
  const updateProgress = useUpdateProgramProgress();
  const startModuleSession = useStartModuleSession();
  const startMockExam = useStartMockExam();

  const title = [program.exam_name, program.subject_name].filter(Boolean).join(" — ") ||
    "Exam prep program";
  const subject = program.subject_name ?? "";

  const allLectures = useMemo(() => flattenLectures(topics), [topics]);

  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ActiveNode | null>(null);
  const [session, setSession] = useState<{kind: "quiz" | "practice" | "exam"; label: string; data: ApiExamSession} | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // The server only stores one progress_percent, not which lectures were
  // watched -- on load, treat that many lectures (in tree order) as already
  // seen, so a returning student doesn't appear to start over from 0%.
  useEffect(() => {
    if (!allLectures.length || completedLectureIds.size > 0) return;
    const alreadyWatched = Math.round((program.progress_percent / 100) * allLectures.length);
    if (alreadyWatched > 0) {
      setCompletedLectureIds(new Set(allLectures.slice(0, alreadyWatched).map((l) => l.lecture_id)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLectures.length]);

  useEffect(() => {
    if (!active && allLectures[0]) setActive({kind: "lecture", lectureId: allLectures[0].lecture_id});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLectures.length]);

  const markLectureComplete = (lectureId: string) => {
    setCompletedLectureIds((prev) => {
      if (prev.has(lectureId)) return prev;
      const next = new Set(prev);
      next.add(lectureId);
      if (allLectures.length) {
        updateProgress.mutate({
          programId,
          progressPercent: Math.round((next.size / allLectures.length) * 100),
        });
      }
      return next;
    });
  };

  const handleSelect = (node: ActiveNode) => {
    setActive(node);
    setSession(null);
    setSessionError(null);

    if (node.kind === "quiz" || node.kind === "practice") {
      startModuleSession.mutate(
        {kind: node.kind, subject, moduleId: node.moduleId},
        {
          onSuccess: (data) => setSession({kind: node.kind, label: node.kind === "quiz" ? "Quiz" : "Practice", data}),
          onError: () => setSessionError("Couldn't start this session. Please try again."),
        },
      );
    } else if (node.kind === "test") {
      startMockExam.mutate(
        {subject, subTopicId: node.subTopicId},
        {
          onSuccess: (data) => setSession({kind: "exam", label: "Test", data}),
          onError: () => setSessionError("Couldn't start this test. Please try again."),
        },
      );
    }
  };

  const activeLecture = active?.kind === "lecture" ? findLecture(topics, active.lectureId) : null;
  const startingSession = startModuleSession.isPending || startMockExam.isPending;

  return (
    <section className="flex flex-col">
      <nav className="flex items-center gap-1 text-sm py-8 px-4">
        <Link href="/learnings/exams" className="text-subtle hover:underline">
          Exam prep
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-muted/50 cursor-default text-nowrap truncate">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-6 px-4 pb-8">
        <div className="min-w-0">
          {isLoading ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
              Loading…
            </div>
          ) : session ? (
            sessionError ? (
              <p className="text-sm text-danger">{sessionError}</p>
            ) : (
              <ExamQuiz
                key={session.data.session_id}
                sessionId={session.data.session_id}
                questions={session.data.questions}
                type={session.kind}
                label={session.label}
                onDone={() => setSession(null)}
              />
            )
          ) : startingSession ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
              Starting…
            </div>
          ) : !activeLecture ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
              {allLectures.length === 0
                ? "This program has no content yet."
                : "Pick a lecture, quiz, practice or test from the content list."}
            </div>
          ) : youTubeEmbedUrl(activeLecture.video_url) ? (
            <iframe
              src={youTubeEmbedUrl(activeLecture.video_url) ?? undefined}
              className="aspect-video w-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <CoursePlayer
              src={activeLecture.video_url ?? undefined}
              onEnded={() => markLectureComplete(activeLecture.lecture_id)}
            />
          )}

          {!session && activeLecture && (
            <div className="mt-4 flex items-center justify-between px-1">
              <p className="text-lg font-semibold">{activeLecture.title}</p>
              <button
                type="button"
                onClick={() => markLectureComplete(activeLecture.lecture_id)}
                disabled={completedLectureIds.has(activeLecture.lecture_id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  completedLectureIds.has(activeLecture.lecture_id)
                    ? "border border-muted/20 text-subtle"
                    : "bg-primary text-white"
                }`}
              >
                {completedLectureIds.has(activeLecture.lecture_id) ? "Completed" : "Mark as complete"}
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 px-1">
            <Icon icon="ph:list-bullets" size={16} className="text-subtle" />
            <p className="text-sm font-semibold">Content</p>
          </div>
          {isLoading ? (
            <p className="text-sm text-muted px-1">Loading…</p>
          ) : (
            <ExamContentTree
              topics={topics}
              active={active}
              completedLectureIds={completedLectureIds}
              onSelect={handleSelect}
            />
          )}
        </div>
      </div>
    </section>
  );
}
