import {CourseDetail, Lessons} from "@/src/features/constants/demoCourses";
import CoursePlayModules from "./CourseModules";
import Link from "next/link";
import CoursePlayer from "./CoursePlayer";
import {useState} from "react";
import {useAllLessons} from "@/src/features/learnings/hooks/useLesson";

export default function CourseContent({course}: {course: CourseDetail}) {
  const allLessons = useAllLessons(course);

  const [activeLesson, setActiveLesson] = useState<Lessons | null>(
    allLessons[0] || null,
  );

  const handleVideoEnded = () => {
    if (!activeLesson) return;
    const currentIndex = allLessons.findIndex(
      (item) => item.id === activeLesson.id,
    );
    if (currentIndex >= 0 && currentIndex < allLessons.length - 1) {
      setActiveLesson(allLessons[currentIndex + 1]);
    }
  };

  return (
    <section>
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default">{course.title}</span>
      </nav>
      <div className="flex gap-6 max-sm:flex-col">
        <div className="pb-8">
          <div className="pb-14 w-full min-w-full">
            <CoursePlayer
              src={activeLesson?.src}
              poster={course.imgBig}
              onEnded={handleVideoEnded}
            />
          </div>
        </div>
        <CoursePlayModules
          levels={course.curriculums}
          setActiveLessonSrc={setActiveLesson}
          activeLesson={activeLesson?.id}
        />
      </div>
    </section>
  );
}
