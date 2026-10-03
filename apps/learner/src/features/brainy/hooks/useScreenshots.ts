import {useCallback, useEffect, useRef, useState} from "react";
import {extractApiError} from "@mcc/api";
import {describeCharge} from "../helper/charge";
import {downscaleImage, isImageFile, MAX_UPLOAD_BYTES} from "../helper/imageUpload";
import {fileKey, MAX_SCREENSHOTS} from "../helper/studyMaterial";
import {uploadStudyMaterial} from "../services/flashcards.service";

export interface Screenshot {
  id: string;
  name: string;
  /** Object URL of the (shrunk) image, for the thumbnail. */
  previewUrl: string;
  status: "reading" | "ready" | "failed";
  /** What the vision model read; editable once ready. */
  text: string;
  paid: string | null;
  error: string | null;
}

/**
 * Screenshots attached to a recording. Each is shrunk, then read into text by
 * the same endpoint Upload uses, one at a time so the allowance is checked in
 * order and a failure on one doesn't affect the rest. `shots` is kept in a ref
 * as the source of truth so two quick picks can't together exceed the limit.
 */
export function useScreenshots() {
  const [shots, setShots] = useState<Screenshot[]>([]);
  const [notice, setNotice] = useState<string | null>(null);
  const shotsRef = useRef<Screenshot[]>([]);
  const keys = useRef(new Map<string, string>()); // file key -> shot id
  const queue = useRef<Promise<void>>(Promise.resolve());
  const mounted = useRef(true);

  const commit = useCallback((next: Screenshot[]) => {
    shotsRef.current = next;
    if (mounted.current) setShots(next);
  }, []);

  const patch = useCallback(
    (id: string, changes: Partial<Screenshot>) =>
      commit(shotsRef.current.map((s) => (s.id === id ? {...s, ...changes} : s))),
    [commit],
  );

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      shotsRef.current.forEach((s) => URL.revokeObjectURL(s.previewUrl));
    };
  }, []);

  const read = useCallback(
    async (id: string, picked: File) => {
      try {
        const file = await downscaleImage(picked);
        if (file.size > MAX_UPLOAD_BYTES) {
          patch(id, {status: "failed", error: "Too large even after shrinking. Try a smaller screenshot."});
          return;
        }
        const result = await uploadStudyMaterial(file);
        patch(id, {status: "ready", text: result.text, paid: describeCharge(result.charge), error: null});
      } catch (err) {
        patch(id, {status: "failed", error: extractApiError(err, "Couldn't read that screenshot.")});
      }
    },
    [patch],
  );

  const add = useCallback(
    (picked: File[]) => {
      const notes: string[] = [];
      const images = picked.filter(isImageFile);
      if (images.length < picked.length) notes.push("Only images can be added here.");

      const fresh = images.filter((f) => !keys.current.has(fileKey(f)));
      if (fresh.length < images.length) notes.push("That screenshot is already added.");

      const room = MAX_SCREENSHOTS - shotsRef.current.length;
      const accepted = fresh.slice(0, Math.max(room, 0));
      if (accepted.length < fresh.length) notes.push(`You can add up to ${MAX_SCREENSHOTS} screenshots.`);
      setNotice(notes.length ? notes.join(" ") : null);
      if (accepted.length === 0) return;

      const added = accepted.map((file) => {
        const id = `${fileKey(file)}:${Math.random().toString(36).slice(2, 8)}`;
        keys.current.set(fileKey(file), id);
        return {
          file,
          shot: {
            id,
            name: file.name,
            previewUrl: URL.createObjectURL(file),
            status: "reading",
            text: "",
            paid: null,
            error: null,
          } satisfies Screenshot,
        };
      });
      commit([...shotsRef.current, ...added.map((a) => a.shot)]);
      added.forEach(({file, shot}) => {
        queue.current = queue.current.then(() => read(shot.id, file));
      });
    },
    [commit, read],
  );

  const remove = useCallback(
    (id: string) => {
      const gone = shotsRef.current.find((s) => s.id === id);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      for (const [key, value] of keys.current) if (value === id) keys.current.delete(key);
      setNotice(null);
      commit(shotsRef.current.filter((s) => s.id !== id));
    },
    [commit],
  );

  const setText = useCallback((id: string, text: string) => patch(id, {text}), [patch]);

  return {
    shots,
    notice,
    add,
    remove,
    setText,
    reading: shots.some((s) => s.status === "reading"),
    full: shots.length >= MAX_SCREENSHOTS,
  };
}
