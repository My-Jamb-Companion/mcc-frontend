/**
 * Recognizes YouTube links (watch/short/embed/youtu.be forms) so a lesson
 * stored with file_format "YOUTUBE" can be embedded instead of played as a
 * direct video file. Mirrors apps/admin/src/features/courses/helper/video.ts
 * -- duplicated rather than shared across apps, since it's a few lines of
 * pure logic and this app has no dependency on the admin one otherwise.
 */
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function youTubeVideoId(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
}

export function youTubeEmbedUrl(url: string | undefined | null): string | null {
  const id = youTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}
