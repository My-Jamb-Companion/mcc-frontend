"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {ConfirmModal, Icon, Modal, showError, showSuccess} from "@mcc/ui";
import {
  BLOCK_BY_TYPE,
  SITE_FIELDS,
  createBlock,
  defaultContent,
  duplicateBlock,
  insertBlock,
  moveBlock,
  normalizeContent,
  removeBlock,
  sameContent,
  updateBlock,
} from "@mcc/landing-content";
import type {FieldData, LandingContent} from "@mcc/landing-content";
import {useMyAccess} from "@/src/features/admin-access/hooks/useAdminAccess";
import {canManage, MyAccess} from "@/src/features/admin-access/helper/access";
import {blockSubtitle, blockTitle, editorStatus, findUnsafeLinks} from "../helper/editor";
import {
  useDiscardLandingDraft,
  useLandingPage,
  usePublishLandingPage,
  useSaveLandingDraft,
  LANDING_KEY,
} from "../hooks/useLanding";
import {isDraftConflict, landingErrorMessage} from "../services/landing.service";
import type {LandingPageState} from "../services/landing.service";
import BlockList, {SITE_SELECTION} from "./BlockList";
import FieldForm from "./FieldForm";
import PreviewPane from "./PreviewPane";
import VersionHistoryModal from "./VersionHistoryModal";

/** What the editor starts from: the saved draft, else what is live, else the built-in design. */
const startingContent = (state: LandingPageState): LandingContent =>
  normalizeContent(state.draft?.content ?? state.published?.content ?? defaultContent());

function Editor({state, readOnly, onReload}: {state: LandingPageState; readOnly: boolean; onReload: () => Promise<void>}) {
  const save = useSaveLandingDraft();
  const publish = usePublishLandingPage();
  const discard = useDiscardLandingDraft();

  const [content, setContent] = useState<LandingContent>(() => startingContent(state));
  const [saved, setSaved] = useState<LandingContent>(content);
  const [revision, setRevision] = useState<number | null>(state.draft?.revision ?? null);
  const [selectedId, setSelectedId] = useState<string | null>(content.blocks[0]?.id ?? SITE_SELECTION);
  const [conflict, setConflict] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [note, setNote] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [confirm, setConfirm] = useState<"discard" | "reload" | null>(null);
  const [pane, setPane] = useState<"edit" | "preview">("edit");

  const dirty = useMemo(() => !sameContent(content, saved), [content, saved]);
  const unsafe = useMemo(() => findUnsafeLinks(content), [content]);
  const busy = save.isPending || publish.isPending || discard.isPending;
  const hasDraft = revision !== null;
  const status = editorStatus({dirty, hasDraft, hasPublished: !!state.published, draftDiffers: state.has_unpublished_changes});

  const selectedBlock = content.blocks.find((b) => b.id === selectedId) ?? null;
  const edit = (patch: (c: LandingContent) => LandingContent) => !readOnly && setContent(patch);

  /** Save the working copy as the draft. Returns whether it worked. */
  const saveDraft = useCallback(async (): Promise<boolean> => {
    if (readOnly) return false;
    if (unsafe.length) {
      showError("Some links aren't valid. Fix the ones marked in red, then save.");
      return false;
    }
    const snapshot = content;
    try {
      const draft = await save.mutateAsync({content: snapshot, baseRevision: revision});
      setRevision(draft.revision);
      setSaved(snapshot);
      setConflict(false);
      return true;
    } catch (error) {
      if (isDraftConflict(error)) setConflict(true);
      else showError(landingErrorMessage(error, "Couldn't save the draft. Please try again."));
      return false;
    }
  }, [content, readOnly, revision, save, unsafe.length]);

  async function publishNow() {
    // Publishing takes the saved draft, so save what is on screen first.
    if ((dirty || !hasDraft) && !(await saveDraft())) return setPublishing(false);
    publish.mutate(note, {
      onSuccess: () => {
        showSuccess("Published. Visitors will see it within about a minute.");
        setRevision(null);
        setSaved(content);
        setNote("");
        setPublishing(false);
      },
      onError: (error) => {
        setPublishing(false);
        if (isDraftConflict(error)) setConflict(true);
        else showError(landingErrorMessage(error, "Couldn't publish. Please try again."));
      },
    });
  }

  function discardChanges() {
    setConfirm(null);
    if (!hasDraft) return setContent(saved);
    discard.mutate(undefined, {
      onSuccess: () => { showSuccess("Changes discarded."); void onReload(); },
      onError: (error) => showError(landingErrorMessage(error, "Couldn't discard the draft.")),
    });
  }

  // Cmd/Ctrl+S saves the draft; leaving with unsaved edits asks first.
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        if (dirty && !busy) void saveDraft();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, busy, saveDraft]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const toneClass = {ok: "bg-emerald-50 text-emerald-700", warn: "bg-amber-50 text-amber-700", muted: "bg-gray-100 text-gray-600"}[status.tone];
  const canPublish = !readOnly && !busy && (dirty || hasDraft || state.has_unpublished_changes || !state.published);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="mr-auto">
          <h1 className="text-xl font-semibold text-gray-900">Landing page</h1>
          <p className="text-sm text-gray-500">Edit the public home page. Changes reach visitors only when you publish.</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneClass}`} role="status">{status.label}</span>
        <button type="button" onClick={() => setHistoryOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <Icon icon="lucide:history" size={15} /> History
        </button>
        {!readOnly && (dirty || hasDraft) && (
          <button type="button" disabled={busy} onClick={() => setConfirm("discard")} className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:text-red-600 disabled:opacity-50">
            Discard changes
          </button>
        )}
        {!readOnly && (
          <>
            <button type="button" disabled={!dirty || busy} onClick={() => void saveDraft()} className="rounded-lg border border-violet-200 px-4 py-2 text-sm font-semibold text-violet-700 hover:bg-violet-50 disabled:opacity-50">
              {save.isPending ? "Saving…" : "Save draft"}
            </button>
            <button type="button" disabled={!canPublish} onClick={() => setPublishing(true)} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              Publish
            </button>
          </>
        )}
      </div>

      {conflict && (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="mr-auto">Someone else changed this draft since you opened it, so your save was not applied.</span>
          <button type="button" onClick={() => setConfirm("reload")} className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700">Load the latest</button>
        </div>
      )}
      {unsafe.length > 0 && (
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
          {unsafe.length === 1 ? "One link isn't valid" : `${unsafe.length} links aren't valid`}. Links must start with https://, http://, mailto:, tel:, # or /. They are marked in red, and saving is paused until they are fixed.
        </p>
      )}

      <div className="flex gap-1 rounded-xl bg-gray-100 p-1 xl:hidden" role="tablist" aria-label="Editor view">
        {(["edit", "preview"] as const).map((p) => (
          <button key={p} type="button" role="tab" aria-selected={pane === p} onClick={() => setPane(p)} className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium ${pane === p ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"}`}>
            {p === "edit" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[300px_minmax(0,440px)_minmax(0,1fr)]">
        <div className={`${pane === "edit" ? "" : "hidden"} xl:block`}>
          <BlockList
            blocks={content.blocks}
            selectedId={selectedId}
            disabled={readOnly}
            onSelect={setSelectedId}
            onMove={(id, to) => edit((c) => ({...c, blocks: moveBlock(c.blocks, id, to)}))}
            onToggle={(id) => edit((c) => ({...c, blocks: c.blocks.map((b) => (b.id === id ? {...b, visible: !b.visible} : b))}))}
            onDuplicate={(id) => edit((c) => ({...c, blocks: duplicateBlock(c.blocks, id)}))}
            onRemove={(id) => {
              edit((c) => ({...c, blocks: removeBlock(c.blocks, id)}));
              if (selectedId === id) setSelectedId(SITE_SELECTION);
            }}
            onAdd={(type) => {
              const block = createBlock(type);
              const at = content.blocks.findIndex((b) => b.id === selectedId);
              edit((c) => ({...c, blocks: insertBlock(c.blocks, block, at >= 0 ? at + 1 : c.blocks.length)}));
              setSelectedId(block.id);
            }}
          />
        </div>

        <div className={`${pane === "edit" ? "" : "hidden"} min-w-0 xl:block`}>
          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            {selectedId === SITE_SELECTION && (
              <>
                <h2 className="mb-4 text-base font-semibold text-gray-900">Header, footer and search</h2>
                <FieldForm fields={SITE_FIELDS} data={content.site} disabled={readOnly} idPrefix="site"
                  onChange={(site: FieldData) => edit((c) => ({...c, site}))} />
              </>
            )}
            {selectedBlock && (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-gray-900">{blockTitle(selectedBlock)}</h2>
                    <p className="truncate text-xs text-gray-400">{BLOCK_BY_TYPE[selectedBlock.type]?.description ?? blockSubtitle(selectedBlock)}</p>
                  </div>
                  {!selectedBlock.visible && <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">Hidden</span>}
                </div>
                {BLOCK_BY_TYPE[selectedBlock.type] ? (
                  <FieldForm
                    key={selectedBlock.id}
                    fields={BLOCK_BY_TYPE[selectedBlock.type].fields}
                    data={selectedBlock.data}
                    disabled={readOnly}
                    idPrefix={selectedBlock.id}
                    onChange={(data: FieldData) => edit((c) => ({...c, blocks: updateBlock(c.blocks, selectedBlock.id, {data})}))}
                  />
                ) : (
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    This section type (&quot;{selectedBlock.type}&quot;) isn&apos;t known to this version of the editor. It is kept as it is and the site skips it.
                  </p>
                )}
              </>
            )}
            {!selectedBlock && selectedId !== SITE_SELECTION && <p className="text-sm text-gray-500">Pick a section on the left to edit it.</p>}
          </div>
        </div>

        <div className={`${pane === "preview" ? "" : "hidden"} min-w-0 xl:block xl:sticky xl:top-4 xl:h-[calc(100vh-8rem)]`}>
          <PreviewPane content={content} focusBlockId={selectedBlock?.id ?? null} />
        </div>
      </div>

      <Modal open={publishing} title="Publish the landing page?" maxWidth="max-w-md" onClose={() => setPublishing(false)}>
        <div className="flex flex-col gap-4">
          <p className="text-sm text-gray-600">Visitors will see this version within about a minute. The page it replaces stays in the history, so you can go back.</p>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-gray-700">
            What changed? (optional)
            <input value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} placeholder="e.g. New headline and exam cards" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-violet-400" />
          </label>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPublishing(false)} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Cancel</button>
            <button type="button" disabled={busy} onClick={() => void publishNow()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {busy ? "Publishing…" : "Publish"}
            </button>
          </div>
        </div>
      </Modal>

      <VersionHistoryModal open={historyOpen} onClose={() => setHistoryOpen(false)} onRestored={() => void onReload()} disabled={readOnly} />

      <ConfirmModal
        open={confirm === "discard"}
        variant="danger"
        title="Discard your changes?"
        message={hasDraft ? "The saved draft and your unsaved edits are thrown away, and the editor goes back to the published page." : "Your unsaved edits are thrown away."}
        confirmText="Discard changes"
        cancelText="Keep editing"
        onConfirm={discardChanges}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        open={confirm === "reload"}
        variant="danger"
        title="Load the latest draft?"
        message="Your unsaved edits are replaced by what was saved most recently."
        confirmText="Load the latest"
        cancelText="Keep my edits"
        onConfirm={() => { setConfirm(null); void onReload(); }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

export default function LandingEditor() {
  const queryClient = useQueryClient();
  const page = useLandingPage();
  const {data: access} = useMyAccess();
  const [generation, setGeneration] = useState(0);
  const readOnly = !!access && !canManage(access as MyAccess, "landing");

  // Reload from the server, then start the editor again from what it holds.
  const reload = useCallback(async () => {
    await queryClient.refetchQueries({queryKey: LANDING_KEY});
    setGeneration((g) => g + 1);
  }, [queryClient]);

  if (page.isLoading) return <p className="py-16 text-center text-sm text-gray-500">Loading the landing page…</p>;
  if (page.isError || !page.data)
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-gray-600">Couldn&apos;t load the landing page.</p>
        <button type="button" onClick={() => void page.refetch()} className="mt-3 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Try again</button>
      </div>
    );

  return <Editor key={generation} state={page.data} readOnly={readOnly} onReload={reload} />;
}
