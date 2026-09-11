import { apiClient } from "@mcc/api";

export interface CatalogueCourse {
  course_id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  price: string;
}

export interface CatalogueProgram {
  program_id: string;
  exam_name: string | null;
  subject_name: string | null;
  description: string | null;
  price: string;
  level: string;
  cover_image_url: string | null;
}

export interface ChildPaymentResult {
  enrollment_id?: string;
  enrollment_status?: string;
  access_id?: string;
  status?: string;
  is_paid: boolean;
  redirect_url?: string | null;
  checkout_url?: string | null;
  amount?: string | null;
  course_title?: string | null;
  billing_email?: string | null;
}

export const getCourseCatalogue = async (): Promise<CatalogueCourse[]> => {
  const res = await apiClient.get<{ success: boolean; data: { courses: CatalogueCourse[] } }>(
    "/courses/",
  );
  return res.data.data.courses;
};

export const getProgramCatalogue = async (): Promise<CatalogueProgram[]> => {
  const res = await apiClient.get<{ success: boolean; data: { programs: CatalogueProgram[] } }>(
    "/exams/programs",
  );
  return res.data.data.programs;
};

export const enrollChildInCourse = async (
  childId: string,
  courseId: string,
  price: string,
): Promise<ChildPaymentResult> => {
  const res = await apiClient.post<{ success: boolean; data: ChildPaymentResult }>(
    `/parent/children/${childId}/courses/enroll`,
    { course_id: courseId, course_type: Number(price) > 0 ? "paid" : "free" },
  );
  return res.data.data;
};

export const registerChildForExam = async (
  childId: string,
  programId: string,
): Promise<ChildPaymentResult> => {
  const res = await apiClient.post<{ success: boolean; data: ChildPaymentResult }>(
    `/parent/children/${childId}/exams/register`,
    { program_id: programId },
  );
  return res.data.data;
};
