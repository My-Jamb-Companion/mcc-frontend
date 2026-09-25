import { useMutation } from "@tanstack/react-query";
import { FormValues } from "../types/formTypes";
import { updateProfile } from "@/src/features/account/account.service";
import {
  submitVerification,
  updateSubjects,
  updateQualifications,
  updateCurriculum,
  updatePayoutDetails,
} from "../services/onboarding.service";

export interface OnboardingSubmitPayload {
  data: FormValues;
  files: Record<string, File | null>;
}

const asString = (v: string | string[] | undefined): string => (typeof v === "string" ? v : "");
const asStringArray = (v: string | string[] | undefined): string[] => (Array.isArray(v) ? v : []);

/**
 * Each domain's write (verification, subjects, qualifications, curriculum,
 * profile, payout) is its own independently idempotent PUT/POST, so firing
 * them together is safe -- a partial failure can be retried by resubmitting
 * the wizard without double-writing the domains that already succeeded.
 */
export const useOnboardingComplete = () => {
  const completeMutation = useMutation({
    mutationFn: async ({ data, files }: OnboardingSubmitPayload) => {
      const idDocument = files.id_document;
      const selfie = files.selfie_verification;
      if (!idDocument || !selfie) {
        throw new Error("ID document and verification selfie are required");
      }

      await Promise.all([
        submitVerification({
          id_type: asString(data.id_type),
          id_number: asString(data.id_number),
          id_document: idDocument,
          selfie_verification: selfie,
          teaching_certificate: files.teaching_certificate ?? null,
        }),
        updateSubjects(asStringArray(data.subjects)),
        updateQualifications({
          highest_qualification: asString(data.highest_qualification),
          institution: asString(data.institution),
          graduation_year: Number(data.graduation_year),
          years_of_teaching_experience: asString(data.years_of_teaching_experience),
          teaching_experience_summary: asString(data.teaching_experience_summary),
        }),
        updateCurriculum(asStringArray(data.curricula), asStringArray(data.grade_levels)),
        updateProfile({
          self_description: asString(data.bio),
          teaching_style: asStringArray(data.teaching_style),
        }),
        updatePayoutDetails({
          bank_name: asString(data.bank_name),
          account_number: asString(data.account_number),
          account_name: asString(data.account_name),
        }),
      ]);

      return { completed_at: new Date().toISOString() };
    },
  });
  return { completeMutation };
};
