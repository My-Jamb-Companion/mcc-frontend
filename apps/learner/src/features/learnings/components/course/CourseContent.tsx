"use client";

import {CourseDetail, Lessons} from "@/src/features/constants/demoCourses";
import CoursePlayModules from "./CourseModules";
import Link from "next/link";
import CoursePlayer from "./CoursePlayer";
import {useState, useCallback} from "react";
import {useAllLessons} from "@/src/features/learnings/hooks/useLesson";
import {Button} from "@mcc/ui";
import {useRouter, usePathname, useSearchParams} from "next/navigation";

export default function CourseContent({course}: {course: CourseDetail}) {
  const allLessons = useAllLessons(course);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get("tab");
  const tabs = ["overview", "community", "notes", "facilitator"];

  const activeTab = tabQuery && tabs.includes(tabQuery) ? tabQuery : "overview";

  const [activeLesson, setActiveLesson] = useState<Lessons | null>(
    allLessons[0] || null,
  );

  const handleTabChange = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      router.push(pathname + "?" + params.toString(), {scroll: false});
    },
    [searchParams, pathname, router],
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

          <div className="flex items-center gap-6 py-4 mt-8">
            {tabs.map((tab) => (
              <Button
                key={tab}
                variant={activeTab === tab ? "outline" : "ghost"}
                size="sm"
                className={`capitalize ${activeTab === tab ? "font-bold text-black" : "text-muted"}`}
                width="fit"
                onClick={() => handleTabChange("tab", tab)}
              >
                {tab}
              </Button>
            ))}
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
