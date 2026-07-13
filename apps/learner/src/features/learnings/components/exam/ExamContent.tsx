import {useState} from "react";
import {Icon} from "@iconify/react";

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

const LESSON_ICON = "solar:widget-4-bold";

const buildLessons = (): Lesson[] => [
  {id: "foundations", title: "Algebra foundations", icon: LESSON_ICON},
  {
    id: "equations",
    title: "Solving equations & inequalities",
    icon: LESSON_ICON,
  },
  {id: "units", title: "Working with units", icon: LESSON_ICON},
  {id: "graphs", title: "Linear equations & graphs", icon: LESSON_ICON},
];

const SUBJECTS: Subject[] = [
  {
    id: "mathematics",
    name: "Mathematics",
    units: [
      {
        id: "algebra-1",
        title: "Algebra 1",
        totalLessons: 16,
        status: "resume",
        lessons: buildLessons(),
      },
      {
        id: "algebra-2-a",
        title: "Algebra 2",
        totalLessons: 16,
        status: "start",
        lessons: buildLessons(),
      },
      {
        id: "pre-algebra-a",
        title: "Pre-Algebra",
        totalLessons: 16,
        status: "start",
        lessons: buildLessons(),
      },
      {
        id: "algebra-2-b",
        title: "Algebra 2",
        totalLessons: 16,
        status: "start",
        lessons: buildLessons(),
      },
      {
        id: "algebra-2-c",
        title: "Algebra 2",
        totalLessons: 16,
        status: "start",
        lessons: buildLessons(),
      },
      {
        id: "pre-algebra-b",
        title: "Pre-Algebra",
        totalLessons: 16,
        status: "start",
        lessons: buildLessons(),
      },
    ],
  },
  {
    id: "biology",
    name: "Biology",
    units: [],
  },
  {
    id: "chemistry",
    name: "Chemistry",
    units: [],
  },
];

function UnitCard({unit}: {unit: Unit}) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pb-2 border-b border-muted/20">
        <p className="text-sm font-semibold text-foreground">{unit.title}</p>
        <button className="text-xs font-medium text-blue-600 hover:underline whitespace-nowrap">
          See all ({unit.totalLessons})
        </button>
      </div>

      <div className="flex flex-col items-start pt-4">
        {unit.status === "resume" ? (
          <button className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-full pl-4 pr-3 py-2 transition-colors">
            Resume learning
            <Icon icon="solar:alt-arrow-right-linear" width={14} />
          </button>
        ) : (
          <button className="flex items-center gap-1.5 border border-muted/30 hover:bg-muted/5 text-foreground text-sm font-medium rounded-full pl-4 pr-3 py-2 transition-colors">
            Start learning
            <Icon icon="solar:alt-arrow-right-linear" width={14} />
          </button>
        )}

        <div className="flex flex-col pl-[15px] pt-1">
          {unit.lessons.map((lesson, index) => (
            <div
              key={lesson.id}
              className="relative flex items-center gap-3 py-2"
            >
              {index < unit.lessons.length - 1 && (
                <span className="absolute left-[15px] top-[34px] w-px h-[calc(100%-10px)] bg-muted/25" />
              )}
              <span className="relative z-10 flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 shrink-0">
                <Icon icon={lesson.icon} className="text-white" width={14} />
              </span>
              <span className="text-sm text-foreground">{lesson.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SubjectSection({subject}: {subject: Subject}) {
  const [isOpen, setIsOpen] = useState(subject.id === "mathematics");

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-3 py-3 w-full text-left"
      >
        <Icon
          icon="solar:alt-arrow-down-linear"
          width={16}
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
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      )}
    </div>
  );
}

interface LessonsLibraryProps {
  subjects?: Subject[];
}

export default function ExamLessonsLibrary({
  subjects = SUBJECTS,
}: LessonsLibraryProps) {
  return (
    <div className="w-full flex flex-col gap-1">
      <div className="flex flex-col gap-1 pb-6">
        <h1 className="text-2xl font-bold text-foreground">
          Lessons & Library
        </h1>
        <p className="text-sm text-subtle">
          Start leveling up and learning in preparation for your UTME.
        </p>
      </div>

      <div className="flex flex-col">
        {subjects.map((subject) => (
          <SubjectSection key={subject.id} subject={subject} />
        ))}
      </div>
    </div>
  );
}
