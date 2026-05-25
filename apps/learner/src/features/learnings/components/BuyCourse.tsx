"use client";
import Link from "next/link";
import {useParams, usePathname, useRouter} from "next/navigation";
import {useState} from "react";
import CourseHero from "./CourseHero";
import CourseDetailsSidebar from "./CourseDetailsSideBar";
import CourseInfo from "./CourseInfo";
import {courseDetails} from "@/src/features/constants/demoCourses";

export default function BuyCourse() {
  const {id} = useParams();
  //   const pathname = usePathname();
  //   const isOnPayment = pathname.includes("/payment");
  const router = useRouter();
  const [isOnPayment, setPayment] = useState(false);

  if (!id) return null;

  const course = courseDetails.find((c) => c.slug === id);
  if (!course) return null;

  return (
    <section>
      <nav className="flex items-center gap-1 text-sm py-8">
        <Link href="/learnings" className="text-subtle hover:underline">
          Course
        </Link>

        <span className="text-subtle">/</span>

        {isOnPayment ? (
          <Link
            href={`/learnings/${id}`}
            className="text-subtle hover:underline"
          >
            Pilates Teacher Training Certification 20 CPD Points
          </Link>
        ) : (
          <span className="text-muted/50 cursor-default">
            Pilates Teacher Training Certification 20 CPD Points
          </span>
        )}

        {isOnPayment && (
          <>
            <span className="text-subtle">/</span>
            <span className="text-muted/50 cursor-default">
              Payment Details
            </span>
          </>
        )}
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
