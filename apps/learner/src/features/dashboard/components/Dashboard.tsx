"use client";
import {Icon} from "@mcc/ui";
import {useRouter} from "next/navigation";
import BannerCarousel from "@/src/features/components/BannerCarousel";
import QuickLinkCard from "./QuickLinkCard";
import {quickLinkCard} from "../constants/QuickLinks";
import LiveClassCard from "./LiveClassCard";
import ScrollRow from "@/src/features/components/RowScroll";
import CourseCard from "@/src/features/components/CourseCard";
import CourseCardSkeleton from "@/src/features/components/CourseCardSkeleton";
import AskAICard from "./AskAI";
import ExamCard from "@/src/features/components/ExamCard";
import RecTopics from "./RecTopics";
import ExamCardSkeleton from "@/src/features/components/ExamCardSkeleton";
import {useCourses, useEnrolledCourses} from "@/src/features/courses/hooks/useCourses";
import {fromApiCourse, fromApiEnrolledCourse} from "@/src/features/courses/helper/course.mapper";
import {usePrograms} from "@/src/features/exams/hooks/useExams";
import {fromApiExamProgram} from "@/src/features/exams/helper/exam.mapper";
import {useUpcomingSessions} from "@/src/features/sessions/hooks/useSessions";
import {useProfile} from "@/src/features/account/hooks/useProfile";

export default function Dashboard() {
  const router = useRouter();
  const {data: profile} = useProfile();
  const {courses: allCourses, isLoading: coursesLoading} = useCourses();
  const {courses: enrolledCourses, isLoading: enrolledLoading} = useEnrolledCourses();
  const {programs, isLoading: programsLoading} = usePrograms();
  const {sessions} = useUpcomingSessions();

  const enrolledIds = new Set(enrolledCourses.map((c) => c.course_id));
  const notYetEnrolled = allCourses.filter((c) => !enrolledIds.has(c.course_id));
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

      <div className="mt-7">
        <BannerCarousel />
      </div>

      {nextSession && (
        <div className="mt-10 mx-auto w-[70%] max-sm:w-full">
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
        </div>
      )}

      <div className="flex items-center gap-4 mt-8 max-md:flex-col">
        {quickLinkCard.map((card) => (
          <QuickLinkCard
            key={card.title}
            title={card.title}
            icon={card.icon}
            link={card.link}
          />
        ))}
      </div>

      <div className="grid grid-cols-2 max-lg:grid-cols-1 gap-4 mt-8">
        <div className="flex flex-col gap-10">
          <ScrollRow
            showSeeAll
            title="Continue Learning"
            isLoading={enrolledLoading}
            skeleton={<CourseCardSkeleton />}
            skeletonCount={4}
          >
            {enrolledCourses.length === 0 && !enrolledLoading ? (
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
            title="What to learn next?"
            isLoading={coursesLoading}
            skeleton={<CourseCardSkeleton />}
            skeletonCount={4}
          >
            {notYetEnrolled.map((course) => (
              <div key={course.course_id} className="shrink-0 w-72">
                <CourseCard {...fromApiCourse(course)} />
              </div>
            ))}
          </ScrollRow>
        </div>

        <div className="flex flex-col gap-7">
          <AskAICard onSubmit={(query) => router.push(`/brainy/new?q=${encodeURIComponent(query)}`)} />
          <ScrollRow
            variant="card"
            title="Practice Exams"
            subTitle="Pick up where you left off"
            isLoading={programsLoading}
            skeleton={<ExamCardSkeleton />}
            skeletonCount={5}
          >
            {programs.map((program) => (
              <ExamCard key={program.program_id} exam={fromApiExamProgram(program)} />
            ))}
          </ScrollRow>
        </div>
      </div>

      <div className="pt-8">
        <RecTopics />
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
