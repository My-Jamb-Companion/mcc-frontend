import { apiClient } from "@mcc/api";

export interface MediaUploadResponse {
  public_url: string;
}

/**
 * Uploads a media file (image, video) to the backend storage endpoint (/media/upload).
 * Passes onUploadProgress to update UI progress indicators during direct file transfer.
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
    }>("/media/upload", formData, {
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
