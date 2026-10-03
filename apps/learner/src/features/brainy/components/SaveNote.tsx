import type {SaveStatus} from "../hooks/useSessionSaver";

/** One line under the results: progress saved, saving, or a retry when it failed. */
export default function SaveNote({status, onRetry}: {status: SaveStatus; onRetry: () => void}) {
  if (status === "saving") return <p className="text-xs text-muted">Saving your progress…</p>;
  if (status === "saved") return <p className="text-xs text-green-600">Progress saved.</p>;
  if (status === "failed") {
    return (
      <p role="alert" className="text-xs text-danger">
        Couldn&apos;t save your progress.{" "}
        <button type="button" onClick={onRetry} className="font-medium underline">
          Try again
        </button>
      </p>
    );
  }
  return null;
}
