"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useExam} from "../context/ExamContext";
import {ClassroomPlayerSidebar} from "./ClassroomPlayerSidBar";
import ClassroomLessonPlayer from "./ClassroomlessonPlayer";
import {useEffect} from "react";

export default function ClassroomPlayer() {
  const {activeClassroomUnit, activeClassroomSubject} = useExam();

  const router = useRouter();
  const searchParams = useSearchParams();

  const lessonId = searchParams.get("lesson");
  const subLessonId = searchParams.get("subLesson");

  const activeLesson = activeClassroomUnit?.lessons?.find(
    (lesson) => lesson.id === lessonId,
  );

  const subLessons = activeLesson?.subLessons ?? [];

  const activeSubLesson = subLessons.find(
    (lesson) => lesson.id === subLessonId,
  );

  const navigateSubLesson = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("subLesson", id);

    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    if (!subLessonId && subLessons.length > 0) {
      const params = new URLSearchParams(searchParams);
      params.set("subLesson", subLessons[0].id);

      router.replace(`?${params.toString()}`);
    }
  }, [subLessonId, subLessons]);

  return (
    <section className="flex h-full flex-col gap-6 overflow-hidden p-4">
      <div className="flex flex-1 gap-6 overflow-hidden">
        <div className="w-[300px] shrink-0">
          <ClassroomPlayerSidebar
            unitName={activeClassroomUnit.title}
            unitSubject={activeClassroomSubject}
            lessons={subLessons}
            activeLessonId={subLessonId}
            setActiveLessonId={navigateSubLesson}
          />
        </div>

        <div className="min-w-0 flex-1">
          {activeSubLesson && (
            <ClassroomLessonPlayer
              src={"/lesson2-2.mkv"}
              poster={"/lesson2-2.png"}
            />
          )}
        </div>
      </div>
    </section>
  );
}
