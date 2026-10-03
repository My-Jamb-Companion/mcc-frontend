/**
 * What a lesson upload accepts (course lessons and exam lectures alike): MP4
 * video and PDF, each up to MAX_LESSON_FILE_MB. Files go straight to object
 * storage, so this limit is enforced here, before the upload starts.
 */
export const MAX_LESSON_FILE_MB = 500;
export const MAX_LESSON_FILE_BYTES = MAX_LESSON_FILE_MB * 1024 * 1024;

/** The file picker's filter. */
export const LESSON_FILE_ACCEPT = ".mp4,video/mp4,.pdf,application/pdf";

/** The caption shown under the upload button. */
export const LESSON_FILE_CAPTION = `MP4 video or PDF files, up to ${MAX_LESSON_FILE_MB} MB each.`;

export type LessonFileKind = "mp4" | "pdf";

export function lessonFileKind(file: Pick<File, "name" | "type">): LessonFileKind | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf") || file.type === "application/pdf") return "pdf";
  if (name.endsWith(".mp4") || file.type === "video/mp4") return "mp4";
  return null;
}

const megabytes = (bytes: number) => `${Math.ceil(bytes / (1024 * 1024))} MB`;

/** Why a file can't be uploaded as a lesson (null when it can). */
export function lessonFileProblem(file: Pick<File, "name" | "type" | "size">): string | null {
  if (!lessonFileKind(file)) return `${file.name} isn't an MP4 or PDF file.`;
  if (file.size > MAX_LESSON_FILE_BYTES) {
    return `${file.name} is ${megabytes(file.size)}; the limit is ${MAX_LESSON_FILE_MB} MB.`;
  }
  return null;
}

/** Splits a picked list into the files to upload and a message per file that can't be. */
export function splitLessonFiles(files: File[]): {accepted: File[]; problems: string[]} {
  const accepted: File[] = [];
  const problems: string[] = [];
  for (const file of files) {
    const problem = lessonFileProblem(file);
    if (problem) problems.push(problem);
    else accepted.push(file);
  }
  return {accepted, problems};
}
