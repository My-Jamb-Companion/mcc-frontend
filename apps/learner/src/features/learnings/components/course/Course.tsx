"use client";
import {courseDetails} from "@/src/features/constants/demoCourses";
import {useParams} from "next/navigation";
import BuyCourse from "./BuyCourse";
import CourseContent from "./CourseContent";

export default function Course() {
  const {id} = useParams();

  if (!id) return null;

  const course = courseDetails.find((c) => c.slug === id);
  if (!course) return null;

  return course.isEnrolled ? (
    <CourseContent course={course} />
  ) : (
    <BuyCourse course={course} />
  );
}
