import {ExamLesson, ExamUnit} from "@/src/features/constants/demoExams";
import {Icon} from "@mcc/ui";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useState} from "react";
import {useExam} from "../context/ExamContext";

// Same course data, now each lesson (unit) carries a `subLessons` list.
// Each subLesson is either a regular practice node, a quiz checkpoint
// (bulb), or the unit's closing test (star).

export function SubLessonNode({
  subLesson,
  isUpNext,
}: {
  subLesson: {type: "video" | "quiz" | "test" | "doc"};
  isUpNext: boolean;
}) {
  const base =
    "w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 bg-white";
  const ring = isUpNext
    ? "border-blue-300 ring-2 ring-blue-100"
    : "border-muted/30";

  return (
    <div className={`${base} ${ring}`}>
      {subLesson.type === "quiz" && (
        <Icon icon="ri:lightbulb-fill" size={17} className="text-muted/50" />
      )}
      {subLesson.type === "test" && (
        <Icon icon="ri:star-fill" size={17} className="text-muted/50" />
      )}
    </div>
  );
}

export default function ClassroomUnitsPath({lessons}: {lessons: ExamLesson[]}) {
  // The very first sub-lesson of the very first unit is "up next".
  const upNextId = lessons[0]?.subLessons?.[0]?.id;

  return (
    <div className="w-full grid grid-cols-2 gap-x-6 ">
      {lessons.map((lesson, i) => (
        <div
          key={lesson.id}
          className="py-4 border-b border-slate-100 last:border-b-0"
        >
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[13px] font-medium text-slate-700">
              Unit {i + 1}
            </span>
            {i === 0 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-500">
                <Icon icon="ri:sparkle-fill" size={17} />
                UP NEXT FOR YOU!
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {lesson?.subLessons.map((sub) => (
              <SubLessonNode
                key={sub.id}
                subLesson={sub}
                isUpNext={sub.id === upNextId}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function UnitIcon() {
  return (
    <div
      className="w-9 h-9 rounded-lg shrink-0"
      style={{
        background:
          "linear-gradient(135deg, #22d3ee 0%, #22d3ee 45%, #2563eb 55%, #2563eb 100%)",
      }}
    />
  );
}

export function UnitList({unit}: {unit: ExamUnit}) {
  const [openId, setOpenId] = useState(unit.lessons[0]?.id ?? "");
  const pathname = usePathname();

  return (
    <div className="w-full">
      {unit.lessons.map((lesson, i) => {
        const isOpen = openId === lesson.id;
        const isFirst = i === 0;

        return (
          <div key={lesson.id} className="border-b border-slate-100">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? "" : lesson.id)}
              className="w-full flex items-start justify-between gap-4 py-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <UnitIcon />
                <div className="min-w-0">
                  {isFirst && (
                    <p className="text-[12px] font-semibold text-violet-600 mb-0.5">
                      Up next for you:
                    </p>
                  )}
                  <p className="text-[14px] font-semibold text-slate-900 truncate">
                    Unit {i + 1}: {lesson.title}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-[12px] text-slate-500 mt-0.5">
                Unit mastery: 0%
                <Icon icon="ri:information-2-line" size={17} />
              </div>
            </button>

            {isOpen && (
              <div className="pb-5">
                <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                  {lesson.subLessons
                    .filter(
                      (s) =>
                        s.type === "topic" || (s.type as string) === "practice",
                    )
                    .map((sub) => (
                      <p key={sub.id} className="text-[13.5px] text-slate-600">
                        {sub.title}
                      </p>
                    ))}
                </div>

                <Link
                  href={`${pathname}/player?lesson=${lesson?.id}`}
                  className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13.5px] font-medium hover:bg-blue-700 transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
