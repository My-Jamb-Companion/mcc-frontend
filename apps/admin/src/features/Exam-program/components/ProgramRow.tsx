import {Button} from "@/src/components/Buttons";
import {AnimatePresence, Icon, motion} from "@mcc/ui";
import {useEffect, useRef, useState} from "react";

export interface ProgramListRowData {
  id: string;
  examType: "utme" | "waec" | "neco" | "gce" | "internal";
  logoUrl?: string;
  teacherName: string;
  rating: string;
  reviewCount: string;
  title: string;
  tags: string[];
  extraTagsCount?: number;
  status: "live" | "draft";
  price: number;
  originalPrice?: number;
  perSubjectPrice?: number;
  currency: string;
  link: string;
}

interface ProgramOptionsMenuProps {
  onOpenProgram?: () => void;
  onEditProgram?: () => void;
  onPublishProgram?: () => void;
  onMessageTeacher?: () => void;
  onViewParentProgram?: () => void;
  onDeleteProgram?: () => void;
  /** Hide items that don't apply to this row, e.g. no parent program */
  hideViewParentProgram?: boolean;
}

interface MenuItemConfig {
  key: string;
  icon: string;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}

interface ProgramListRowProps {
  program: ProgramListRowData;
  onShareLink?: () => void;
  onOpen?: (program: ProgramListRowData) => void;
  menuHandlers?: ProgramOptionsMenuProps;
}

const STATUS_STYLES: Record<
  ProgramListRowData["status"],
  {dot: string; text: string; label: string; bg: string}
> = {
  live: {
    dot: "bg-emerald-500",
    text: "text-emerald-600",
    label: "Live",
    bg: "bg-emerald-200",
  },
  draft: {
    dot: "bg-zinc-400",
    text: "text-zinc-500",
    label: "Draft",
    bg: "bg-zinc-200",
  },
};

export function ProgramListRow({
  program,
  onShareLink,
  onOpen,
  menuHandlers,
}: ProgramListRowProps) {
  const status = STATUS_STYLES[program.status];
  const visibleTags = program.tags.slice(0, 2);

  return (
    <div className="flex items-center gap-4 border-b border-zinc-50">
      {program.logoUrl ? (
        <div className="w-[108px] h-[108px] relative rounded-2xl overflow-hidden">
          <img
            src={program.logoUrl}
            alt={program.title}
            className="h-full w-full shrink-0 rounded-xl object-cover"
          />
        </div>
      ) : (
        <div className="flex w-[108px] h-[108px] shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-400">
          <Icon icon="ph:image" className="h-6 w-6" />
        </div>
      )}

      <div className="min-w-0 flex-1 h-full flex flex-col justify-center">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Icon icon="ph:user-circle" className="h-3.5 w-3.5" />
          <span>{program.teacherName}</span>
          <Icon icon="ph:star-fill" className="h-3 w-3" />
          <span>
            {program.rating} ({program.reviewCount})
          </span>
        </div>
        <p className="truncate text-sm font-semibold text-subtle pt-2 pb-3">
          {program.title}
        </p>
        <div className="flex items-center gap-1.5">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border-2 border-muted/30 px-2 py-0.5 text-xs text-subtle font-medium"
            >
              {tag}
            </span>
          ))}
          {program.extraTagsCount ? (
            <span className="text-xs text-zinc-400">
              +{program.extraTagsCount}
            </span>
          ) : null}
        </div>
      </div>

      <span
        className={`flex shrink-0 items-center gap-1.5 text-sm font-medium border rounded-md px-2 bg-${status.bg} ${status.text}`}
      >
        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
        {status.label}
      </span>

      <div className="shrink-0 text-right px-10">
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm font-semibold text-zinc-900">
            <sup className="text-muted">{program.currency}</sup>
            {program.price}
          </span>
          {program.originalPrice && (
            <span className="text-xs text-muted line-through">
              <sup className="text-muted">{program.currency}</sup>
              {program.originalPrice}
            </span>
          )}
        </div>
        {program.perSubjectPrice && (
          <p className="text-xs">
            (<sup className="text-muted">{program.currency}</sup>
            <span>{program.perSubjectPrice}</span>
            <span className="text-black"> price per subject</span>)
          </p>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onShareLink}
        className="px-3! border-muted/40! shadow-sm! h-[36px]"
        leftIcon={
          <Icon
            icon="ant-design:link-outlined"
            size={16}
            className="text-muted/50"
          />
        }
      >
        Share link
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={() => onOpen?.(program)}
        className="px-3! border-muted/40! shadow-sm! h-[36px]"
        leftIcon={
          <Icon
            icon="material-symbols:folder-open-outline-sharp"
            size={16}
            className="text-muted/50"
          />
        }
      >
        Open
      </Button>

      <ProgramOptionsMenu {...menuHandlers} />
    </div>
  );
}

function ProgramOptionsMenu({
  onOpenProgram,
  onEditProgram,
  onPublishProgram,
  onMessageTeacher,
  onViewParentProgram,
  onDeleteProgram,
  hideViewParentProgram = false,
}: ProgramOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const items: MenuItemConfig[] = [
    {
      key: "open",
      icon: "mdi:bookshelf",
      label: "Open program",
      onClick: onOpenProgram,
    },
    {
      key: "edit",
      icon: "ph:seal-check",
      label: "Edit program",
      onClick: onEditProgram,
    },
    {
      key: "publish",
      icon: "ph:cloud",
      label: "Publish program",
      onClick: onPublishProgram,
    },
    {
      key: "message",
      icon: "ri:mail-send-line",
      label: "Message teacher",
      onClick: onMessageTeacher,
    },
    ...(hideViewParentProgram
      ? []
      : [
          {
            key: "parent",
            icon: "ri:guide-line",
            label: "View parent program",
            onClick: onViewParentProgram,
          } as MenuItemConfig,
        ]),
    {
      key: "delete",
      icon: "ph:trash",
      label: "Delete program",
      onClick: onDeleteProgram,
      danger: true,
    },
  ];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 transition-colors border border-muted/30 shadow-sm"
      >
        <Icon icon="ph:dots-three-vertical-bold" className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{opacity: 0, y: -8, scale: 0.97}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, y: -8, scale: 0.97}}
            transition={{duration: 0.15, ease: [0.22, 1, 0.36, 1]}}
            className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-zinc-100 bg-white p-3 shadow-xl"
          >
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left text-base transition-colors hover:bg-zinc-50 ${
                  item.danger ? "text-danger" : "text-zinc-900"
                }`}
              >
                <Icon
                  icon={item.icon}
                  className={`h-5 w-5 ${item.danger ? "text-danger" : "text-zinc-500"}`}
                />
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
