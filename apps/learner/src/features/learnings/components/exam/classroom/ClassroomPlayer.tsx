"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useExam} from "../context/ExamContext";
import {ClassroomPlayerSidebar} from "./ClassroomPlayerSidBar";
import ClassroomLessonPlayer from "./ClassroomlessonPlayer";
import {useEffect, useState} from "react";
import VideoTabs from "./Tabs";
import {Icon} from "@mcc/ui";
import MagicNote from "./MagicNote";

export default function ClassroomPlayer() {
  const {activeClassroomUnit, activeClassroomSubject} = useExam();

  const router = useRouter();
  const searchParams = useSearchParams();

  const [navOpen, setNavOpen] = useState(true);
  const [magicOpen, setMagicOpen] = useState(false);

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

    setMagicOpen(false);
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
    <section className="flex h-full flex-col gap-6  p-4">
      <div className="flex flex-1 gap-6 ">
        <div
          className={`relative shrink-0 transition-all duration-300 ease-in-out ${
            navOpen ? "w-[300px]" : "w-0"
          }`}
        >
          <div className="h-full overflow-hidden">
            <ClassroomPlayerSidebar
              unitName={activeClassroomUnit.title}
              unitSubject={activeClassroomSubject}
              lessons={subLessons}
              activeLessonId={subLessonId}
              setActiveLessonId={navigateSubLesson}
            />
          </div>

          <button
            onClick={() => setNavOpen(!navOpen)}
            className={`absolute top-24  z-50 flex p-1.5 items-center justify-center rounded-lg border border-gray-200 bg-white shadow transition-all duration-400 ease-in-out cursor-pointer ${navOpen ? "rounded-r-none -right-6" : "rounded-l-none -right-9 animate-pulse"}`}
          >
            <Icon
              icon="ri:contract-left-line"
              className={`transition-transform duration-300 ${
                navOpen ? "" : "rotate-180"
              }`}
            />
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <section className="relative bg-primary-gradient px-8 py-10 text-white">
            <div className="flex flex-col gap-5 items-center">
              <h4 className="text-2xl font-bold">{activeSubLesson?.title}</h4>
              <div className="flex items-center gap-3">
                <Icon icon="ri:live-fill" />
                <span className="font-medium">Learn Live</span>
                <Icon icon="line-md:external-link" />
                <Icon icon="ri:bard-fill" />
              </div>
            </div>
            <img
              src="/public/assets/images/courses/Classroom header svg.png"
              alt="Classroom header svg"
              className="absolute right-5 bottom-0"
            />
          </section>

          {magicOpen ? (
            <MagicNote topic={activeSubLesson?.title || ""} />
          ) : (
            activeLesson && (
              <ClassroomLessonPlayer
                src={"/lesson2-2.mkv"}
                poster={"/lesson2-2.png"}
              />
            )
          )}

          <VideoTabs
            magicOpen={magicOpen}
            setMagicOpen={setMagicOpen}
            description={`Where did the word "Algebra" and its underlying ideas come from?

Algebra, a key branch of mathematics, has a rich history. The term comes from the Arabic word meaning restoration or completion...

Created by Sal Khan.`}
            transcript={[
              {
                time: "0:00",
                text: "What I want to do in this video is",
              },
              {
                time: "0:01",
                text: "think about the origin of algebra",
              },
              {
                time: "0:04",
                text: "The origins of algebra, and the word",
              },
              {
                time: "0:08",
                text: "especially in association with the idea",
              },
              {
                time: "0:10",
                text: "that algebra now represents, comes from this book",
              },
              {
                time: "0:15",
                text: "or actually this is a page of the book right over there",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
