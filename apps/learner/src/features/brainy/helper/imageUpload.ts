export const MAX_UPLOAD_EDGE = 1600;
export const MAX_UPLOAD_BYTES = 6 * 1024 * 1024;

/** What the Upload picker accepts: documents the backend parses, and photos it can read. */
export const UPLOAD_ACCEPT =
  ".pdf,.txt,.md,.docx,.pptx,.png,.jpg,.jpeg,.webp,.gif,image/*";

export const isImageFile = (file: {name: string; type?: string}): boolean =>
  (file.type ?? "").startsWith("image/") || /\.(png|jpe?g|webp|gif|heic|heif)$/i.test(file.name);

/** The size a photo should be sent at: longest edge capped, aspect ratio kept, never enlarged. */
export function scaleToFit(
  size: {width: number; height: number},
  maxEdge: number = MAX_UPLOAD_EDGE,
): {width: number; height: number} {
  const longest = Math.max(size.width, size.height);
  if (longest <= maxEdge) return {width: size.width, height: size.height};
  const ratio = maxEdge / longest;
  return {width: Math.round(size.width * ratio), height: Math.round(size.height * ratio)};
}

/**
 * Shrinks a phone photo before upload (a 12 MB shot becomes a few hundred KB)
 * and, on Safari, converts HEIC to JPEG on the way. If the browser can't
 * decode the image, the original is returned and the server's own validation
 * gives the student a clear message.
 */
export async function downscaleImage(file: File): Promise<File> {
  if (!isImageFile(file) || /\.gif$/i.test(file.name)) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const {width, height} = scaleToFit(bitmap);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return file;
    // White first: a transparent PNG would otherwise turn black as a JPEG.
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".jpg", {type: "image/jpeg"});
  } catch {
    return file;
  }
}
