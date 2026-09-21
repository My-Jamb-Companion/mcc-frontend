"use client";

import {useState} from "react";
import {showSuccess} from "@mcc/ui";
import {Section} from "../../Pricing/components/Fields";
import {useActiveModel, useAvailableModels, useSetActiveModel} from "./hooks/useAiSettings";
import {aiSettingsErrorMessage} from "./services/aiSettings.service";

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
    <Section
      title="Active AI model"
      description="The model Brainy chat, flashcards, feedback, help, Admin Copilot and Parent Advisor all use right now. Switching it here takes effect immediately across the whole app -- no redeploy needed."
      aside={
        currentModelId && (
          <span className="rounded-full bg-violet-50 px-3 py-1.5 text-sm font-semibold text-violet-700">
            {currentModelId}
          </span>
        )
      }
    >
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
        </div>
      )}
    </Section>
  );
}
