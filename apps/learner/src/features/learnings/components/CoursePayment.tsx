"use client";
import React, {useState} from "react";
import CourseHero from "./CourseHero";
import CourseInfo from "./CourseInfo";
import Link from "next/link";
import {useParams} from "next/navigation";
import {courseDetails} from "@/src/features/constants/demoCourses";

export default function CoursePayment() {
  const [isOnPayment, setPayment] = useState(false);
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

        {isOnPayment ? (
          <Link
            href={`/learnings/course/${id}`}
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

        <div></div>
      </div>
    </section>
  );
}
