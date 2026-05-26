import {courseDetails, Lessons} from "@/src/features/constants/demoCourses";
import CoursePlayModules from "./CourseModules";
import Link from "next/link";
import CoursePlayer from "./CoursePlayer";
import {useState} from "react";

export default function CourseContent({
  course,
}: {
  course: (typeof courseDetails)[0];
}) {
  const [activeLesson, setActiveLesson] = useState<Lessons | null>(null);
  console.log(activeLesson, course);
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
          <div className="pb-14 w-full min-w-full">
            <CoursePlayer
              src={activeLesson?.src}
              poster={"/assets/images/courses/photography-big.jpg"}
            />
          </div>
        </div>
        <CoursePlayModules
          levels={course.modules}
          setActiveLessonSrc={setActiveLesson}
        />
      </div>
    </section>
  );
}
