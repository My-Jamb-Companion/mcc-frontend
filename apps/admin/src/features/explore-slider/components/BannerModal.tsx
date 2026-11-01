"use client";

import {useEffect, useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import ImageField from "@/src/features/landing/components/ImageField";
import {getApiErrorMessage} from "@/src/features/categories/services/category.service";
import {useCreateBanner, useUpdateBanner} from "../hooks/useBanners";
import type {ApiBanner} from "../services/banner.service";
import {
  MAX_BUTTON,
  MAX_CAPTION,
  bannerPayload,
  emptyBannerForm,
  formFromBanner,
  validateBanner,
  type BannerForm,
} from "../helper/bannerForm";
import SlidePreview from "./SlidePreview";

const INPUT = "w-full rounded-lg border border-muted/40 px-3 py-2 text-sm text-foreground bg-transparent outline-none focus:border-violet-400";

function ColourField({label, value, onChange, error}: {label: string; value: string; onChange: (v: string) => void; error?: string}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          aria-label={`${label} picker`}
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          onChange={(e) => onChange(e.target.value.toUpperCase())}
          className="h-9 w-12 cursor-pointer rounded-md border border-muted/40 bg-white p-0.5"
        />
        <input value={value} onChange={(e) => onChange(e.target.value)} className={`${INPUT} font-mono`} maxLength={7} aria-label={label} />
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

/** Create a slide, or edit one: its picture or colour, caption, button and link, with the slide shown as students see it. */
export default function BannerModal({open, banner, onClose}: {open: boolean; banner: ApiBanner | null; onClose: () => void}) {
  const [form, setForm] = useState<BannerForm>(emptyBannerForm());
  const [showErrors, setShowErrors] = useState(false);
  const create = useCreateBanner();
  const update = useUpdateBanner();
  const pending = create.isPending || update.isPending;

  useEffect(() => {
    if (!open) return;
    setForm(banner ? formFromBanner(banner) : emptyBannerForm());
    setShowErrors(false);
  }, [open, banner]);

  const set = <K extends keyof BannerForm>(key: K, value: BannerForm[K]) => setForm((f) => ({...f, [key]: value}));
  const errors = validateBanner(form);
  const err = (key: keyof typeof errors) => (showErrors ? errors[key] : undefined);

  function save() {
    setShowErrors(true);
    if (Object.keys(errors).length) return;
    const payload = bannerPayload(form);
    const done = {
      onSuccess: () => {
        showSuccess(banner ? "Slide saved." : "Slide added.");
        onClose();
      },
      onError: (e: unknown) => showError(getApiErrorMessage(e, "The slide couldn't be saved. Please try again.")),
    };
    if (banner) update.mutate({id: banner.banner_id, payload}, done);
    else create.mutate(payload, done);
  }

  return (
    <Modal open={open} title={banner ? "Edit slide" : "Add a slide"} maxWidth="max-w-2xl">
      <div className="flex flex-col gap-5">
        <SlidePreview form={form} />

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-foreground" htmlFor="slide-caption">Caption</label>
          <textarea
            id="slide-caption"
            value={form.caption}
            onChange={(e) => set("caption", e.target.value)}
            rows={2}
            className={INPUT}
            placeholder="Sharpen your Finance skills with our new Finance course"
          />
          <div className="flex justify-between text-xs">
            <span className="text-red-600">{err("caption")}</span>
            <span className={form.caption.length > MAX_CAPTION ? "text-red-600" : "text-muted"}>{form.caption.length}/{MAX_CAPTION}</span>
          </div>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="text-sm font-medium text-foreground">Background</legend>
          <div className="flex gap-2">
            {(["colour", "image"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => set("background", kind)}
                aria-pressed={form.background === kind}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium ${
                  form.background === kind ? "border-primary bg-primary/10 text-primary" : "border-muted/40 text-foreground hover:bg-muted/10"
                }`}
              >
                {kind === "colour" ? "A colour" : "A picture"}
              </button>
            ))}
          </div>
          {form.background === "colour" ? (
            <ColourField label="Background colour" value={form.bgColor} onChange={(v) => set("bgColor", v)} error={err("bgColor")} />
          ) : (
            <>
              <ImageField label="Picture" folder="banners" value={form.imageUrl} onChange={(v) => set("imageUrl", v)}
                help="A wide picture works best (about 3 to 1). A dark shade is laid over it so the caption stays readable." />
              {err("image") && <p className="text-xs text-red-600">{err("image")}</p>}
            </>
          )}
          {form.background === "colour" && (
            <ColourField label="Caption colour" value={form.textColor} onChange={(v) => set("textColor", v)} error={err("textColor")} />
          )}
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="slide-button">Button words <span className="font-normal text-muted">(optional)</span></label>
            <input id="slide-button" value={form.buttonLabel} onChange={(e) => set("buttonLabel", e.target.value)} maxLength={MAX_BUTTON + 10} className={INPUT} placeholder="Enrol now" />
            {err("buttonLabel") && <p className="text-xs text-red-600">{err("buttonLabel")}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground" htmlFor="slide-link">Button link</label>
            <input id="slide-link" value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} className={INPUT} placeholder="/learnings/course/… or https://…" />
            {err("linkUrl") ? (
              <p className="text-xs text-red-600">{err("linkUrl")}</p>
            ) : (
              <p className="text-xs text-muted">A page in the app starts with /, another site with https://.</p>
            )}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-violet-600" />
          Show this slide to students
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:text-foreground bg-transparent">Cancel</button>
          <button type="button" onClick={save} disabled={pending}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
            {pending ? "Saving…" : "Save slide"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
