"use client";
import {useState} from "react";
import {Icon} from "@mcc/ui";
import {useRouter} from "next/navigation";
import LiveClassCard from "./LiveClassCard";
import ScrollRow from "@/src/features/components/RowScroll";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import AskAICard from "./AskAI";
import {brainyChatUrl, pickSurprisePrompt} from "@/src/features/brainy/helper/surprise";
import {usePromptSuggestions} from "@/src/features/brainy/hooks/useDiscover";
import ExamCard from "@/src/features/components/ExamCard";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import {useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";
import {useEnrolledPrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiEnrolledProgram} from "@/src/features/exams/helper/exam.mapper";
import {useUpcomingSessions} from "@/src/features/sessions/hooks/useSessions";
import {RescheduleModal} from "@/src/features/sessions/RescheduleModal";
import {useProfile} from "@/src/features/account/hooks/useProfile";

/**
 * The student's personal home: welcome back, live class, quick Brainy
 * access, and what they're already enrolled in. Discovery/marketing
 * content (browse catalogue, promos, AI-suggested courses, topics) lives
 * on /explore instead -- see apps/learner/src/features/explore.
 */
export default function Dashboard() {
  const router = useRouter();
  const {suggestions} = usePromptSuggestions();
  const [reschedulingSessionId, setReschedulingSessionId] = useState<string | null>(null);
  const {data: profile} = useProfile();
  const {courses: enrolledCourses, isLoading: enrolledCoursesLoading} = useEnrolledCourses();
  const {programs: enrolledPrograms, isLoading: enrolledProgramsLoading} = useEnrolledPrograms();
  const {sessions} = useUpcomingSessions();

  const nextSession = sessions[0];

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="col-start-2 max-sm:col-start-1 pt-6 px-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full h-14 w-14 bg-[#B190B6] overflow-hidden">
          <img
            src={profile?.profile_photo_url || "/assets/images/profile.png"}
            alt="profile image"
            className="w-full h-full"
          />
        </div>
        <div>
          <p className="text-muted font-medium">
            Good to have you,
            <span className="text-black dark:text-white"> {firstName}.</span>
          </p>
          <p
            onClick={() => router.push("/account")}
            className="flex items-center cursor-pointer text-btn-primary text-xs font-medium"
          >
            <span>Personalize your experience</span>
            <Icon icon="ci:caret-right-sm" size={24} />
          </p>
        </div>
      </div>

      {nextSession && (
        <div className="mt-7 mx-auto w-[70%] max-sm:w-full">
          <LiveClassCard
            title={nextSession.title}
            thumbnail="/assets/images/profile.png"
            instructorImage="/assets/images/pencil.jpg"
            instructorName={nextSession.teacher_name || "Your teacher"}
            scheduledAt={new Date(nextSession.scheduled_at)}
            datetime={new Date(nextSession.scheduled_at).toLocaleString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              weekday: "short",
              day: "2-digit",
              month: "short",
            })}
            onJoin={() => {
              if (nextSession.meeting_url) window.open(nextSession.meeting_url, "_blank");
            }}
          />
          {nextSession.series_id && (
            <button
              onClick={() => router.push(`/messages/series/${nextSession.series_id}`)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-btn-primary hover:underline"
            >
              <Icon icon="ph:chat-circle-text" size={14} />
              Message {nextSession.teacher_name || "your teacher"}
            </button>
          )}
          <button
            onClick={() => setReschedulingSessionId(nextSession.session_id)}
            className="mt-2 flex items-center gap-1 text-xs font-medium text-btn-primary hover:underline"
          >
            <Icon icon="ph:calendar-blank" size={14} />
            Reschedule
          </button>
        </div>
      )}

      <RescheduleModal
        sessionId={reschedulingSessionId}
        onClose={() => setReschedulingSessionId(null)}
      />

      <div className="mt-8">
        <AskAICard
          onSubmit={(query) => router.push(brainyChatUrl(query))}
          onSurprise={() => router.push(brainyChatUrl(pickSurprisePrompt(suggestions)))}
        />
      </div>

      <div className="flex flex-col gap-10 mt-8">
        <ScrollRow
          showSeeAll
          title="Continue Learning"
          onSeeAll={() => router.push("/learnings")}
          isLoading={enrolledCoursesLoading}
          skeleton={<CourseCardSkeleton />}
          skeletonCount={4}
        >
          {enrolledCourses.length === 0 && !enrolledCoursesLoading ? (
            <p className="text-sm text-muted">
              You haven&apos;t started any courses yet.
            </p>
          ) : (
            enrolledCourses.map((course) => (
              <div key={course.course_id} className="shrink-0 w-72">
                <CourseCard {...fromApiEnrolledCourse(course)} />
              </div>
            ))
          )}
        </ScrollRow>

        <ScrollRow
          showSeeAll
          title="My Exam Programs"
          onSeeAll={() => router.push("/learnings")}
          isLoading={enrolledProgramsLoading}
          skeleton={<ExamCardSkeleton />}
          skeletonCount={4}
        >
          {enrolledPrograms.length === 0 && !enrolledProgramsLoading ? (
            <p className="text-sm text-muted">
              You haven&apos;t enrolled in any exam programs yet.
            </p>
          ) : (
            enrolledPrograms.map((program) => (
              <ExamCard key={program.program_id} exam={fromApiEnrolledProgram(program)} />
            ))
          )}
        </ScrollRow>
      </div>

      <div className="flex items-center justify-between px-16 py-8 text-sm font-medium max-sm:flex-col w-full max-sm:px-3">
        <p className="text-muted">© 2026 MC companion</p>
        <div className="flex items-center gap-5 max-sm:justify-between">
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Terms and Conditions
          </p>
          <p className="underline text-muted hover:text-primary cursor-pointer">
            Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
}
