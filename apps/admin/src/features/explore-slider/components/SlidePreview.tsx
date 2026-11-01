import type {BannerForm} from "../helper/bannerForm";

/** How a slide will look on the Explore page: the same picture-or-colour, caption and button. */
export default function SlidePreview({form}: {form: BannerForm}) {
  const hasImage = form.background === "image" && !!form.imageUrl;
  return (
    <div
      className="relative flex h-32 w-full items-center overflow-hidden rounded-2xl p-5"
      style={{backgroundColor: form.bgColor, color: form.textColor}}
    >
      {hasImage && (
        <>
          <img src={form.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-transparent" aria-hidden="true" />
        </>
      )}
      <div className="relative z-10 flex max-w-[65%] flex-col gap-3">
        <p className="text-sm font-semibold leading-snug" style={{color: hasImage ? "#fff" : form.textColor}}>
          {form.caption.trim() || "Your caption appears here"}
        </p>
        {form.buttonLabel.trim() && (
          <span className="flex w-fit items-center gap-2 rounded-full bg-white py-1.5 pl-4 pr-1 text-xs font-semibold text-neutral-900 shadow-sm">
            {form.buttonLabel.trim()}
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 text-white">→</span>
          </span>
        )}
      </div>
    </div>
  );
}
