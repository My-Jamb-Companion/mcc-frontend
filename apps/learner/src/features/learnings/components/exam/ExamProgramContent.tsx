"use client";
import {useEffect, useMemo, useState} from "react";
import Link from "next/link";
import {useSearchParams} from "next/navigation";
import {Icon, showError} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {isPdfUrl, youTubeEmbedUrl} from "@/src/features/learnings/helper/video";
import CoursePlayer from "../course/CoursePlayer";
import InteractiveLessonContent from "../InteractiveLessonContent";
import ExamContentTree, {ActiveNode} from "./ExamContentTree";
import AssessmentPlayer from "./AssessmentPlayer";
import ReadinessPanel from "./ReadinessPanel";
import MockExamsPanel from "./MockExamsPanel";
import MockExamPlayer from "./MockExamPlayer";
import MockExamResult from "./MockExamResult";
import {BookingSection} from "@/src/features/booking/components/BookingSection";
import {
  useProgramContent,
  useProgramReadiness,
  useStartAssessment,
  useCompleteProgramLecture,
  useProgramProgress,
  useStartMockExam,
} from "@/src/features/exams/hooks/useExams";
import {ApiAssessmentSession, ApiExamLecture, ApiExamTopic, ApiMockResult, ApiMockSession} from "@/src/features/exams/services/exam.service";
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
 * lecture playback, and Practice and Exercise played one question at a time,
 * all against the real GET /exams/<id>/content and assessment endpoints.
 */
export default function ExamProgramContent({programId, program}: ExamProgramContentProps) {
  const searchParams = useSearchParams();
  const {topics, isLoading} = useProgramContent(programId);
  const completeLecture = useCompleteProgramLecture();
  const {data: savedProgress} = useProgramProgress(programId);
  const startAssessment = useStartAssessment();
  const {data: readiness} = useProgramReadiness(programId);

  const title = [program.exam_name, program.subject_name].filter(Boolean).join(" — ") ||
    "Exam prep program";

  const allLectures = useMemo(() => flattenLectures(topics), [topics]);

  const [completedLectureIds, setCompletedLectureIds] = useState<Set<string>>(new Set());
  const [active, setActive] = useState<ActiveNode | null>(null);
  const [session, setSession] = useState<ApiAssessmentSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  // A mock exam takes the whole page while it is on: the attempt, then its result.
  const [mock, setMock] = useState<ApiMockSession | null>(null);
  const [mockResult, setMockResult] = useState<ApiMockResult | null>(null);
  const startMock = useStartMockExam();

  // The attempt and its result open at the top, not wherever the panel that started them was scrolled to.
  const mockScreen = mock?.session_id ?? mockResult?.session_id ?? null;
  useEffect(() => {
    if (mockScreen) window.scrollTo({top: 0});
  }, [mockScreen, mockResult]);

  // The lectures already finished, as the server recorded them: a reload keeps its ticks.
  useEffect(() => {
    if (!savedProgress?.completed_lecture_ids.length) return;
    setCompletedLectureIds((prev) => new Set([...prev, ...savedProgress.completed_lecture_ids]));
  }, [savedProgress]);

  useEffect(() => {
    if (active || !allLectures.length) return;
    const lectureParam = searchParams.get("lecture");
    const matched = lectureParam && allLectures.find((l) => l.lecture_id === lectureParam);
    setActive({kind: "lecture", lectureId: matched ? matched.lecture_id : allLectures[0].lecture_id});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLectures.length]);

  // Finishing a lecture is the server's to record and count: the tick appears at once, and is
  // taken back if the server refuses.
  const markLectureComplete = (lectureId: string) => {
    if (completedLectureIds.has(lectureId)) return;
    setCompletedLectureIds((prev) => new Set(prev).add(lectureId));
    completeLecture.mutate(
      {programId, lectureId},
      {
        onSuccess: (result) =>
          setCompletedLectureIds((prev) => new Set([...prev, ...result.completed_lecture_ids])),
        onError: () => {
          setCompletedLectureIds((prev) => {
            const next = new Set(prev);
            next.delete(lectureId);
            return next;
          });
          showError("Couldn't save your progress. Please try again.");
        },
      },
    );
  };

  const handleSelect = (node: ActiveNode) => {
    setActive(node);
    setSession(null);
    setSessionError(null);

    if (node.kind === "lecture") return;
    startAssessment.mutate(
      node.kind === "unit-exercise"
        ? {mode: "exercise", subTopicId: node.subTopicId}
        : node.kind === "practice"
          ? {mode: "practice", moduleId: node.moduleId, practiceSet: node.setName}
          : {mode: node.kind, moduleId: node.moduleId},
      {
        onSuccess: (data) => setSession(data),
        onError: (error) =>
          setSessionError(extractApiError(error, "Couldn't start this. Please try again.")),
      },
    );
  };

  // A tile or a weak topic from the readiness panel: the practice or exercise that is there for it.
  const practiseNode = (node: {node_type: "module" | "sub_topic"; node_id: string}) => {
    if (node.node_type === "sub_topic") return handleSelect({kind: "unit-exercise", subTopicId: node.node_id});
    const mod = topics.flatMap((t) => t.sub_topics.flatMap((s) => s.modules)).find((m) => m.module_id === node.node_id);
    if (!mod) return;
    if (mod.practice_count > 0) handleSelect({kind: "practice", moduleId: mod.module_id});
    else handleSelect({kind: "exercise", moduleId: mod.module_id});
  };

  // From a recommended lesson in the summary: leave the session and open the lecture.
  const openLecture = (lectureId: string) => {
    setSession(null);
    setSessionError(null);
    setActive({kind: "lecture", lectureId});
  };

  const leaveMock = () => {
    setMock(null);
    setMockResult(null);
  };

  const againMock = () => {
    if (!mockResult) return;
    startMock.mutate(mockResult.paper.paper_id, {
      onSuccess: (next) => {
        setMockResult(null);
        setMock(next);
      },
      onError: (error) => showError(extractApiError(error, "Couldn't start another attempt.")),
    });
  };

  if (mock || mockResult) {
    return (
      <section className="flex flex-col px-4 py-8">
        {mockResult ? (
          <MockExamResult result={mockResult} onAgain={againMock} onDone={leaveMock} />
        ) : (
          mock && (
            <MockExamPlayer
              key={mock.session_id}
              session={mock}
              onFinished={(finished) => {
                setMock(null);
                setMockResult(finished);
              }}
            />
          )
        )}
      </section>
    );
  }

  const activeLecture = active?.kind === "lecture" ? findLecture(topics, active.lectureId) : null;
  const startingSession = startAssessment.isPending;

  return (
    <section className="flex flex-col">
      <nav className="flex items-center gap-1 text-sm py-8 px-4">
        <Link href="/learnings/exams" className="text-subtle hover:underline">
          Exam prep
        </Link>
        <span className="text-subtle">/</span>
        <span className="text-muted/50 cursor-default text-nowrap truncate">{title}</span>
      </nav>

      <BookingSection purpose="exam" targetId={programId} />

      <MockExamsPanel programId={programId} onStart={setMock} onReview={setMockResult} />

      {readiness && <ReadinessPanel readiness={readiness} onPractise={practiseNode} onOpenLecture={openLecture} />}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_17rem] xl:grid-cols-[minmax(0,1fr)_22rem] gap-6 px-4 pb-8">
        <div className="min-w-0">
          {!session && activeLecture && <p className="mb-3 px-1 text-lg font-semibold">{activeLecture.title}</p>}
          {isLoading ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
              Loading…
            </div>
          ) : session ? (
            <AssessmentPlayer
              key={session.session_id}
              session={session}
              onDone={() => setSession(null)}
              onRestart={() => active && handleSelect(active)}
              onOpenLecture={openLecture}
            />
          ) : sessionError ? (
            <p className="rounded-2xl bg-muted/10 p-6 text-sm text-danger">{sessionError}</p>
          ) : startingSession ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
              Starting…
            </div>
          ) : !activeLecture ? (
            <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted/10 text-sm text-muted">
              {allLectures.length === 0
                ? "This program has no content yet."
                : "Pick a lecture, practice or exercise from the content list."}
            </div>
          ) : activeLecture.content ? (
            <InteractiveLessonContent
              html={activeLecture.content}
              lessonTitle={activeLecture.title}
              onComplete={() => markLectureComplete(activeLecture.lecture_id)}
            />
          ) : youTubeEmbedUrl(activeLecture.video_url) ? (
            <iframe
              src={youTubeEmbedUrl(activeLecture.video_url) ?? undefined}
              className="aspect-video w-full rounded-2xl"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isPdfUrl(activeLecture.video_url) ? (
            <iframe
              src={activeLecture.video_url ?? undefined}
              title={activeLecture.title}
              className="aspect-video w-full rounded-2xl border border-muted/20"
            />
          ) : (
            <CoursePlayer
              src={activeLecture.video_url ?? undefined}
              onEnded={() => markLectureComplete(activeLecture.lecture_id)}
            />
          )}

          {!session && activeLecture && !activeLecture.content && (
            <div className="mt-4 flex items-center justify-end px-1">
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
