import {useCallback, useEffect, useRef, useState} from "react";
import {Button, Icon} from "@mcc/ui";
import {useFormContext} from "@mcc/features";
import {CoursesFormValues, UploadedFile} from "../../types/types";
import {useRouter} from "next/navigation";

export function hasCompleteUpload(upload: {
  coverImage: UploadedFile | null;
  promoVideo: UploadedFile | null;
}) {
  return !!upload.coverImage && !!upload.promoVideo;
}

export default function PromotionalCoverUpload({
  courseName,
  isPublished,
  isEdit = false,
}: {
  courseName: string;
  isPublished: boolean;
  isEdit?: boolean;
}) {
  const {watch, setValue} = useFormContext<CoursesFormValues>();

  const coverImage = watch("upload.coverImage");
  const promoVideo = watch("upload.promoVideo");
  const setCoverImage = useCallback(
    (file: UploadedFile | null) => {
      setValue("upload.coverImage", file, {shouldDirty: true});
    },
    [setValue],
  );
  const setPromoVideo = useCallback(
    (file: UploadedFile | null) => {
      setValue("upload.promoVideo", file, {shouldDirty: true});
    },
    [setValue],
  );

  return (
    <>
      {isPublished && !isEdit ? (
        <UploadedSuccess />
      ) : (
        <section className="h-full">
          <div>
            <h1 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <span className="uppercase">{courseName}</span>
            </h1>
          </div>

          <div className="mt-6">
            <UploadDropzone
              label="Cover image"
              hint="Dimension should be 2460 x 1960"
              dropText="Drag and drop image files to upload"
              accept="image/*"
              kind="image"
              value={coverImage}
              onChange={setCoverImage}
            />
          </div>

          <div className="mt-6">
            <UploadDropzone
              label="Promotional video"
              hint="MP4 or MOV, up to a few minutes"
              dropText="Drag and drop video files to upload"
              accept="video/*"
              kind="video"
              value={promoVideo}
              onChange={setPromoVideo}
            />
          </div>
        </section>
      )}
    </>
  );
}

function UploadDropzone({
  label,
  hint,
  dropText,
  accept,
  kind,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  dropText: string;
  accept: string;
  kind: "image" | "video";
  value: UploadedFile | null;
  onChange: (file: UploadedFile | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulated upload: holds the file + progress while "uploading", then
  // hands off to `value` once it reaches 100. Swap the timer effect below
  // for a real upload call (FormData POST, presigned URL PUT, etc.) later —
  // just call setProgress(...) from the real upload's progress callback.
  const [pending, setPending] = useState<UploadedFile | null>(null);
  const [progress, setProgress] = useState(0);

  // Ticks progress up while an upload is in flight.
  useEffect(() => {
    if (!pending || progress >= 100) return;
    const timer = setTimeout(() => {
      setProgress((p) => Math.min(p + 20, 100));
    }, 300);
    return () => clearTimeout(timer);
  }, [pending, progress]);

  // Hands the file off to the parent once progress hits 100. Deferred via
  // setTimeout (rather than calling setState directly in the effect body)
  // to avoid the "setState synchronously within an effect" cascading-render
  // warning.
  useEffect(() => {
    if (!pending || progress < 100) return;
    const timer = setTimeout(() => {
      onChange(pending);
      setPending(null);
      setProgress(0);
    }, 0);
    return () => clearTimeout(timer);
  }, [pending, progress, onChange]);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith(kind === "image" ? "image/" : "video/")) {
      setError(`Please upload a ${kind} file.`);
      return;
    }
    setError(null);
    setProgress(0);
    setPending({file, previewUrl: URL.createObjectURL(file)});
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    acceptFile(e.dataTransfer.files?.[0]);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    acceptFile(e.target.files?.[0]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (value) URL.revokeObjectURL(value.previewUrl);
    onChange(null);
    setError(null);
  }

  function cancelPending() {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    setProgress(0);
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <p className="font-semibold text-sm">
          <span className="text-danger">*</span> {label}
        </p>
        <Icon icon="proicons:info" size={16} />
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
      />

      {pending ? (
        <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-violet-50/60 shadow-sm">
          <div className="relative max-h-80 w-full opacity-40">
            {kind === "image" ? (
              <img
                src={pending.previewUrl}
                alt={label}
                className="max-h-80 w-full object-cover"
              />
            ) : (
              <video
                src={pending.previewUrl}
                className="max-h-80 w-full bg-black"
              />
            )}
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-lg font-semibold text-violet-700">
              {progress}%
            </span>
            <div className="h-1.5 w-40 overflow-hidden rounded-full bg-white/70">
              <div
                className="h-full bg-violet-500 transition-all duration-300"
                style={{width: `${progress}%`}}
              />
            </div>
            <button
              type="button"
              onClick={cancelPending}
              className="mt-1 text-xs font-medium text-gray-600 underline hover:text-gray-900"
            >
              Cancel
            </button>
          </div>

          <p className="truncate border-t border-muted/20 bg-white px-4 py-2 text-xs text-muted">
            {pending.file.name}
          </p>
        </div>
      ) : value ? (
        <div className="relative overflow-hidden rounded-xl border border-muted/30 shadow-sm">
          {kind === "image" ? (
            <img
              src={value.previewUrl}
              alt={label}
              className="max-h-80 w-full object-cover"
            />
          ) : (
            <video
              src={value.previewUrl}
              controls
              className="max-h-80 w-full bg-black"
            />
          )}

          <div className="absolute right-3 top-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white font-semibold"
              onClick={() => inputRef.current?.click()}
            >
              Replace
            </Button>
            <button
              type="button"
              onClick={handleRemove}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-500 shadow hover:text-gray-800"
            >
              <Icon icon="lucide:x" size={16} />
            </button>
          </div>

          <p className="truncate border-t border-muted/20 bg-white px-4 py-2 text-xs text-muted">
            {value.file.name}
          </p>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center gap-6 rounded-xl border p-6 pt-20 shadow-sm transition-colors ${
            isDragging ? "border-violet-400 bg-violet-50/50" : "border-muted/30"
          }`}
        >
          <div className="relative">
            <div>
              <EllcipsIcon />
            </div>
            <div className="absolute bottom-0 left-0 translate-y-5 -translate-x-4">
              <UploadIcon />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-semibold">{dropText}</p>
            <p className="text-muted text-xs">
              Your {kind} will be private until you publish them
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="font-semibold mt-3"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              Select file
            </Button>
          </div>

          <p className="text-muted text-sm">{hint}</p>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-danger">{error}</p>}
    </div>
  );
}
function UploadedSuccess() {
  const router = useRouter();
  return (
    <section className="h-full">
      <div
        className={`flex flex-col items-center justify-center gap-6 p-6 pt-20 h-full `}
      >
        <div className="relative">
          <div>
            <EllcipsIcon />
          </div>
          <div className="absolute bottom-0 left-0 translate-y-5 -translate-x-4">
            <CloudIcon />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-semibold">Your edits have been saved</p>
          <p className="text-muted text-xs">
            Your changes will be private until you publish them
          </p>
          <Button
            type="button"
            size="sm"
            className="font-semibold mt-3"
            onClick={() => router.push("/dashboard/courses")}
          >
            Proceed to dashboard
          </Button>
        </div>
      </div>
    </section>
  );
}

function UploadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="101"
      height="101"
      viewBox="0 0 101 101"
      fill="none"
    >
      <path
        d="M84.2026 60.2006V60.218C84.2026 61.1496 83.6019 61.9681 82.4177 62.6559L73.9459 67.5405C71.6212 68.89 68.7914 69.5518 65.4654 69.5518C62.1306 69.5431 59.3009 68.8639 56.9587 67.5144L5.82315 37.9893C3.481 36.6397 2.30558 35.0028 2.29688 33.0786C2.29688 31.1631 3.44618 29.5262 5.77092 28.1853L14.2427 23.292C15.4443 22.5955 16.8548 22.2559 18.483 22.2559C20.1112 22.2646 21.5304 22.6129 22.7319 23.3094C23.9422 24.006 24.5517 24.8244 24.5517 25.7648V25.7822C24.5517 26.7138 23.9509 27.5323 22.758 28.2114L14.2949 33.1047L24.5517 39.0254L46.5105 51.7026L50.6811 54.1057L59.1964 59.0251L65.4218 62.6211L73.8937 57.7365C75.0952 57.04 76.5057 56.6917 78.1339 56.7004C79.7621 56.7004 81.1813 57.0487 82.3916 57.7452C83.5931 58.4418 84.2026 59.2602 84.2026 60.2006Z"
        fill="white"
      />
      <path
        d="M99.2568 34.7242C99.2568 34.9506 99.2306 35.1682 99.1697 35.3685C98.9607 36.065 98.4122 36.6571 97.5154 37.1447C96.3487 37.7803 94.9556 38.1112 93.3274 38.146C91.6295 38.146 90.1755 37.8151 88.9652 37.1621C87.7549 36.5004 87.1542 35.6819 87.1455 34.7068L87.1019 25.5123L56.8194 42.987C55.6266 43.6836 54.2074 44.0231 52.5792 44.0231C50.951 44.0231 49.5318 43.6662 48.3302 42.9696C47.1199 42.2731 46.5104 41.4546 46.5104 40.5143C46.5017 39.5739 47.1024 38.7642 48.304 38.0676L56.68 33.2266L57.3853 32.8261L78.5779 20.5842L62.6443 20.5581C60.9465 20.5581 59.5273 20.2098 58.3954 19.5132C57.2548 18.8167 56.6887 17.9721 56.68 16.9969C56.7497 16.0566 57.3243 15.2468 58.4214 14.5764C59.5185 13.906 60.9116 13.5664 62.6094 13.5664L93.188 13.6274C94.0413 13.6274 94.8075 13.7231 95.478 13.906C96.1484 14.0888 96.7753 14.35 97.3412 14.6722C97.9072 15.003 98.3512 15.36 98.6734 15.7518C98.9956 16.1436 99.1523 16.579 99.161 17.0666L99.2568 34.7242Z"
        fill="white"
      />
      <path
        d="M99.2568 52.138C99.2568 53.1219 98.6821 53.9316 97.5154 54.5585C96.3487 55.1941 94.9556 55.525 93.3274 55.5598C91.6295 55.5598 90.1755 55.2289 88.9652 54.5759C87.7549 53.9142 87.1542 53.0957 87.1455 52.1206L87.1019 42.9261L59.1964 59.0251L50.6811 54.1057L46.5105 51.7026L46.5104 40.5143C46.5104 41.4546 47.1199 42.2731 48.3302 42.9696C49.5318 43.6662 50.951 44.0231 52.5792 44.0231C54.2074 44.0231 55.6266 43.6836 56.8194 42.987L87.1019 25.5123L87.1455 34.7068C87.1542 35.6819 87.7549 36.5004 88.9652 37.1621C90.1755 37.8151 91.6295 38.146 93.3274 38.146C94.9556 38.1112 96.3487 37.7803 97.5154 37.1447C98.4122 36.6571 98.9607 36.065 99.1697 35.3685L99.2568 52.138Z"
        fill="white"
      />
      <path
        d="M24.5517 25.7822V39.0254L14.2949 33.1047L22.758 28.2114C23.9509 27.5323 24.5517 26.7138 24.5517 25.7822Z"
        fill="white"
      />
      <path
        d="M84.2026 60.2267V77.6231C84.2113 78.5634 83.6106 79.3819 82.4177 80.0784L73.9459 84.963C71.6212 86.3126 68.7914 86.9743 65.4654 86.9743C62.1306 86.9656 59.3009 86.2864 56.9587 84.9369L5.82315 55.4118C3.481 54.0622 2.30558 52.4253 2.29688 50.5011V33.0873C2.30558 35.0115 3.481 36.6484 5.82315 37.998L56.9587 67.5231C59.3009 68.8726 62.1306 69.5518 65.4654 69.5605C68.7914 69.5605 71.6212 68.8988 73.9459 67.5492L82.4177 62.6646C83.6019 61.9768 84.2026 61.1583 84.2026 60.2267Z"
        fill="white"
      />
      <path
        d="M78.5779 20.5842L57.3853 32.8261L56.68 33.2266V16.9969C56.6887 17.9721 57.2548 18.8167 58.3954 19.5132C59.5273 20.2098 60.9465 20.5581 62.6443 20.5581L78.5779 20.5842Z"
        fill="white"
      />
      <path
        d="M24.5517 39.0254L46.5105 51.7026L50.6811 54.1057L59.1964 59.0251L65.4218 62.6211L73.8937 57.7365C75.0952 57.04 76.5057 56.6917 78.1339 56.7004C79.7621 56.7004 81.1813 57.0487 82.3916 57.7452C83.5931 58.4418 84.2026 59.2602 84.2026 60.2006V60.218C84.2026 61.1496 83.6019 61.9681 82.4177 62.6559L73.9459 67.5405C71.6212 68.89 68.7914 69.5518 65.4654 69.5518C62.1306 69.5431 59.3009 68.8639 56.9587 67.5144L5.82315 37.9893C3.481 36.6397 2.30558 35.0028 2.29688 33.0786C2.29688 31.1631 3.44618 29.5262 5.77092 28.1853L14.2427 23.292C15.4443 22.5955 16.8548 22.2559 18.483 22.2559C20.1112 22.2646 21.5304 22.6129 22.7319 23.3094C23.9422 24.006 24.5517 24.8244 24.5517 25.7648V25.7822M24.5517 25.7822C24.5517 26.7138 23.9509 27.5323 22.758 28.2114L14.2949 33.1047L24.5517 39.0254M24.5517 25.7822V39.0254M56.68 33.2266L48.304 38.0676C47.1024 38.7642 46.5017 39.5739 46.5104 40.5143L46.5105 51.7026M59.1964 59.0251L87.1019 42.9261L87.1455 52.1206C87.1542 53.0957 87.7549 53.9142 88.9652 54.5759C90.1755 55.2289 91.6295 55.5598 93.3274 55.5598C94.9556 55.525 96.3487 55.1941 97.5154 54.5585C98.6821 53.9316 99.2568 53.1219 99.2568 52.138L99.1697 35.3685M46.5104 40.5143C46.5104 41.4546 47.1199 42.2731 48.3302 42.9696C49.5318 43.6662 50.951 44.0231 52.5792 44.0231C54.2074 44.0231 55.6266 43.6836 56.8194 42.987L87.1019 25.5123L87.1455 34.7068C87.1542 35.6819 87.7549 36.5004 88.9652 37.1621C90.1755 37.8151 91.6295 38.146 93.3274 38.146C94.9556 38.1112 96.3487 37.7803 97.5154 37.1447C98.4122 36.6571 98.9607 36.065 99.1697 35.3685C99.2306 35.1682 99.2568 34.9506 99.2568 34.7242L99.161 17.0666C99.1523 16.579 98.9956 16.1436 98.6734 15.7518C98.3512 15.36 97.9072 15.003 97.3412 14.6722C96.7753 14.35 96.1484 14.0888 95.478 13.906C94.8075 13.7231 94.0413 13.6274 93.1881 13.6274L62.6094 13.5664C60.9116 13.5664 59.5185 13.906 58.4214 14.5764C57.3243 15.2468 56.7497 16.0566 56.68 16.9969V33.2266M56.68 33.2266L57.3853 32.8261L78.5779 20.5842L62.6443 20.5581C60.9465 20.5581 59.5273 20.2098 58.3954 19.5132C57.2548 18.8167 56.6887 17.9721 56.68 16.9969M84.2026 60.2267V77.6231C84.2113 78.5634 83.6106 79.3819 82.4177 80.0784L73.9459 84.963C71.6212 86.3126 68.7914 86.9743 65.4654 86.9743C62.1306 86.9656 59.3009 86.2864 56.9587 84.9369L5.82315 55.4118C3.481 54.0622 2.30558 52.4253 2.29688 50.5011V33.0873C2.30558 35.0115 3.481 36.6484 5.82315 37.998L56.9587 67.5231C59.3009 68.8726 62.1306 69.5518 65.4654 69.5605C68.7914 69.5605 71.6212 68.8988 73.9459 67.5492L82.4177 62.6646C83.6019 61.9768 84.2026 61.1583 84.2026 60.2267Z"
        stroke="#27272A"
        strokeOpacity="0.25"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function EllcipsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="120"
      height="120"
      viewBox="0 0 120 120"
      fill="none"
    >
      <circle cx="60" cy="60" r="60" fill="#F4F4F5" />
    </svg>
  );
}
function CloudIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="115"
      height="92"
      viewBox="0 0 115 92"
      fill="none"
    >
      <path
        d="M38.6498 64.8509C38.6498 64.9109 38.6498 64.9609 38.6298 65.0209C38.5798 65.8609 37.9998 66.5909 36.9098 67.2209C35.7498 67.8909 34.3798 68.2209 32.8098 68.2209C32.1598 68.2209 31.5398 68.1609 30.9598 68.0409H30.9498C30.1298 67.8809 29.3698 67.6009 28.6898 67.2009C27.5198 66.5309 26.9298 65.7409 26.9298 64.8309C26.9198 63.9209 27.4998 63.1309 28.6598 62.4609C29.3498 62.0609 30.1098 61.7809 30.9498 61.6209C31.5198 61.5109 32.1298 61.4609 32.7698 61.4609C34.3398 61.4609 35.7198 61.8009 36.8898 62.4709C38.0498 63.1509 38.6398 63.9409 38.6498 64.8509Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M67.4075 62.5328C67.4075 63.4428 66.8375 64.2328 65.6775 64.9028C64.5075 65.5728 63.1475 65.9028 61.5675 65.9028C59.9875 65.9028 58.6176 65.5628 57.4476 64.8828C56.2776 64.2128 55.6975 63.4228 55.6875 62.5128C55.6875 61.6028 56.2675 60.8128 57.4275 60.1428C58.5875 59.4728 59.9576 59.1328 61.5276 59.1328C63.1076 59.1328 64.4776 59.4828 65.6476 60.1528C66.8176 60.8328 67.3975 61.6228 67.4075 62.5328Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M42.6733 48.2416C42.6733 49.1516 42.0933 49.9416 40.9333 50.6116C39.7733 51.2816 38.4033 51.6216 36.8333 51.6116C35.2533 51.6116 33.8833 51.2716 32.7133 50.6016C31.5433 49.9216 30.9533 49.1316 30.9533 48.2216C30.9433 47.3116 31.5233 46.5216 32.6833 45.8516C33.8533 45.1816 35.2133 44.8516 36.7933 44.8516C38.3733 44.8516 39.7433 45.1916 40.9133 45.8716C42.0733 46.5416 42.6633 47.3316 42.6733 48.2416Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M112.346 45.6893V46.3193C112.346 46.4293 112.346 46.5393 112.336 46.6493C112.086 50.5193 109.536 53.8593 104.686 56.6593C99.5557 59.6193 93.3957 61.0893 86.2057 61.0793C79.0157 61.0793 72.8357 59.5693 67.6857 56.5893L26.4457 32.7793C24.7457 31.7993 23.2857 30.7693 22.0457 29.6693C18.7157 26.7593 17.0357 23.4393 17.0157 19.7093C16.9957 14.6093 20.0857 10.2593 26.3057 6.67929C31.9657 3.39929 38.8157 1.63929 46.8257 1.36929C54.8457 1.10929 62.0057 2.36929 68.3257 5.14929C74.4157 4.16929 80.4857 4.13929 86.5157 5.05929C92.5557 5.98929 97.8357 7.7493 102.376 10.3693C108.556 13.9493 111.976 18.1793 112.616 23.0893C112.696 23.6593 112.726 24.2293 112.726 24.7893C112.726 28.3393 111.196 31.6293 108.146 34.6493C107.556 35.2293 106.916 35.8093 106.216 36.3693C110.176 39.0993 112.226 42.1993 112.346 45.6893Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M112.729 24.7891V44.7891C112.729 45.7991 112.609 46.7891 112.349 47.7591V45.6891C112.229 42.1991 110.179 39.0991 106.219 36.3691C106.919 35.8091 107.559 35.2291 108.149 34.6491C111.199 31.6291 112.729 28.3391 112.729 24.7891Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path d="M112.734 44.9991V44.7891V44.9991Z" fill="white" />
      <path d="M112.734 44.9991V44.7891" stroke="#6717DE" stroke-width="2" />
      <path d="M112.734 24.7881V24.0781V24.7881Z" fill="white" />
      <path d="M112.734 24.7881V24.0781" stroke="#6717DE" stroke-width="2" />
      <path
        d="M67.4075 62.5278V82.5278C67.4075 83.4378 66.8375 84.2278 65.6775 84.8978C64.5075 85.5678 63.1475 85.8978 61.5675 85.8978C59.9875 85.8978 58.6176 85.5578 57.4476 84.8778C56.2776 84.2078 55.6975 83.4178 55.6875 82.5078V62.5078C55.6975 63.4178 56.2776 64.2078 57.4476 64.8778C58.6176 65.5578 59.9875 65.8978 61.5675 65.8978C63.1475 65.8978 64.5075 65.5678 65.6775 64.8978C66.8375 64.2278 67.4075 63.4378 67.4075 62.5278Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M42.6731 48.2388V68.2387C42.6731 69.1487 42.0931 69.9387 40.9331 70.6087C40.2531 71.0087 39.4931 71.2887 38.6531 71.4487V64.8487C38.6431 63.9387 38.0531 63.1488 36.8931 62.4688C35.7231 61.7987 34.3431 61.4587 32.7731 61.4587C32.1331 61.4587 31.5231 61.5087 30.9531 61.6187V48.2188C30.9531 49.1288 31.5431 49.9187 32.7131 50.5987C33.8831 51.2687 35.2531 51.6087 36.8331 51.6087C38.4031 51.6187 39.7731 51.2787 40.9331 50.6087C42.0931 49.9387 42.6731 49.1488 42.6731 48.2388Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M38.6497 65.0281V84.8481C38.6497 85.7581 38.0697 86.5481 36.9097 87.2181C35.7497 87.8881 34.3797 88.2181 32.8097 88.2181C31.2397 88.2181 29.8597 87.8781 28.6897 87.1981C27.5197 86.5281 26.9297 85.7381 26.9297 84.8281V64.8281C26.9297 65.7381 27.5197 66.5281 28.6897 67.1981C29.3697 67.5981 30.1297 67.8781 30.9497 68.0381V68.1981C30.9497 68.1981 30.9497 68.0881 30.9597 68.0381C31.5397 68.1581 32.1597 68.2181 32.8097 68.2181C34.3797 68.2181 35.7497 67.8881 36.9097 67.2181C37.9997 66.5881 38.5797 65.8581 38.6297 65.0181C38.6397 65.0181 38.6497 65.0281 38.6497 65.0281Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M13.8976 50.7491V70.5591C13.9076 71.4691 13.3275 72.2591 12.1675 72.9291C11.0075 73.5991 9.6375 73.9391 8.0575 73.9391C6.4875 73.9291 5.10751 73.5891 3.94751 72.9191C2.77751 72.2391 2.1875 71.4491 2.1875 70.5391V50.5391C2.1875 51.4491 2.77751 52.2391 3.94751 52.9191C4.62751 53.3091 5.37752 53.5891 6.20752 53.7491V53.9191C6.20752 53.9191 6.20747 53.8091 6.21747 53.7591C6.79747 53.8791 7.4075 53.9391 8.0575 53.9391C9.6375 53.9391 11.0075 53.5991 12.1675 52.9291C13.2475 52.3091 13.8276 51.5791 13.8876 50.7391C13.8976 50.7391 13.8976 50.7491 13.8976 50.7491Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M17.9209 33.9775V53.9575C17.9309 54.8675 17.3509 55.6575 16.1909 56.3275C15.5009 56.7275 14.741 57.0075 13.901 57.1575V50.5575C13.901 49.6475 13.311 48.8575 12.141 48.1875C10.971 47.5075 9.60095 47.1675 8.03095 47.1675C7.39095 47.1675 6.78094 47.2175 6.21094 47.3375V33.9375C6.21094 34.8375 6.80089 35.6375 7.97089 36.3075C9.13089 36.9875 10.511 37.3275 12.081 37.3275C13.651 37.3275 15.0309 36.9975 16.1909 36.3275C16.5109 36.1475 16.791 35.9475 17.021 35.7375C17.621 35.2175 17.9209 34.6275 17.9209 33.9775Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M13.8977 50.5619V50.5819C13.8977 50.6319 13.8977 50.6919 13.8877 50.7419C13.8277 51.5819 13.2476 52.3119 12.1676 52.9319C11.0076 53.6019 9.63762 53.9419 8.05762 53.9419C7.40762 53.9419 6.7976 53.8819 6.2176 53.7619C6.2076 53.7619 6.20765 53.7519 6.20765 53.7519C5.37765 53.5919 4.62764 53.3119 3.94764 52.9219C2.77764 52.2419 2.18763 51.4519 2.18763 50.5419C2.17763 49.6319 2.75761 48.8419 3.91761 48.1719C4.60761 47.7719 5.36765 47.4919 6.20765 47.3419C6.77765 47.2219 7.38766 47.1719 8.02766 47.1719C9.59766 47.1719 10.9677 47.5119 12.1377 48.1919C13.3077 48.8619 13.8977 49.6519 13.8977 50.5619Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M112.356 66.0209V66.0609C112.356 66.2609 112.346 66.4509 112.336 66.6509C112.086 70.5209 109.536 73.8609 104.686 76.6609C99.5556 79.6209 93.3956 81.0909 86.2056 81.0809C79.0156 81.0809 72.8356 79.5709 67.6856 76.5909L67.4056 76.4309V62.5309C67.3956 61.6209 66.8156 60.8309 65.6456 60.1509C64.4756 59.4809 63.1056 59.1409 61.5256 59.1309C59.9556 59.1309 58.5856 59.4709 57.4256 60.1409C56.2656 60.8109 55.6856 61.6009 55.6856 62.5109V69.6609L42.6656 62.1409V48.2409C42.6556 47.3309 42.0656 46.5409 40.9056 45.8709C39.7356 45.1909 38.3656 44.8509 36.7856 44.8509C35.2056 44.8509 33.8456 45.1809 32.6756 45.8509C31.5156 46.5209 30.9356 47.3109 30.9456 48.2209V55.3809L26.4456 52.7809C22.0956 50.2709 19.2456 47.4009 17.9156 44.1709V33.9609C17.9156 33.3109 17.6156 32.7209 17.0156 32.1909V19.7109C17.0356 23.4409 18.7156 26.7609 22.0456 29.6709C23.2856 30.7709 24.7456 31.8009 26.4456 32.7809L67.6856 56.5909C72.8356 59.5709 79.0156 61.0709 86.2056 61.0809C93.3956 61.0909 99.5556 59.6209 104.686 56.6609C109.536 53.8609 112.086 50.5209 112.336 46.6509C112.346 46.5409 112.346 46.4309 112.346 46.3209V66.0209H112.356Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
      <path
        d="M17.921 33.9625V33.9825C17.921 34.6325 17.6211 35.2225 17.0211 35.7425C16.7911 35.9525 16.5111 36.1525 16.1911 36.3325C15.0311 37.0025 13.6611 37.3325 12.0811 37.3325C10.5011 37.3325 9.13101 36.9925 7.97101 36.3125C6.80101 35.6425 6.21106 34.8425 6.21106 33.9425C6.20106 33.0325 6.78104 32.2425 7.94104 31.5625C9.10104 30.8925 10.4711 30.5625 12.0511 30.5625C13.6211 30.5725 14.991 30.9125 16.161 31.5825C16.491 31.7725 16.7811 31.9725 17.0211 32.1925C17.6211 32.7225 17.921 33.3125 17.921 33.9625Z"
        fill="white"
        stroke="#6717DE"
        stroke-width="2"
      />
    </svg>
  );
}
