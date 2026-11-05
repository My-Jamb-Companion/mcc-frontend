import {useQuery} from "@tanstack/react-query";
import {getAudioManifest} from "../services/lessonAudio.service";
import type {ListenKind} from "../helper/lessonAudio";

/** What can be heard for a lesson. No retries: a failure just means no Listen button. */
export const useLessonAudioManifest = (kind: ListenKind, parentId: string, lectureId: string) =>
  useQuery({
    queryKey: ["lesson-audio", kind, parentId, lectureId],
    queryFn: () => getAudioManifest(kind, parentId, lectureId),
    staleTime: 10 * 60_000,
    retry: false,
  });
