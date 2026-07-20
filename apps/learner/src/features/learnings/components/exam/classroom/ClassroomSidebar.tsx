import {ExamUnit} from "@/src/features/constants/demoExams";
import {Icon} from "@mcc/ui";
import {useExam} from "../context/ExamContext";

export default function ClassroomSidebar({
  units,
  isHeaderActive,
  setIsHeaderActive,
  selectedLessonId,
  setSelectedLessonId,
}: {
  units: ExamUnit;
  isHeaderActive: boolean;
  setIsHeaderActive: (value: boolean) => void;
  selectedLessonId: string | null;
  setSelectedLessonId: (value: string | null) => void;
}) {
  const {title, totalLessons, lessons} = units;
  const {activeClassroomSubject} = useExam();

  return (
    <div className="w-full mx-auto">
      {/* Header */}
      <div
        onClick={() => {
          setIsHeaderActive(true);
          setSelectedLessonId(lessons[0].id);
        }}
        className={`relative p-4 pl-5 overflow-hidden cursor-pointer transition-all border-l-4 ${
          isHeaderActive
            ? "bg-violet-50 border-l-violet-600"
            : "border-l-transparent hover:bg-slate-50"
        }`}
      >
        {/* <div className="absolute left-0 top-0 bottom-0 w-1 bg-violet-600" /> */}
        <div className="flex items-center gap-3">
          <div className="shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Icon icon="basil:layout-outline" color="white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold text-slate-900 leading-snug">
              {title}
            </h2>
            <p className="text-[11px] font-medium tracking-wide text-slate-400 mt-0.5">
              {activeClassroomSubject} &nbsp;•&nbsp; {totalLessons} UNIT
              {totalLessons === 1 ? "" : "S"}
            </p>
          </div>
        </div>
      </div>

      {/* Lessons list */}
      <div className="mt-1">
        {lessons.map((unit, i) => {
          const isActive = !isHeaderActive && selectedLessonId === unit.id;

          return (
            <div
              key={unit.id}
              onClick={() => {
                setIsHeaderActive(false);
                console.log(unit.id);
                setSelectedLessonId(unit.id);
              }}
              className={`flex items-center justify-between gap-3 py-3.5 px-4 border-b border-slate-100 last:border-b-0 border-l-4 cursor-pointer transition-all duration-200 ${
                isActive
                  ? "bg-violet-50 border-l-violet-600"
                  : "border-l-transparent hover:bg-slate-50"
              }`}
            >
              <div className="min-w-0">
                <p
                  className={`text-[10px] font-semibold tracking-wide ${
                    isActive ? "text-violet-600" : "text-slate-400"
                  }`}
                >
                  UNIT {i + 1}
                </p>

                <p
                  className={`mt-0.5 text-[14px] leading-snug ${
                    isActive
                      ? "font-semibold text-slate-900"
                      : "font-medium text-slate-700"
                  }`}
                >
                  {unit.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
