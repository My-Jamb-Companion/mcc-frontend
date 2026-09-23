/**
 * Recognizes YouTube links (watch/short/embed/youtu.be forms) so a
 * promotional video or lesson can point at YouTube instead of an uploaded
 * file — the stored URL is whatever the admin pasted; this only extracts the
 * video id needed to build an embeddable player URL at render time.
 */
const YOUTUBE_ID_PATTERN =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function youTubeVideoId(url: string | undefined | null): string | null {
  if (!url) return null;
  const match = url.match(YOUTUBE_ID_PATTERN);
  return match ? match[1] : null;
}

export function isYouTubeUrl(url: string | undefined | null): boolean {
  return youTubeVideoId(url) !== null;
}

export function youTubeEmbedUrl(url: string | undefined | null): string | null {
  const id = youTubeVideoId(url);
  return id ? `https://www.youtube.com/embed/${id}` : null;
}

export function youTubeThumbnailUrl(url: string | undefined | null): string | null {
  const id = youTubeVideoId(url);
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}
