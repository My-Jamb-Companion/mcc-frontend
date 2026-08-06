"use client";

import {useRouter, useSearchParams} from "next/navigation";
import {useExam} from "../context/ExamContext";
import {ClassroomPlayerSidebar} from "./ClassroomPlayerSidBar";
import ClassroomLessonPlayer from "./ClassroomlessonPlayer";
import {useEffect, useMemo, useState} from "react";
import ClassroomPlayerTabs from "./ClassroomPlayerTabs";
import {Icon} from "@mcc/ui";
import MagicNote from "./MagicNote";

type NavigationItem = {
  id: string;
  title: string;
  type: string;
  src?: string;
  parentTopicId: string | null;
  parentTopicTitle: string | null;
};

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

  const derivedOpenTopics = useMemo<string[]>(() => {
    if (!subLessonId) return [];
    const topic = subLessons.find(
      (lesson) =>
        lesson.type === "topic" &&
        lesson.learnItems?.some((item) => item.id === subLessonId),
    );
    return topic ? [topic.id] : [];
  }, [subLessonId, subLessons]);

  const [manuallyOpenTopics, setManuallyOpenTopics] = useState<string[]>([]);

  const openTopics = useMemo<string[]>(
    () => Array.from(new Set([...derivedOpenTopics, ...manuallyOpenTopics])),
    [derivedOpenTopics, manuallyOpenTopics],
  );

  const setOpenTopics = setManuallyOpenTopics;

  const navigateSubLesson = (id: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("subLesson", id);

    setMagicOpen(false);
    router.push(`?${params.toString()}`);
  };

  useEffect(() => {
    if (!subLessonId && subLessons.length > 0) {
      const firstPlayableItem =
        subLessons[0].type === "topic"
          ? subLessons[0].learnItems?.[0]
          : subLessons[0];

      if (!firstPlayableItem) return;

      const params = new URLSearchParams(searchParams);
      params.set("subLesson", firstPlayableItem.id);

      router.replace(`?${params.toString()}`);
    }
  }, [subLessonId, subLessons, searchParams, router]);



  const navigationItems = useMemo<NavigationItem[]>(() => {
    return subLessons.flatMap<NavigationItem>((lesson) => {
      if (lesson.type === "topic") {
        return (
          lesson.learnItems?.map((item) => ({
            id: item.id,
            title: item.title,
            type: item.type,
            src: item.src,
            parentTopicId: lesson.id,
            parentTopicTitle: lesson.title,
          })) ?? []
        );
      }

      return [
        {
          id: lesson.id,
          title: lesson.title,
          type: lesson.type,
          parentTopicId: null,
          parentTopicTitle: null,
        },
      ];
    });
  }, [subLessons]);

  const activeIndex = navigationItems.findIndex(
    (item) => item.id === subLessonId,
  );

  const activeNavigationItem = navigationItems[activeIndex];

  const canGoPrevious = activeIndex > 0;

  const canGoNext =
    activeIndex >= 0 && activeIndex < navigationItems.length - 1;

  const goPrevious = () => {
    if (!canGoPrevious) return;

    const previousItem = navigationItems[activeIndex - 1];

    if (previousItem) {
      navigateSubLesson(previousItem.id);
    }
  };

  const goNext = () => {
    if (!canGoNext) return;

    const nextItem = navigationItems[activeIndex + 1];

    if (nextItem) {
      navigateSubLesson(nextItem.id);
    }
  };

  const toggleTopic = (topicId: string) => {
    setManuallyOpenTopics((previous) =>
      previous.includes(topicId)
        ? previous.filter((id) => id !== topicId)
        : [...previous, topicId],
    );
  };
  return (
    <section className="flex h-full flex-col gap-6  p-4">
      <div className="flex flex-1 gap-6 max-sm:flex-col ">
        <div
          className={`relative shrink-0 transition-all duration-300 ease-in-out max-md:hidden ${
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
              openTopics={openTopics}
              setOpenTopics={setOpenTopics}
              canGoPrevious={canGoPrevious}
              canGoNext={canGoNext}
              goPrevious={goPrevious}
              goNext={goNext}
              activeTitle={activeNavigationItem?.title}
              activeTopicTitle={activeNavigationItem?.parentTopicTitle || ""}
              activeIndex={activeIndex}
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
          <div className="relative bg-primary-gradient px-8 py-10 text-white max-md:hidden">
            <div className="flex flex-col gap-5 items-center">
              <h4 className="text-2xl font-bold">
                {activeNavigationItem?.title ?? "Select a lesson"}
              </h4>
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
          </div>

          <div className="pb-3 md:hidden">
            <div className="px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-sky-500">
                  <Icon
                    icon="mdi:book-open-page-variant"
                    className="text-white"
                    size={16}
                  />
                </div>

                <span className="truncate text-[15px] font-medium text-gray-900">
                  {activeClassroomUnit.title}
                </span>
              </div>
            </div>

            <div className="flex items-start">
              <button
                disabled={!canGoPrevious}
                onClick={goPrevious}
                className={`p-1 ${
                  canGoPrevious
                    ? "text-gray-500 hover:text-gray-700"
                    : "cursor-not-allowed text-gray-300"
                }`}
              >
                <Icon icon="mdi:chevron-left" size={20} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <span>{activeClassroomSubject}</span>
                  <Icon icon="mdi:chevron-right" size={12} />
                  <span>Classroom</span>
                </div>

                {activeNavigationItem?.parentTopicTitle && (
                  <p className="mt-2 truncate text-xs text-gray-500">
                    Unit {activeIndex + 1}:{" "}
                    {activeNavigationItem.parentTopicTitle}
                  </p>
                )}

                <p className="truncate text-[13px] font-medium text-gray-900">
                  Lesson {activeIndex + 1}:{" "}
                  {activeNavigationItem?.title ?? "Select a lesson"}
                </p>
              </div>

              <button
                disabled={!canGoNext}
                onClick={goNext}
                className={`p-1 ${
                  canGoNext
                    ? "text-gray-500 hover:text-gray-700"
                    : "cursor-not-allowed text-gray-300"
                }`}
              >
                <Icon icon="mdi:chevron-right" size={20} />
              </button>
            </div>
          </div>

          {magicOpen ? (
            <MagicNote topic={activeNavigationItem?.title || ""} />
          ) : (
            activeLesson && (
              <ClassroomLessonPlayer
                src={"/lesson2-2.mkv"}
                poster={"/lesson2-2.png"}
              />
            )
          )}

          <ClassroomPlayerTabs
            magicOpen={magicOpen}
            setMagicOpen={setMagicOpen}
            mobileContent={
              <>
                <div className="flex-1 overflow-y-auto pt-5">
                  {subLessons.map((lesson) => {
                    if (lesson.type === "topic") {
                      const open = openTopics.includes(lesson.id);

                      const topicActive = lesson.learnItems?.some(
                        (item) => item.id === subLessonId,
                      );

                      return (
                        <div
                          key={lesson.id}
                          className="border-b border-muted/30 first:border-t"
                        >
                          <button
                            onClick={() => toggleTopic(lesson.id)}
                            className={`flex w-full items-center justify-between px-4 py-3 ${
                              topicActive ? "bg-violet-50" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Icon icon="mdi:folder-outline" size={16} />

                              <span className="text-sm font-medium">
                                {lesson.title}
                              </span>
                            </div>

                            <Icon
                              icon={
                                open ? "mdi:chevron-down" : "mdi:chevron-right"
                              }
                              size={18}
                            />
                          </button>

                          {open &&
                            lesson.learnItems?.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => navigateSubLesson(item.id)}
                                className={`relative flex h-11 w-full items-center gap-3 pl-10 pr-4 ${
                                  subLessonId === item.id
                                    ? "bg-violet-50 text-violet-700"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                {subLessonId === item.id && (
                                  <div className="absolute left-0 top-0 h-full w-1 bg-violet-600" />
                                )}

                                <Icon
                                  icon="mdi:play-circle-outline"
                                  size={16}
                                />

                                <span className="truncate text-sm">
                                  {item.title}
                                </span>
                              </button>
                            ))}
                        </div>
                      );
                    }

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => navigateSubLesson(lesson.id)}
                        className={`relative flex w-full items-center gap-3 border-b border-muted/30 px-4 py-3 ${
                          subLessonId === lesson.id
                            ? "bg-violet-50"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <Icon
                          icon={
                            lesson.type === "quiz" || lesson.type === "test"
                              ? "tdesign:pen-ball"
                              : "mdi:play-circle-outline"
                          }
                          size={15}
                        />

                        <span className="truncate text-sm">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            }
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
