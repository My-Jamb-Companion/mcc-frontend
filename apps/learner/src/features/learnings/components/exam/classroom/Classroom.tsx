"use client";

import {Icon} from "@mcc/ui";
import {useExam} from "../context/ExamContext";
import ClassroomSidebar from "./ClassroomSidebar";
import {redirect} from "next/navigation";
import {useState} from "react";
import ClassroomUnitsPath, {SubLessonNode, UnitList} from "./ClassroomPath";
import UnitDetailView from "./UnitDetails";
import Link from "next/link";

export default function Classroom() {
  const {activeClassroomExam, activeClassroomSubject, activeClassroomUnit} =
    useExam();
  if (!activeClassroomExam || !activeClassroomSubject || !activeClassroomUnit) {
    redirect("/learnings/exams/utme");
  }
  const [isHeaderActive, setIsHeaderActive] = useState(true);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const selectedLessonIndex = selectedLessonId
    ? activeClassroomUnit.lessons.findIndex((l) => l.id === selectedLessonId)
    : 0;

  const selectedLesson =
    activeClassroomUnit.lessons[selectedLessonIndex] ??
    activeClassroomUnit.lessons[0];

  if (!selectedLesson) {
    return null;
  }

  return (
    <section className="flex flex-col gap-y-6 min-h-screen py-6 px-4 overflow-y-auto">
      <div className="w-full flex items-center justify-between">
        <div className="hidden md:block">
          <p className="text-xl">
            Welcome <span className="font-bold">Bright 🌞</span>
          </p>
          <p className="text-sm font-medium">
            Start preparing for your <span className="font-bold">UTME 📖</span>
          </p>
        </div>

        <div className="flex items-center gap-3 max-md:w-full">
          <div className="flex items-center">
            <Icon icon="ri:rocket-fill" />
            <div className="flex items-center">
              <p className="text-4xl font-bold text-subtle">0</p>
              <p className="text-xs text-subtle">
                prep
                <br />
                steak
              </p>
            </div>
          </div>

          <div></div>

          <div className="flex items-center flex-1 min-w-0">
            <Icon icon="raphael:arrowright" size={15} />

            <div className="flex flex-col flex-1 min-w-0 gap-1 ml-2">
              <div className="flex items-center gap-1">
                <p className="text-sm whitespace-nowrap">Level 1</p>
                <Icon icon="ri:information-2-line" size={17} />
              </div>

              <div className="flex items-center gap-3 w-full">
                <div className="flex-1 h-1 rounded-full bg-muted/10 md:flex-none md:w-[140px]" />

                <div className="flex items-center justify-center whitespace-nowrap">
                  <span className="font-medium">0</span>
                  <span className="text-subtle">/1 skill</span>
                </div>
              </div>
            </div>

            <button className="bg-blue-500! rounded-sm md:ml-10 ml-3 w-fit flex items-center gap-3 py-2 px-3 max-sm:hidden">
              Level up <Icon icon="grommet-icons:link-next" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 gap-6">
        <div className="w-full grow max-w-[300px] max-sm:hidden">
          <ClassroomSidebar
            units={activeClassroomUnit}
            isHeaderActive={isHeaderActive}
            setIsHeaderActive={setIsHeaderActive}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
          />
        </div>

        <div className="w-full grow">
          <ClassRoomHeader
            examName={activeClassroomExam}
            subject={activeClassroomSubject}
            unit={activeClassroomUnit.title}
            isHeaderActive={isHeaderActive}
            unitTitle={`Unit ${selectedLessonIndex + 1}: ${selectedLesson.title}`}
            // masteryPoints={selectedLesson.masteryPoints}
            subLessons={selectedLesson.subLessons}
            setIsHeaderActive={setIsHeaderActive}
            setSelectedLessonId={setSelectedLessonId}
          />
          {isHeaderActive ? (
            <div className="flex flex-col gap-8">
              <ClassroomUnitsPath
                lessons={activeClassroomUnit.lessons}
                setIsHeaderActive={setIsHeaderActive}
                setSelectedLessonId={setSelectedLessonId}
              />
              <UnitList unit={activeClassroomUnit} />
            </div>
          ) : (
            <UnitDetailView lesson={selectedLesson} />
          )}
        </div>
      </div>
    </section>
  );
}

function ClassRoomHeader({
  examName,
  subject,
  unit,
  isHeaderActive,
  setIsHeaderActive,
  setSelectedLessonId,
  unitTitle,
  // masteryPoints,
  subLessons,
}: {
  examName: string;
  subject: string;
  unit: string;
  isHeaderActive: boolean;
  unitTitle: string;
  masteryPoints?: number;
  subLessons: {
    type: "topic" | "quiz" | "test" | "practice" | "video" | "doc";
  }[];
  setIsHeaderActive: (value: boolean) => void;
  setSelectedLessonId: (value: string | null) => void;
}) {
  return (
    <section className="relative bg-primary-gradient sm:px-8 sm:py-10 px-4 py-5 text-white">
      <div className="flex flex-col gap-5 max-sm:gap-2">
        <div className="flex items-center gap-2">
          <Link
            href={"/learnings/exams"}
            className="text-sm font-medium max-sm:text-xs"
          >
            Course
          </Link>
          <Icon icon="iconoir:slash" color="black" size={14} />
          <Link
            href={`/learnings/exams/${examName}`}
            className="text-sm font-medium max-sm:text-xs uppercase"
          >
            {examName}
          </Link>
          <Icon icon="iconoir:slash" color="black" size={14} />
          <p
            onClick={() => {
              setIsHeaderActive(true);
              setSelectedLessonId("");
            }}
            className={`text-sm font-medium max-sm:text-xs capitalize ${isHeaderActive ? "opacity-70" : ""}`}
          >
            {subject}
          </p>
          {!isHeaderActive && (
            <>
              <Icon icon="iconoir:slash" color="black" size={14} />
              <p className="text-sm font-medium capitalize opacity-70">
                classroom
              </p>
            </>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="text-2xl font-bold max-sm:text-xl">
            {isHeaderActive ? unit : unitTitle}
          </h4>
          <p className="font-medium max-sm:text-xs">
            18,200 possible mastery points
          </p>

          {!isHeaderActive && (
            <div className="flex items-center gap-2">
              {subLessons?.map((subLesson, idx) => (
                <SubLessonNode
                  key={`${subLesson.type}-${idx + 1}`}
                  subLesson={subLesson}
                  isUpNext={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <img
        src="/public/assets/images/courses/Classroom header svg.png"
        alt="Classroom header svg"
        className="absolute right-5 bottom-0"
      />
    </section>
  );
}
