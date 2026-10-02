"use client";

import {useState} from "react";
import {showSuccess} from "@mcc/ui";
import {
  useActiveModel,
  useAvailableModels,
  useSetActiveModel,
  useTestConnection,
} from "./hooks/useAiSettings";
import {aiSettingsErrorMessage} from "./services/aiSettings.service";

// What an admin should do about each failure kind (app/core/ai.py::AIFailure).
const FAILURE_HINTS: Record<string, string> = {
  not_configured: "AI_API_BASE_URL (or the model) isn't set on the server.",
  auth: "The provider rejected the API key. Check AI_API_KEY on the server and that the key hasn't been revoked.",
  quota: "The provider says payment is required. Check the wallet balance, then retry.",
  model_not_found: "The provider doesn't recognise this model id. Switch to one from the catalog below.",
  bad_request: "The provider rejected the request itself. The detail below says why.",
  rate_limited: "The provider is rate-limiting requests. This usually clears on its own.",
  too_large: "The request exceeded the provider's size limit.",
  provider_error: "The provider returned a server error. This usually clears on its own.",
  network: "The server couldn't reach the provider at all.",
  empty_reply: "The model answered with nothing. Try a different model.",
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function AiModelCard() {
  const active = useActiveModel();
  const catalog = useAvailableModels();
  const setModel = useSetActiveModel();
  const connection = useTestConnection();

  const [modelId, setModelId] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  // Seeds the form once the active model loads, without fighting the admin's
  // own typing on every background refetch.
  const [seeded, setSeeded] = useState(false);
  if (!seeded && active.data) {
    setModelId(active.data.model_id);
    setSeeded(true);
  }

  const currentModelId = active.data?.model_id ?? null;
  const trimmedModelId = modelId.trim();
  const unchanged = !!currentModelId && trimmedModelId === currentModelId;
  // Only judged once the catalog actually loaded: an empty list means the
  // provider was unreachable, which proves nothing about the active model.
  const activeModelUnlisted =
    !!currentModelId && !!catalog.data?.length && !catalog.data.some((m) => m.id === currentModelId);

  const handleSave = () => {
    setError(null);
    if (!trimmedModelId) {
      setError("Enter or choose a model ID.");
      return;
    }
    setModel.mutate(
      {model_id: trimmedModelId, change_reason: reason.trim() || undefined},
      {
        onSuccess: (result) => {
          showSuccess(`Now using ${result.model_id}`);
          setReason("");
        },
        onError: (err) => setError(aiSettingsErrorMessage(err, "Couldn't switch the active model.")),
      },
    );
  };

  return (
    <section className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-2xl">
          <h2 className="text-lg font-bold text-neutral-900">Active AI model</h2>
          <p className="mt-1 text-base text-neutral-700">
            The model Brainy chat, flashcards, feedback, help, Admin Copilot and Parent Advisor all
            use right now. Switching it here takes effect immediately across the whole app -- no
            redeploy needed.
          </p>
        </div>
        {currentModelId && (
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
            {currentModelId}
          </span>
        )}
      </div>
      <div className="mt-5">
      {active.isLoading ? (
        <p className="text-base text-neutral-600">Loading…</p>
      ) : active.isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          {aiSettingsErrorMessage(active.error, "Couldn't load the active model.")}{" "}
          <button type="button" onClick={() => active.refetch()} className="font-semibold underline">
            Try again
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {activeModelUnlisted && (
            <div role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">Brainy is probably down.</p>
              <p className="mt-1">
                The active model &ldquo;{currentModelId}&rdquo; isn&apos;t in the provider&apos;s
                catalog, so every Brainy request will be rejected. Pick a listed model below, then
                use Test connection to confirm.
              </p>
            </div>
          )}

          <p className="text-sm text-neutral-600">
            {active.data?.changed_by_name && active.data?.changed_at
              ? `Last changed by ${active.data.changed_by_name} on ${when(active.data.changed_at)}${
                  active.data.change_reason ? ` -- ${active.data.change_reason}` : ""
                }`
              : "Still the environment default -- nobody has switched it from this screen yet."}
          </p>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-id" className="text-base font-medium text-neutral-900">
              Model ID
            </label>
            <input
              id="model-id"
              list="ai-model-catalog"
              type="text"
              autoComplete="off"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
              placeholder="e.g. gpt-5.6-luna"
              className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus-within:border-violet-500 focus:border-violet-500"
            />
            <datalist id="ai-model-catalog">
              {catalog.data?.map((m) => (
                <option key={m.id} value={m.id} />
              ))}
            </datalist>
            <p className="text-sm text-neutral-600">
              {catalog.isLoading
                ? "Loading the provider's model catalog for suggestions…"
                : catalog.data?.length
                  ? `${catalog.data.length} models available from the provider -- start typing for suggestions, or enter any model ID it supports.`
                  : "Couldn't load the provider's catalog right now -- you can still type a model ID directly."}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="model-change-reason" className="text-base font-medium text-neutral-900">
              Reason (optional)
            </label>
            <textarea
              id="model-change-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Trying a cheaper model for flashcard generation"
              className="w-full rounded-xl border border-neutral-200 p-3 text-base text-neutral-900 outline-none focus:border-violet-500"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={setModel.isPending || unchanged}
              className="rounded-full bg-violet-600 px-5 py-2.5 text-base font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
            >
              {setModel.isPending ? "Switching…" : unchanged ? "Already active" : "Switch model"}
            </button>
          </div>

          <div className="border-t border-neutral-100 pt-4">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => connection.mutate()}
                disabled={connection.isPending}
                className="rounded-full border border-neutral-300 px-5 py-2.5 text-base font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:opacity-50"
              >
                {connection.isPending ? "Testing…" : "Test connection"}
              </button>
              <p className="text-sm text-neutral-600">
                Sends one tiny real request the way Brainy does and shows the provider&apos;s actual answer.
              </p>
            </div>

            {connection.isError && (
              <p className="mt-3 text-sm text-red-600">
                {aiSettingsErrorMessage(connection.error, "Couldn't run the test.")}
              </p>
            )}

            {connection.data?.ok && (
              <p role="status" className="mt-3 rounded-xl border border-green-100 bg-green-50 p-3 text-sm text-green-800">
                Working. {connection.data.model} answered in {connection.data.latency_ms} ms.
              </p>
            )}

            {connection.data && !connection.data.ok && connection.data.failure && (
              <div role="alert" className="mt-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-800">
                <p className="font-semibold">
                  Failed on {connection.data.model}
                  {connection.data.failure.status ? ` (HTTP ${connection.data.failure.status})` : ""}
                  {" -- "}
                  {connection.data.failure.retryable ? "likely temporary" : "won't fix itself"}
                </p>
                <p className="mt-1">
                  {FAILURE_HINTS[connection.data.failure.kind] ?? "The call failed for an unrecognised reason."}
                </p>
                <p className="mt-2 break-words rounded-lg bg-white/60 p-2 font-mono text-xs">
                  {connection.data.failure.detail}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      </div>
    </section>
  );
}
