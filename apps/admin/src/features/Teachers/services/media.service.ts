import {apiClient, externalClient} from "@mcc/api";

interface SignedUploadUrlResponse {
  signed_url: string;
  public_url: string;
  blob_name: string;
}

/**
 * Uploads a teacher's avatar via the generic presigned-URL flow (the same
 * one apps/admin/src/features/courses/services/media.service.ts uses for
 * course media) — requests a signed PUT URL scoped to the "teachers" folder,
 * then PUTs the file straight to object storage.
 * Endpoint: POST /admin/media/upload-url
 */
export const uploadTeacherAvatar = async (file: File): Promise<string> => {
  const contentType = file.type || "application/octet-stream";

  const res = await apiClient.post<{success: boolean; data: SignedUploadUrlResponse}>(
    "/admin/media/upload-url",
    {filename: file.name, content_type: contentType, folder: "teachers"},
  );
  const {signed_url, public_url} = res.data.data;

  // Deliberately uses externalClient, not apiClient — the app's auth
  // headers must not travel to the object-storage host.
  await externalClient.put(signed_url, file, {headers: {"Content-Type": contentType}});

  return public_url;
};
