import {
  CourseListItemApi,
  CoursesFormValues,
  AdditionalCourseTypes,
} from "../types/types";

/**
 * Converts a backend API course item (CourseListItemApi) into the frontend
 * CourseListRowData structure expected by Courses.tsx and CoursesRow.tsx.
 */
export function toCourseListRowData(
  item: CourseListItemApi,
): CoursesFormValues & Partial<AdditionalCourseTypes> {
  const status: "draft" | "published" =
    item.status === "published" ? "published" : "draft";

  return {
    id: item.course_id,
    courseName: item.title,
    category: item.category || "General",
    instructorName: item.teacher?.full_name || "Instructor",
    price: item.price !== undefined && item.price !== null ? String(item.price) : "0",
    level: (item.level as any) || "all",
    description: "",
    learnItems: [],
    tags: item.tags || [],
    status,
    content: {
      topics: [],
    },
    upload: {
      coverImage: item.cover_image_url
        ? {
            file: null as any,
            previewUrl: item.cover_image_url,
            remoteUrl: item.cover_image_url,
          }
        : null,
      promoVideo: null,
      coverImageUrl: item.cover_image_url || undefined,
    },
    stats: {
      rating: Number(item.rating || 0),
      reviewCount: 0,
      enrolledStudents: 0,
      totalHours: "0",
      practiceTests: 0,
      additionalResources: 0,
      downloadableResources: 0,
    },
    features: {
      assignments: false,
      mobileAndTVAccess: false,
      fullLifetimeAccess: false,
      certificateOnCompletion: false,
    },
    currency: "₦",
    modulePrice: 0,
    lastUpdated: item.created_at || new Date().toISOString(),
    availableLanguage: ["English"],
    certificate: "Certificate of Completion",
  };
}
