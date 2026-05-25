"use client";
import Link from "next/link";
import {useRouter} from "next/navigation";
import CourseHero from "./CourseHero";
import CourseDetailsSidebar from "./CourseDetailsSideBar";
import CourseInfo from "./CourseInfo";
import {courseDetails} from "@/src/features/constants/demoCourses";

export default function BuyCourse({
  course,
}: {
  course: (typeof courseDetails)[0];
}) {
  const router = useRouter();
  return (
    <section>
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <span className="text-muted/50 cursor-default">{course.title}</span>
      </nav>

      <div className="grid grid-cols-2 gap-6">
        <div className="pb-8">
          <div className="pb-14">
            <CourseHero
              mainImage={course.imgBig}
              instructorImage={course.imgSmall}
              rating={course.rating}
              totalRatings={course.totalRatings}
              // onPlay={() => setVideoOpen(true)}
            />
          </div>

          <CourseInfo
            instructor={course.instructor}
            title={course.title}
            description={course.description}
            curriculum={course.curriculum}
          />
        </div>

        <div>
          <CourseDetailsSidebar
            price={course.price}
            lessons={course.meta.lessons}
            difficulty={course.meta.difficulty}
            tags={course.tags}
            extraTagsCount={course.extraTagsCount}
            stats={course.stats}
            features={course.features}
            onEnroll={() =>
              router.push(`/learnings/course/${course.slug}/payment`)
            }
            onGift={() => {}}
          />
        </div>
      </div>
    </section>
  );
}
