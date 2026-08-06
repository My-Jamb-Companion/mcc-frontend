import {useState} from "react";
import {Icon} from "@mcc/ui";
import {usePathname, useRouter} from "next/navigation";
import {ExamDetail} from "@/src/features/constants/demoExams";
import {useExam} from "./context/ExamContext";

interface Lesson {
  id: string;
  title: string;
  icon: string;
}

interface Unit {
  id: string;
  title: string;
  totalLessons: number;
  status: "resume" | "start";
  lessons: Lesson[];
}

interface Subject {
  id: string;
  name: string;
  units: Unit[];
}

function UnitCard({unit, subject}: {unit: Unit; subject: string}) {
  const router = useRouter();
  const pathname = usePathname();
  const {
    setActiveClassroomExam,
    setActiveClassroomSubject,
    setActiveClassroomUnit,
  } = useExam();

  const [showAll, setShowAll] = useState(false);
  const visibleLessons = showAll ? unit.lessons : unit.lessons.slice(0, 4);
  const hasMore = unit.lessons.length > 4;
  const lastUrl = pathname.split("/").at(-1) || "";

  const handleNavigation = () => {
    setActiveClassroomExam(lastUrl);
    setActiveClassroomSubject(subject);
    setActiveClassroomUnit(unit);

    router.push(`${pathname}/classroom`);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-muted/20">
        <p className="text-sm font-semibold text-foreground">{unit.title}</p>
        <button
          onClick={() => setShowAll((prev) => !prev)}
          className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap"
        >
          See all ({unit.totalLessons})
        </button>
      </div>

      <div className="flex flex-col items-start pt-4">
        {unit.status === "resume" ? (
          <button
            onClick={() => {
              handleNavigation();
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg pl-4 pr-3 py-2 transition-colors"
          >
            Resume learning
            <Icon icon="solar:alt-arrow-right-linear" size={14} />
          </button>
        ) : (
          <button
            onClick={() => handleNavigation()}
            className="flex items-center gap-1.5 border border-muted/30 hover:bg-muted/5 text-foreground text-sm font-medium rounded-lg pl-4 pr-3 py-2 transition-colors"
          >
            Start learning
            <Icon icon="solar:alt-arrow-right-linear" size={14} />
          </button>
        )}

        <div className="flex flex-col pl-[15px] pt-1">
          {visibleLessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="relative flex items-center gap-3 py-2"
            >
              {index < visibleLessons.length - 1 && (
                <span className="absolute left-[15px] top-[34px] w-px h-[calc(100%-10px)] bg-muted/25" />
              )}
              <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 shrink-0">
                <Icon icon={lesson.icon} className="text-white" size={14} />
              </span>
              <span className="text-sm text-foreground">{lesson.title}</span>
            </div>
          ))}
        </div>

        {hasMore && (
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="flex items-center gap-1 pl-[15px] mt-1 text-xs font-medium text-blue-600 hover:underline"
          >
            {showAll ? "Show less" : "Show more"}
            <Icon
              icon="solar:alt-arrow-down-linear"
              size={12}
              className={`transition-transform ${showAll ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
function SubjectSection({subject}: {subject: Subject}) {
  const [isOpen, setIsOpen] = useState(subject.id === "" ? false : true);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 py-3 w-full text-left"
      >
        <Icon
          icon="solar:alt-arrow-down-linear"
          size={16}
          className={`text-foreground transition-transform ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
        <span className="text-sm font-semibold text-foreground whitespace-nowrap">
          {subject.name}
        </span>
        <span className="flex-1 h-px bg-muted/20" />
      </button>

      {isOpen && subject.units.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-10 gap-y-8 pb-8 pt-2">
          {subject.units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} subject={subject.name} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExamLessonsLibrary({exam}: {exam: ExamDetail}) {
  return (
    <div className="w-full flex flex-col gap-1 px-4 py-6">
      <div className="flex flex-col gap-1 pb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Lessons & Library
        </h1>
        <p className="text-sm text-subtle">
          Start leveling up and learning in preparation for your UTME.
        </p>
      </div>

      <div className="flex flex-col">
        {exam.subjects.map((subject) => (
          <SubjectSection key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
}
