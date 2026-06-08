"use client";

import CourseHero from "./CourseHero";
import CourseInfo from "./CourseInfo";
import Link from "next/link";
import {useParams} from "next/navigation";
import {courseDetails} from "@/src/features/constants/demoCourses";
import CourseDetailsSidebar from "./CourseDetailsSideBar";
import PaymentDetails from "./PaymentDetails";

export default function CoursePayment() {
  const {id} = useParams();
  const course = courseDetails.find((c) => c.slug === id);
  if (!course) return null;

  return (
    <section>
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        <Link
          href={`/learnings/course/${id}`}
          className="text-subtle hover:underline"
        >
          {course.title}
        </Link>

        <>
          <span className="text-subtle">/</span>
          <span className="text-muted/50 cursor-default">Payment Details</span>
        </>
      </nav>

      <div className="grid grid-cols-2 gap-6 max-sm:grid-cols-1">
        <div className="flex flex-col gap-5 pb-8 max-sm:hidden">
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
            isPaying
          />

          <CourseDetailsSidebar
            price={course.price}
            lessons={course.meta.lessons}
            difficulty={course.meta.difficulty}
            tags={course.tags}
            extraTagsCount={course.extraTagsCount}
            stats={course.stats}
            features={course.features}
            isPaying
          />
        </div>

        <div className="w-full sm:w-fit mx-auto ">
          <PaymentDetails price={course.price} />
        </div>
      </div>
    </section>
  );
}
