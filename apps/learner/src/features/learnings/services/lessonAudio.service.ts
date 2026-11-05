import {apiClient} from "@mcc/api";
import {audioPath, type AudioManifest, type ListenKind} from "../helper/lessonAudio";

/** Endpoint: GET /courses/<id>/lectures/<id>/audio or /exams/<id>/lectures/<id>/audio -- what can be played. */
export const getAudioManifest = async (kind: ListenKind, parentId: string, lectureId: string): Promise<AudioManifest> =>
  (await apiClient.get<{data: AudioManifest}>(audioPath(kind, parentId, lectureId))).data.data;

/** The server's own words for why audio could not be made (429, 503), read out of the error body. */
async function messageFrom(error: unknown): Promise<string> {
  const data = (error as {response?: {data?: unknown}})?.response?.data;
  try {
    const text = data instanceof Blob ? await data.text() : null;
    const message = text ? (JSON.parse(text) as {message?: string}).message : (data as {message?: string} | undefined)?.message;
    if (message) return message;
  } catch {
    /* fall through to the generic line */
  }
  return "Couldn't load the audio. Please try again.";
}

/** Endpoint: GET .../audio/<section>/<part> -- one part, spoken, as an MP3. The first request for a part can take a few seconds. */
export const getAudioPart = async (kind: ListenKind, parentId: string, lectureId: string, section: number, part: number): Promise<Blob> => {
  try {
    return (await apiClient.get<Blob>(audioPath(kind, parentId, lectureId, section, part), {responseType: "blob"})).data;
  } catch (error) {
    throw new Error(await messageFrom(error));
  }
};
