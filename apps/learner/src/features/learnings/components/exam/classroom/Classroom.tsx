"use client";

import {Button, Icon} from "@mcc/ui";
import {useExam} from "../context/ExamContext";
import ClassroomSidebar from "./ClassroomSidebar";
import {redirect} from "next/navigation";
import {useState} from "react";
import ClassroomUnitsPath, {SubLessonNode, UnitList} from "./ClassroomPath";
import UnitDetailView from "./UnitDetails";

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

  // console.log(activeClassroomUnit);
  return (
    <section className="flex flex-col gap-y-6 min-h-screen py-6 px-4 overflow-y-auto">
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-xl">
            Welcome <span className="font-bold">Bright 🌞</span>
          </p>
          <p className="text-sm font-medium">
            Start preparing for your <span className="font-bold">UTME 📖</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <div className="flex items-center">
            <Icon icon="raphael:arrowright" size={45} />
            <div className="flex flex-col gap-1 ml-2">
              <div className="flex items-center gap-1">
                <p className="text-sm text-nowrap">Level 1 </p>
                <Icon icon="ri:information-2-line" size={17} />
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted/10  w-[140px] h-1" />
                <div className="flex items-center justify-center text-nowrap">
                  <span className="font-medium">0</span>
                  <span className="text-subtle">/1 skill</span>
                </div>
              </div>
            </div>

            <Button radius="sm" className="bg-blue-500! ml-10">
              Level up <Icon icon="grommet-icons:link-next" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1 gap-6">
        <div className="w-full grow max-w-[300px]">
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
          />
          {isHeaderActive ? (
            <div className="flex flex-col gap-8">
              <ClassroomUnitsPath lessons={activeClassroomUnit.lessons} />
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
  unitTitle,
  masteryPoints,
  subLessons,
}: {
  examName: string;
  subject: string;
  unit: string;
  isHeaderActive: boolean;
  unitTitle: string;
  masteryPoints?: number;
  subLessons: {
    type: "topic" | "quiz" | "test" | "practice";
  }[];
}) {
  return (
    <section className="relative bg-primary-gradient px-8 py-10 text-white">
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">Course </p>
          <Icon icon="iconoir:slash" color="black" size={14} />
          <p className="text-sm font-medium uppercase">{examName}</p>
          <Icon icon="iconoir:slash" color="black" size={14} />
          <p
            className={`text-sm font-medium capitalize ${isHeaderActive ? "opacity-70" : ""}`}
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
          <h4 className="text-2xl font-bold">
            {isHeaderActive ? unit : unitTitle}
          </h4>
          <p className="font-medium ">18,200 possible mastery points</p>

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
