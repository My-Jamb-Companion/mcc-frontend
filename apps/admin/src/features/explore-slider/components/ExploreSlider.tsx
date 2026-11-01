"use client";

import {useState} from "react";
import {ConfirmModal, Icon, showError, showSuccess} from "@mcc/ui";
import {getApiErrorMessage} from "@/src/features/categories/services/category.service";
import {useBanners, useDeleteBanner, useReorderBanners, useUpdateBanner} from "../hooks/useBanners";
import type {ApiBanner} from "../services/banner.service";
import {formFromBanner, moved} from "../helper/bannerForm";
import BannerModal from "./BannerModal";
import SlidePreview from "./SlidePreview";

/** The slider at the top of the learner Explore page: add, edit, order, switch on or off, delete. */
export default function ExploreSlider() {
  const {banners, isLoading} = useBanners();
  const update = useUpdateBanner();
  const reorder = useReorderBanners();
  const remove = useDeleteBanner();
  const [editing, setEditing] = useState<ApiBanner | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<ApiBanner | null>(null);

  const ids = banners.map((b) => b.banner_id);
  const fail = (e: unknown) => showError(getApiErrorMessage(e, "That didn't work. Please try again."));

  return (
    <div className="h-full">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Explore slider</h1>
          <p className="mt-1 text-sm text-slate-600">
            The slides at the top of the learner&apos;s Explore page. Students see the ones that are switched on, in this order.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Icon icon="line-md:plus" size={16} />
          Add a slide
        </button>
      </div>

      {isLoading ? (
        <p className="py-10 text-center text-sm text-slate-600">Loading slides…</p>
      ) : banners.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <p className="text-sm font-medium text-slate-800">No slides yet</p>
          <p className="mt-1 text-sm text-slate-600">Until you add one, the Explore page shows no slider.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {banners.map((banner, i) => (
            <li key={banner.banner_id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <div className="w-full md:w-96 md:shrink-0">
                  <SlidePreview form={formFromBanner(banner)} />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-slate-600">Slide {i + 1}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${banner.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                      {banner.is_active ? "Showing" : "Hidden"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-800">{banner.caption}</p>
                  {banner.link_url && <p className="truncate text-xs text-slate-600">{banner.button_label} → {banner.link_url}</p>}
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setEditing(banner)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50">Edit</button>
                    <button
                      type="button"
                      disabled={update.isPending}
                      onClick={() => update.mutate({id: banner.banner_id, payload: {is_active: !banner.is_active}}, {onError: fail})}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-50"
                    >
                      {banner.is_active ? "Hide" : "Show"}
                    </button>
                    <button type="button" aria-label="Move up" disabled={i === 0 || reorder.isPending}
                      onClick={() => reorder.mutate(moved(ids, banner.banner_id, -1), {onError: fail})}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40">↑</button>
                    <button type="button" aria-label="Move down" disabled={i === banners.length - 1 || reorder.isPending}
                      onClick={() => reorder.mutate(moved(ids, banner.banner_id, 1), {onError: fail})}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50 disabled:opacity-40">↓</button>
                    <button type="button" onClick={() => setDeleting(banner)} className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50">Delete</button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <BannerModal open={adding || !!editing} banner={editing} onClose={() => { setAdding(false); setEditing(null); }} />

      <ConfirmModal
        open={!!deleting}
        title="Delete this slide?"
        message="It disappears from the Explore page for good. To hide it for now, use Hide instead."
        confirmText="Delete slide"
        variant="danger"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (!deleting) return;
          remove.mutate(deleting.banner_id, {
            onSuccess: () => { showSuccess("Slide deleted."); setDeleting(null); },
            onError: fail,
          });
        }}
      />
    </div>
  );
}
