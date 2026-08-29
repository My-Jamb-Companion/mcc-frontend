import { apiClient, externalClient } from "@mcc/api";

export interface MediaUploadResponse {
  public_url: string;
}

export interface SignedUploadUrlPayload {
  filename: string;
  content_type: string;
  folder?: string;
}

export interface SignedUploadUrlResponse {
  signed_url: string;
  public_url: string;
  blob_name: string;
}

/**
 * Requests a presigned PUT URL from the backend.
 * Endpoint: POST /admin/media/upload-url
 *
 * `signed_url` is short-lived (~15 min) and is bound to `content_type` — the
 * PUT that follows must send the exact same Content-Type header or the
 * upload will be rejected.
 */
export const getUploadUrl = async (
  payload: SignedUploadUrlPayload,
  signal?: AbortSignal,
): Promise<SignedUploadUrlResponse> => {
  const res = await apiClient.post<{
    success: boolean;
    data: SignedUploadUrlResponse;
    message: string;
  }>("/admin/media/upload-url", payload, {signal});

  return res.data.data;
};

/**
 * PUTs the raw file straight to object storage using a presigned URL.
 * Deliberately uses `externalClient`, not `apiClient` — see its definition
 * in @mcc/api for why the app's auth/credentials must not travel here.
 */
const uploadToSignedUrl = async (
  file: File,
  signedUrl: string,
  contentType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<void> => {
  await externalClient.put(signedUrl, file, {
    headers: { "Content-Type": contentType },
    signal,
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        onProgress(percent);
      }
    },
  });
};

/**
 * Uploads a file to object storage via the presigned-URL flow.
 *
 * This is the production upload path for all course media (cover image,
 * promo video, lecture video, thumbnails) — the backend documents
 * `/admin/media/upload` (see `uploadMediaFile` below) as a local-dev-only
 * fallback, not something production traffic should use.
 */
export const uploadMedia = async (
  file: File,
  folder = "courses",
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<string> => {
  const contentType = file.type || "application/octet-stream";

  const { signed_url, public_url } = await getUploadUrl(
    { filename: file.name, content_type: contentType, folder },
    signal,
  );

  await uploadToSignedUrl(file, signed_url, contentType, onProgress, signal);

  return public_url;
};

/**
 * Uploads a media file (image, video) via the backend's direct-multipart
 * endpoint (/media/upload). Per the backend's own docs this is a local-dev
 * debugging fallback (it proxies the whole file through the app server) —
 * prefer `uploadMedia()` for anything user-facing.
 */
export const uploadMediaFile = async (
  file: File,
  folder = "courses",
  onProgress?: (percent: number) => void,
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  try {
    const res = await apiClient.post<{
      success: boolean;
      data: MediaUploadResponse;
    }>("/admin/media/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          onProgress(percent);
        }
      },
    });

    return res.data?.data?.public_url || "";
  } catch (error) {
    console.error("Failed to upload media file:", error);
    throw error;
  }
};
