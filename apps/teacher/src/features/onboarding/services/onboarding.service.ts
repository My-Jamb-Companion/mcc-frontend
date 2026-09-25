import { apiClient } from "@mcc/api";

// Real endpoints behind onboarding wizard steps 2-5 and 7 (backend/docs/
// teacher-onboarding-backend-todo.md). Step 6 (bio/teaching_style) and the
// profile_photo field reuse the existing @/src/features/account service
// (PATCH /user/profile, POST /user/profile/photo) instead of living here.
// Availability (step) is real via @/src/features/availability already.

export interface VerificationSubmitInput {
  id_type: string;
  id_number: string;
  id_document: File;
  selfie_verification: File;
  teaching_certificate?: File | null;
}

export interface VerificationSubmitResult {
  verification_id: string;
  status: string;
}

/** Endpoint: POST /teacher/verification (multipart) */
export const submitVerification = async (
  input: VerificationSubmitInput,
): Promise<VerificationSubmitResult> => {
  const formData = new FormData();
  formData.append("id_type", input.id_type);
  formData.append("id_number", input.id_number);
  formData.append("id_document", input.id_document);
  formData.append("selfie_verification", input.selfie_verification);
  if (input.teaching_certificate) {
    formData.append("teaching_certificate", input.teaching_certificate);
  }
  const res = await apiClient.post<{ success: boolean; data: VerificationSubmitResult }>(
    "/teacher/verification",
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return res.data.data;
};

/** Endpoint: PUT /teacher/subjects */
export const updateSubjects = async (subjects: string[]): Promise<void> => {
  await apiClient.put("/teacher/subjects", { subjects });
};

export interface QualificationsInput {
  highest_qualification: string;
  institution: string;
  graduation_year: number;
  years_of_teaching_experience: string;
  teaching_experience_summary?: string;
}

/** Endpoint: PUT /teacher/qualifications */
export const updateQualifications = async (input: QualificationsInput): Promise<void> => {
  await apiClient.put("/teacher/qualifications", input);
};

/** Endpoint: PUT /teacher/curriculum */
export const updateCurriculum = async (curricula: string[], gradeLevels: string[]): Promise<void> => {
  await apiClient.put("/teacher/curriculum", { curricula, grade_levels: gradeLevels });
};

export interface PayoutDetailsInput {
  bank_name: string;
  account_number: string;
  account_name: string;
}

/** Endpoint: PUT /teacher/payout-details */
export const updatePayoutDetails = async (input: PayoutDetailsInput): Promise<void> => {
  await apiClient.put("/teacher/payout-details", input);
};
