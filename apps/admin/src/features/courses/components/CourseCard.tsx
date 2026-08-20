import {useState} from "react";
import {motion, AnimatePresence, Button, Icon} from "@mcc/ui";

function DiamondIcon({className = ""}: {className?: string}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 9l4-5h8l4 5-10 11L4 9z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity={0.15}
      />
      <path
        d="M4 9h16M9.5 4L8 9l4 11 4-11-1.5-5"
        stroke="currentColor"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Instructor = {
  name: string;
  initials: string;
  gradient: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  instructors: Instructor[];
  enrolledStudents: number;
  price: string;
  diamonds: number;
  monthsOpening: number;
};

const INSTRUCTOR_VUSI: Instructor = {
  name: "Vusi",
  initials: "V",
  gradient: "from-orange-300 to-rose-400",
};
const INSTRUCTOR_SELINE: Instructor = {
  name: "Seline",
  initials: "S",
  gradient: "from-violet-300 to-indigo-400",
};

const COURSES: Course[] = [
  {
    id: "use-of-english",
    title: "Use of English",
    description:
      "Program is based off the JAMB curriculum with multiple study styles",
    instructors: [INSTRUCTOR_VUSI, INSTRUCTOR_SELINE],
    enrolledStudents: 24,
    price: "₦75,000",
    diamonds: 24,
    monthsOpening: 4,
  },
  {
    id: "mathematics",
    title: "Mathematics",
    description:
      "Program is based off the JAMB curriculum with multiple study styles",
    instructors: [INSTRUCTOR_VUSI, INSTRUCTOR_SELINE],
    enrolledStudents: 24,
    price: "₦75,000",
    diamonds: 24,
    monthsOpening: 3.5,
  },
  {
    id: "biology",
    title: "Biology",
    description:
      "Program is based off the JAMB curriculum with multiple study styles",
    instructors: [INSTRUCTOR_VUSI, INSTRUCTOR_SELINE],
    enrolledStudents: 24,
    price: "₦75,000",
    diamonds: 24,
    monthsOpening: 2,
  },
  {
    id: "chemistry",
    title: "Chemistry",
    description:
      "Program is based off the JAMB curriculum with multiple study styles",
    instructors: [INSTRUCTOR_VUSI, INSTRUCTOR_SELINE],
    enrolledStudents: 24,
    price: "₦75,000",
    diamonds: 24,
    monthsOpening: 3,
  },
  {
    id: "literature",
    title: "Literature",
    description:
      "Program is based off the JAMB curriculum with multiple study styles",
    instructors: [INSTRUCTOR_VUSI, INSTRUCTOR_SELINE],
    enrolledStudents: 24,
    price: "₦75,000",
    diamonds: 24,
    monthsOpening: 3,
  },
];

function monthsLabel(months: number) {
  const value = months % 1 === 0 ? months : months.toFixed(1);
  return `${value} month${months === 1 ? "" : "s"} opening`;
}

function CourseCardRow({
  course,
  expanded,
  onToggle,
  onView,
}: {
  course: Course;
  expanded: boolean;
  onToggle: () => void;
  onView?: (id: string) => void;
}) {
  const open = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onView?.(course.id);
  };
  return (
    <div className="relative pt-3">
      <div className="w-fit ml-auto mr-6 rounded-t-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
        {monthsLabel(course.monthsOpening)}
      </div>

      <button
        type="button"
        onClick={onToggle}
        className="w-full rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition-colors hover:border-gray-200"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900">
              {course.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">{course.description}</p>
          </div>
          <div className="shrink-0 text-right">
            <span className="text-xl font-bold text-gray-900">
              {course.price}
            </span>
            <div className="mt-1 flex items-center justify-end gap-1.5 text-sm text-gray-500">
              <DiamondIcon className="h-4 w-4 text-sky-400" />
              {course.diamonds} Diamonds
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{height: 0, opacity: 0}}
              animate={{height: "auto", opacity: 1}}
              exit={{height: 0, opacity: 0}}
              transition={{duration: 0.2}}
              className="overflow-hidden"
            >
              <div className="mt-4 flex items-center gap-2">
                <div className="flex -space-x-2">
                  {course.instructors.map((inst) => (
                    <span
                      key={inst.name}
                      className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${inst.gradient} text-[10px] font-semibold text-white ring-2 ring-white`}
                      title={inst.name}
                    >
                      {inst.initials}
                    </span>
                  ))}
                </div>
                <span className="text-sm text-gray-700">
                  {course.instructors.map((i) => i.name).join(" & ")}
                  <span className="text-gray-400"> • </span>
                  <span className="italic text-gray-500">
                    {course.enrolledStudents} enrolled students
                  </span>
                </span>
              </div>

              <Button
                onClick={open}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onView?.(course.id);
                  }
                }}
                radius="sm"
                width="fit"
                className="mt-3"
                rightIcon={<Icon icon="ri:arrow-right-s-line" size={18} />}
              >
                View program
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}

export default function CourseCardAccordion() {
  const [expandedId, setExpandedId] = useState<string | null>("literature");
  const [lastViewed, setLastViewed] = useState<string | null>(null);

  return (
    <div className="w-full ">
      {lastViewed && (
        <p className="mb-4 text-sm text-gray-500">
          Last viewed:{" "}
          <span className="font-medium text-gray-700">{lastViewed}</span>
        </p>
      )}
      <div className="flex flex-col gap-6">
        {COURSES.map((course) => (
          <CourseCardRow
            key={course.id}
            course={course}
            expanded={expandedId === course.id}
            onToggle={() =>
              setExpandedId((id) => (id === course.id ? null : course.id))
            }
            onView={setLastViewed}
          />
        ))}
      </div>
    </div>
  );
}
