import {usePricingVersions} from "../hooks/usePricingParameters";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit"});

export default function VersionHistory({
  activeVersion,
  viewing,
  onView,
}: {
  activeVersion: number | null;
  viewing: number | null;
  onView: (versionNumber: number | null) => void;
}) {
  const {data: versions, isLoading} = usePricingVersions();

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <h2 className="text-base font-bold text-neutral-900">Version history</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Saved versions never change. Prices record the version they were built on.
      </p>
      {isLoading ? (
        <p className="mt-4 text-sm text-neutral-400">Loading…</p>
      ) : !versions?.length ? (
        <p className="mt-4 text-sm text-neutral-400">No versions saved yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-neutral-100">
          {versions.map((v) => {
            const isActive = v.version_number === activeVersion;
            const isViewing = v.version_number === viewing || (viewing === null && isActive);
            return (
              <li key={v.version_id} className="flex items-start justify-between gap-4 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-neutral-900 tabular-nums">
                      Version {v.version_number}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-neutral-600 break-words">{v.change_reason}</p>
                  <p className="mt-0.5 text-xs text-neutral-400">
                    {v.created_by_name ?? "Unknown admin"} · {when(v.created_at)}
                  </p>
                </div>
                {!isViewing && (
                  <button
                    type="button"
                    onClick={() => onView(isActive ? null : v.version_number)}
                    className="shrink-0 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-50"
                  >
                    View
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
