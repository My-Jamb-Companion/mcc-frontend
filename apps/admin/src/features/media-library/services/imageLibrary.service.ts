import {apiClient} from "@mcc/api";

export interface LibraryImage {
  url: string;
  /** The original file name. */
  name: string;
  size_bytes: number;
  uploaded_at: string;
}

export interface ImageLibraryPage {
  items: LibraryImage[];
  total: number;
  limit: number;
  offset: number;
}

export const IMAGE_PAGE_SIZE = 48;

/** Endpoint: GET /admin/media/library -- images uploaded earlier, newest first. */
export const listLibraryImages = async (params: {search?: string; offset?: number; limit?: number; folder?: string} = {}): Promise<ImageLibraryPage> => {
  const res = await apiClient.get<{data: ImageLibraryPage}>("/admin/media/library", {
    params: {folder: params.folder ?? "lessons", search: params.search || undefined, offset: params.offset ?? 0, limit: params.limit ?? IMAGE_PAGE_SIZE},
  });
  return res.data.data;
};
