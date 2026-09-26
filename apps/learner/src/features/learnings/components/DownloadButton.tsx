"use client";

import {Icon} from "@mcc/ui";
import {youTubeEmbedUrl} from "../helper/video";

/**
 * Links directly to the lecture's own file -- video_url is already a
 * permanent public URL (see backend app/core/storage.py::upload_file_to_gcs),
 * so this needs no new backend endpoint, just wiring, per
 * platform-completion-plan.md's own scoping note for this gap. Hidden for a
 * YouTube-embedded lecture, since there's no raw file behind that URL to
 * download -- only a page to embed.
 */
export default function DownloadButton({
  url,
  filename,
  className = "",
}: {
  url: string | null | undefined;
  filename: string;
  className?: string;
}) {
  if (!url || youTubeEmbedUrl(url)) return null;

  return (
    <a
      href={url}
      download={filename}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      aria-label={`Download ${filename}`}
      className={`shrink-0 ${className}`}
    >
      <Icon
        icon="solar:download-minimalistic-linear"
        size={16}
        className="text-subtle hover:text-primary transition-colors"
      />
    </a>
  );
}
