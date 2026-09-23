import {CourseCardProps} from "@/src/features/components/CourseCard";
import {ApiCourse, ApiEnrolledCourse} from "../services/course.service";

const FALLBACK_IMAGE = "/assets/images/tower.jpg";

export function fromApiCourse(api: ApiCourse): CourseCardProps {
  return {
    image: api.cover_image_url || FALLBACK_IMAGE,
    title: api.title,
    price: Number(api.price),
    href: api.course_id,
  };
}

export function fromApiEnrolledCourse(api: ApiEnrolledCourse): CourseCardProps {
  return {
    image: api.cover_image_url || FALLBACK_IMAGE,
    title: api.title,
    completePercent: api.progress_percent,
    href: api.course_id,
  };
}
