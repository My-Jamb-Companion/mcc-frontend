import {courseDetails} from "@/src/features/constants/demoCourses";
import CoursePlayModules, {CourseModuleLevel} from "./CourseModules";
import Link from "next/dist/client/link";
import CourseHero from "./CourseHero";

export default function CoursePlayer({
  course,
}: {
  course: (typeof courseDetails)[0];
}) {
  return (
    <section>
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default">{course.title}</span>
      </nav>
      <div className="flex gap-6">
        <div className="pb-8">
          <div className="pb-14">
            <CourseHero
              mainImage={course.imgBig}
              instructorImage={course.imgSmall}
              rating={course.rating}
              totalRatings={course.totalRatings}
              // onPlay={() => setVideoOpen(true)}
            />
          </div>
        </div>
        <CoursePlayModules levels={courseData} />
      </div>
    </section>
  );
}
const courseData: CourseModuleLevel[] = [
  {
    title: "Beginner level",
    progress: 12,
    modules: [
      {
        title: "Introduction",
        lessons: [
          {title: "Introduction", duration: "2:02", type: "video"},
          {title: "Course Aims & Objectives", duration: "3:02", type: "doc"},
          {
            title: "Teaching Pilates: The Rules & Regulations",
            duration: "3:25",
            type: "quiz",
          },
          {title: "CPD Explained", duration: "1:31", type: "video"},
          {title: "Certification Information", duration: "2:56", type: "doc"},
          {title: "Student Guide to MCC", duration: "0:49", type: "quiz"},
        ],
      },
      {title: "Module #2"},
      {title: "Module #3"},
    ],
  },
  {
    title: "Amateur level",
    status: "not started",
    modules: [{title: "Module #4"}, {title: "Module #5"}, {title: "Module #6"}],
  },
  {
    title: "Professional level",
    status: "not started",
    modules: [
      {title: "Module #7"},
      {title: "Module #8"},
      {title: "Module #9"},
      {title: "Module #10"},
    ],
  },
];
