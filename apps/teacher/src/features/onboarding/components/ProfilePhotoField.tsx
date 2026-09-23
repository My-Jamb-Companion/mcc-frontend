"use client";

import { Icon, LoadingCircle } from "@mcc/ui";
import { extractApiError } from "@mcc/api";
import { useUploadProfilePhoto } from "@/src/features/account/useAccount";
import { PhotoUploadField as PhotoUploadFieldType } from "../types/formTypes";

// The one REAL field in the wizard outside preview mode: POST
// /user/profile/photo is a real, working endpoint. The value stored is the
// real https URL it returns, safe to persist to the localStorage draft (see
// constants/storage.ts). In preview mode there's no real session to upload
// against, so this falls back to the same local-object-URL mock every other
// file field in the wizard uses -- never calls the real endpoint.
export function ProfilePhotoField({
  field,
  value,
  onChange,
  preview,
}: {
  field: PhotoUploadFieldType;
  value: string;
  onChange: (url: string) => void;
  preview: boolean;
}) {
  const uploadMutation = useUploadProfilePhoto();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (preview) {
      onChange(URL.createObjectURL(file));
      return;
    }

    uploadMutation.mutate(file, {
      onSuccess: (result) => onChange(result.profile_photo_url),
    });
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-start text-sm">{field.question}</label>
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full border border-muted/20 bg-muted/10 flex items-center justify-center overflow-hidden shrink-0">
          {!preview && uploadMutation.isPending ? (
            <LoadingCircle />
          ) : value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <Icon icon="mdi:account-outline" size={28} className="text-muted" />
          )}
        </div>
        <label className="flex items-center gap-2 rounded-full border border-muted/30 px-4 py-2 text-sm cursor-pointer hover:bg-muted/10 transition-colors">
          <Icon icon="mdi:camera-outline" size={16} />
          {value ? "Change photo" : "Upload photo"}
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="hidden"
          />
        </label>
      </div>
      {!preview && uploadMutation.isError && (
        <p className="text-xs text-danger">
          {extractApiError(uploadMutation.error, "Couldn't upload your photo")}
        </p>
      )}
    </div>
  );
}
