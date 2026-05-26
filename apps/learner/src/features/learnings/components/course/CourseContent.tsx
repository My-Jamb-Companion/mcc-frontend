import {courseDetails} from "@/src/features/constants/demoCourses";
import CoursePlayModules, {CourseModuleLevel, Lesson} from "./CourseModules";
import Link from "next/link";
import CoursePlayer from "./CoursePlayer";
import {useState} from "react";

export default function CourseContent({
  course,
}: {
  course: (typeof courseDetails)[0];
}) {
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  console.log(activeLesson);
  return (
    <section>
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default">{course.title}</span>
      </nav>
      <div className="flex gap-6">
        <div className="pb-8">
          <div className="pb-14 w-full min-w-full">
            <CoursePlayer
              src={activeLesson?.src || ""}
              poster={"/assets/images/courses/photography-big.jpg"}
            />
          </div>
        </div>
        <CoursePlayModules
          levels={courseData}
          // activeLesson={activeLesson}
          setActiveLessonSrc={setActiveLesson}
        />
      </div>
    </section>
  );
}

const videoSources = [
  "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-10s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-15s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-20s.mp4",
  "https://samplelib.com/lib/preview/mp4/sample-30s.mp4",
  "https://www.w3schools.com/html/mov_bbb.mp4",
  "https://www.w3schools.com/html/movie.mp4",
  "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
];

const docSources = [
  "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
  "https://www.africau.edu/images/default/sample.pdf",
  "https://file-examples.com/storage/fe1b0f3f7f978f0f/sample.pdf",
];

const getRandomSrc = (type: "video" | "doc") => {
  const sources = type === "video" ? videoSources : docSources;

  return sources[Math.floor(Math.random() * sources.length)];
};

const courseData: CourseModuleLevel[] = [
  {
    title: "Beginner level",
    progress: 12,
    modules: [
      {
        title: "Introduction to Pilates",
        lessons: [
          {
            title: "Welcome to the Course",
            duration: "2:02",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Course Aims & Objectives",
            src: getRandomSrc("video"),
            duration: "3:02",
            type: "video",
          },
          {
            title: "History of Pilates",
            src: getRandomSrc("video"),
            duration: "12:14",
            type: "video",
          },
          {
            title: "Understanding Core Principles",
            src: getRandomSrc("video"),
            duration: "18:45",
            type: "video",
          },
          {
            title: "Teaching Rules & Regulations",
            src: getRandomSrc("video"),
            duration: "32:25",
            type: "video",
          },
          {
            title: "Certification Information",
            src: getRandomSrc("video"),
            duration: "2:56",
            type: "doc",
          },
          {
            title: "Student Guide to MCC",
            src: getRandomSrc("video"),
            duration: "0:49",
            type: "doc",
          },
        ],
      },

      {
        title: "Body Awareness & Posture",
        lessons: [
          {
            title: "Introduction to Alignment",
            duration: "10:45",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Neutral Spine Explained",
            src: getRandomSrc("video"),
            duration: "14:22",
            type: "video",
          },
          {
            title: "Understanding Pelvic Position",
            src: getRandomSrc("video"),
            duration: "9:54",
            type: "video",
          },
          {
            title: "Breathing Fundamentals",
            src: getRandomSrc("video"),
            duration: "11:30",
            type: "video",
          },
          {
            title: "Improving Posture Daily",
            src: getRandomSrc("video"),
            duration: "16:08",
            type: "video",
          },
          {
            title: "Common Beginner Mistakes",
            src: getRandomSrc("video"),
            duration: "8:42",
            type: "video",
          },
          {
            title: "Posture Assessment Worksheet",
            src: getRandomSrc("video"),
            duration: "4:15",
            type: "doc",
          },
        ],
      },

      {
        title: "Beginner Movement Training",
        lessons: [
          {
            title: "Warm-Up Techniques",
            duration: "7:35",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Basic Mat Exercises",
            src: getRandomSrc("video"),
            duration: "21:18",
            type: "video",
          },
          {
            title: "Controlled Leg Movements",
            src: getRandomSrc("video"),
            duration: "15:02",
            type: "video",
          },
          {
            title: "Core Stability Drills",
            src: getRandomSrc("video"),
            duration: "17:40",
            type: "video",
          },
          {
            title: "Flexibility & Stretching",
            src: getRandomSrc("video"),
            duration: "13:16",
            type: "video",
          },
          {
            title: "Cooldown & Recovery",
            src: getRandomSrc("video"),
            duration: "8:11",
            type: "video",
          },
          {
            title: "Beginner Practice Checklist",
            src: getRandomSrc("video"),
            duration: "3:50",
            type: "doc",
          },
        ],
      },
    ],
  },

  {
    title: "Amateur level",
    status: "not started",
    modules: [
      {
        title: "Intermediate Core Strength",
        lessons: [
          {
            title: "Advanced Breathing Control",
            duration: "14:44",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Dynamic Core Exercises",
            src: getRandomSrc("video"),
            duration: "22:35",
            type: "video",
          },
          {
            title: "Building Endurance",
            src: getRandomSrc("video"),
            duration: "17:28",
            type: "video",
          },
          {
            title: "Balance & Coordination",
            src: getRandomSrc("video"),
            duration: "19:13",
            type: "video",
          },
          {
            title: "Resistance Band Training",
            src: getRandomSrc("video"),
            duration: "16:55",
            type: "video",
          },
          {
            title: "Muscle Activation Techniques",
            src: getRandomSrc("video"),
            duration: "13:48",
            type: "video",
          },
          {
            title: "Strength Progress Tracker",
            src: getRandomSrc("video"),
            duration: "5:02",
            type: "doc",
          },
        ],
      },

      {
        title: "Flexibility & Mobility",
        lessons: [
          {
            title: "Joint Mobility Basics",
            duration: "12:31",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Hip Flexibility Work",
            src: getRandomSrc("video"),
            duration: "18:25",
            type: "video",
          },
          {
            title: "Shoulder Mobility Training",
            src: getRandomSrc("video"),
            duration: "14:19",
            type: "video",
          },
          {
            title: "Hamstring Flexibility",
            src: getRandomSrc("video"),
            duration: "15:48",
            type: "video",
          },
          {
            title: "Foam Rolling Techniques",
            src: getRandomSrc("video"),
            duration: "11:53",
            type: "video",
          },
          {
            title: "Recovery & Relaxation",
            src: getRandomSrc("video"),
            duration: "10:07",
            type: "video",
          },
          {
            title: "Mobility Routine Guide",
            src: getRandomSrc("video"),
            duration: "4:44",
            type: "doc",
          },
        ],
      },

      {
        title: "Intermediate Pilates Flow",
        lessons: [
          {
            title: "Flow Sequence Basics",
            duration: "16:21",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Transitioning Between Exercises",
            src: getRandomSrc("video"),
            duration: "12:42",
            type: "video",
          },
          {
            title: "Advanced Leg Work",
            src: getRandomSrc("video"),
            duration: "18:16",
            type: "video",
          },
          {
            title: "Upper Body Integration",
            src: getRandomSrc("video"),
            duration: "20:14",
            type: "video",
          },
          {
            title: "Maintaining Rhythm & Tempo",
            src: getRandomSrc("video"),
            duration: "11:50",
            type: "video",
          },
          {
            title: "Building Full-Body Coordination",
            src: getRandomSrc("video"),
            duration: "17:09",
            type: "video",
          },
          {
            title: "Intermediate Flow Notes",
            src: getRandomSrc("video"),
            duration: "5:16",
            type: "doc",
          },
        ],
      },
    ],
  },

  {
    title: "Professional level",
    status: "not started",
    modules: [
      {
        title: "Advanced Pilates Techniques",
        lessons: [
          {
            title: "Professional Warm-Up Systems",
            duration: "18:42",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Advanced Core Sequences",
            src: getRandomSrc("video"),
            duration: "27:14",
            type: "video",
          },
          {
            title: "High-Level Flexibility Training",
            src: getRandomSrc("video"),
            duration: "22:51",
            type: "video",
          },
          {
            title: "Precision Movement Training",
            src: getRandomSrc("video"),
            duration: "19:18",
            type: "video",
          },
          {
            title: "Injury Prevention Methods",
            src: getRandomSrc("video"),
            duration: "16:07",
            type: "video",
          },
          {
            title: "Professional Class Demonstration",
            src: getRandomSrc("video"),
            duration: "31:26",
            type: "video",
          },
          {
            title: "Advanced Practice Workbook",
            src: getRandomSrc("video"),
            duration: "7:30",
            type: "doc",
          },
        ],
      },

      {
        title: "Client Coaching & Instruction",
        lessons: [
          {
            title: "Understanding Client Needs",
            duration: "15:44",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Building Training Programs",
            src: getRandomSrc("video"),
            duration: "21:38",
            type: "video",
          },
          {
            title: "Correcting Student Form",
            src: getRandomSrc("video"),
            duration: "17:20",
            type: "video",
          },
          {
            title: "Motivational Coaching",
            src: getRandomSrc("video"),
            duration: "13:14",
            type: "video",
          },
          {
            title: "Teaching Group Classes",
            src: getRandomSrc("video"),
            duration: "24:11",
            type: "video",
          },
          {
            title: "Handling Injured Clients",
            src: getRandomSrc("video"),
            duration: "19:32",
            type: "video",
          },
          {
            title: "Instructor Evaluation Sheet",
            src: getRandomSrc("video"),
            duration: "5:08",
            type: "doc",
          },
        ],
      },

      {
        title: "Business & Career Development",
        lessons: [
          {
            title: "Starting Your Pilates Career",
            duration: "12:35",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Building a Personal Brand",
            src: getRandomSrc("video"),
            duration: "14:56",
            type: "video",
          },
          {
            title: "Marketing Your Classes",
            src: getRandomSrc("video"),
            duration: "18:47",
            type: "video",
          },
          {
            title: "Social Media for Trainers",
            src: getRandomSrc("video"),
            duration: "11:40",
            type: "video",
          },
          {
            title: "Managing Clients Professionally",
            src: getRandomSrc("video"),
            duration: "20:18",
            type: "video",
          },
          {
            title: "Creating Long-Term Success",
            src: getRandomSrc("video"),
            duration: "16:24",
            type: "video",
          },
          {
            title: "Career Planning Workbook",
            src: getRandomSrc("video"),
            duration: "4:59",
            type: "doc",
          },
        ],
      },

      {
        title: "Mastery & Final Assessment",
        lessons: [
          {
            title: "Preparing for Certification",
            duration: "15:28",
            src: getRandomSrc("video"),
            type: "video",
          },
          {
            title: "Mock Practical Assessment",
            src: getRandomSrc("video"),
            duration: "26:42",
            type: "video",
          },
          {
            title: "Advanced Flow Demonstration",
            src: getRandomSrc("video"),
            duration: "21:17",
            type: "video",
          },
          {
            title: "Professional Teaching Evaluation",
            src: getRandomSrc("video"),
            duration: "19:36",
            type: "video",
          },
          {
            title: "Building Your Final Routine",
            src: getRandomSrc("video"),
            duration: "17:50",
            type: "video",
          },
          {
            title: "Final Course Wrap-Up",
            src: getRandomSrc("video"),
            duration: "10:15",
            type: "video",
          },
          {
            title: "Final Certification Guide",
            src: getRandomSrc("video"),
            duration: "6:11",
            type: "doc",
          },
        ],
      },
    ],
  },
];
