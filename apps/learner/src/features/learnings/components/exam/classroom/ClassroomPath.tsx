import {ExamLesson, ExamUnit} from "@/src/features/constants/demoExams";
import {Icon} from "@mcc/ui";
import {useState} from "react";

// Same course data, now each lesson (unit) carries a `subLessons` list.
// Each subLesson is either a regular practice node, a quiz checkpoint
// (bulb), or the unit's closing test (star).
const dcourseData = {
  id: "chem-reactions",
  title: "Chemical Reactions & Stoichiometry",
  totalLessons: 8,
  status: "start",
  lessons: [
    {
      id: "reaction-types",
      title: "Synthesis, decomposition, & combustion reactions",
      subLessons: [
        {id: "rt-1", type: "practice"},
        {id: "rt-2", type: "practice"},
        {id: "rt-3", type: "quiz"},
        {id: "rt-4", type: "practice"},
        {id: "rt-5", type: "practice"},
        {id: "rt-6", type: "practice"},
        {id: "rt-7", type: "practice"},
        {id: "rt-8", type: "quiz"},
        {id: "rt-9", type: "test"},
      ],
    },
    {
      id: "balancing-eq",
      title: "Balancing complex chemical equations",
      subLessons: [
        {id: "be-1", type: "practice"},
        {id: "be-2", type: "practice"},
        {id: "be-3", type: "practice"},
        {id: "be-4", type: "practice"},
        {id: "be-5", type: "quiz"},
        {id: "be-6", type: "practice"},
        {id: "be-7", type: "practice"},
        {id: "be-8", type: "quiz"},
        {id: "be-9", type: "practice"},
        {id: "be-10", type: "quiz"},
        {id: "be-11", type: "test"},
      ],
    },
    {
      id: "the-mole",
      title: "Avogadro's number & the mole concept",
      subLessons: [
        {id: "tm-1", type: "practice"},
        {id: "tm-2", type: "practice"},
        {id: "tm-3", type: "practice"},
        {id: "tm-4", type: "practice"},
        {id: "tm-5", type: "test"},
      ],
    },
    {
      id: "molar-mass-calc",
      title: "Calculating molar mass & empirical formulas",
      subLessons: [
        {id: "mm-1", type: "practice"},
        {id: "mm-2", type: "practice"},
        {id: "mm-3", type: "practice"},
        {id: "mm-4", type: "practice"},
        {id: "mm-5", type: "practice"},
        {id: "mm-6", type: "practice"},
        {id: "mm-7", type: "quiz"},
        {id: "mm-8", type: "practice"},
        {id: "mm-9", type: "practice"},
        {id: "mm-10", type: "practice"},
        {id: "mm-11", type: "practice"},
        {id: "mm-12", type: "practice"},
        {id: "mm-13", type: "practice"},
        {id: "mm-14", type: "quiz"},
        {id: "mm-15", type: "test"},
      ],
    },
    {
      id: "stoichiometry-mass",
      title: "Mass-to-mass stoichiometry calculations",
      subLessons: [
        {id: "sm-1", type: "practice"},
        {id: "sm-2", type: "practice"},
        {id: "sm-3", type: "practice"},
        {id: "sm-4", type: "quiz"},
        {id: "sm-5", type: "practice"},
        {id: "sm-6", type: "practice"},
        {id: "sm-7", type: "quiz"},
        {id: "sm-8", type: "test"},
      ],
    },
    {
      id: "limiting-reactants",
      title: "Identifying limiting reactants & theoretical yield",
      subLessons: [
        {id: "lr-1", type: "practice"},
        {id: "lr-2", type: "practice"},
        {id: "lr-3", type: "practice"},
        {id: "lr-4", type: "practice"},
        {id: "lr-5", type: "quiz"},
        {id: "lr-6", type: "practice"},
        {id: "lr-7", type: "practice"},
        {id: "lr-8", type: "test"},
      ],
    },
    {
      id: "solutions-molarity",
      title: "Molarity concentration & solution dilutions",
      subLessons: [
        {id: "so-1", type: "practice"},
        {id: "so-2", type: "practice"},
        {id: "so-3", type: "practice"},
        {id: "so-4", type: "quiz"},
        {id: "so-5", type: "practice"},
        {id: "so-6", type: "test"},
      ],
    },
    {
      id: "gas-laws",
      title: "Ideal gas laws & gas stoichiometry",
      subLessons: [
        {id: "gl-1", type: "practice"},
        {id: "gl-2", type: "practice"},
        {id: "gl-3", type: "practice"},
        {id: "gl-4", type: "practice"},
        {id: "gl-5", type: "practice"},
        {id: "gl-6", type: "quiz"},
        {id: "gl-7", type: "practice"},
        {id: "gl-8", type: "quiz"},
        {id: "gl-9", type: "test"},
      ],
    },
  ],
};

function SubLessonNode({
  subLesson,
  isUpNext,
}: {
  subLesson: {type: "practice" | "quiz" | "test"};
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
                    .filter((s) => s.type === "practice")
                    .map((sub) => (
                      <p key={sub.id} className="text-[13.5px] text-slate-600">
                        {sub.title}
                      </p>
                    ))}
                </div>

                <button
                  type="button"
                  className="mt-5 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-[13.5px] font-medium hover:bg-blue-700 transition-colors"
                >
                  Get started
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
