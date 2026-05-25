import CoursePlayModules, {CourseModuleLevel} from "./CourseModules";

export default function CoursePlayer() {
  return <CoursePlayModules levels={courseData} />;
}
const courseData: CourseModuleLevel[] = [
  {
    title: "Beginner level",
    progress: 12,
    modules: [
      {
        title: "Introduction",
        lessons: [
          {title: "Introduction", duration: "2:02", type: "video"},
          {title: "Course Aims & Objectives", duration: "3:02", type: "doc"},
          {
            title: "Teaching Pilates: The Rules & Regulations",
            duration: "3:25",
            type: "quiz",
          },
          {title: "CPD Explained", duration: "1:31", type: "video"},
          {title: "Certification Information", duration: "2:56", type: "doc"},
          {title: "Student Guide to MCC", duration: "0:49", type: "quiz"},
        ],
      },
      {title: "Module #2"},
      {title: "Module #3"},
    ],
  },
  {
    title: "Amateur level",
    status: "not started",
    modules: [{title: "Module #4"}, {title: "Module #5"}, {title: "Module #6"}],
  },
  {
    title: "Professional level",
    status: "not started",
    modules: [
      {title: "Module #7"},
      {title: "Module #8"},
      {title: "Module #9"},
      {title: "Module #10"},
    ],
  },
];
