"use client";
import {useSearchParams} from "next/navigation";
import OpenCourse from "./OpenCourse";
import Courses from "./Courses";

export default function Course() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  if (id) {
    return <OpenCourse id={id} />;
  }
  return <Courses />;
}
