import {useMemo, useRef, useState, useEffect, useLayoutEffect} from "react";
import {createPortal} from "react-dom";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import {Icon} from "@mcc/ui";
import EnhancedTable from "@/src/components/Table";
import {LeaderboardTier, Teacher} from "../types/types";
import {useAdminTeachers} from "../hooks/useAdminTeachers";

interface TeachersTableProps {
  onOpenProfile?: (teacher: Teacher) => void;
  onMessageTeacher?: (teacher: Teacher) => void;
  onDisableTeacher?: (teacher: Teacher) => void;
  onAssignProgram?: (teacher: Teacher) => void;
  onAssignCra?: (teacher: Teacher) => void;
}

const AVATAR_COLORS = [
  "bg-rose-100 text-rose-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-sky-100 text-sky-600",
  "bg-violet-100 text-violet-600",
];

function initialsFor(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++)
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function NameCell({teacher}: {teacher: Teacher}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden ${colorFor(
          teacher.name,
        )}`}
      >
        {teacher.avatar ? (
          <img src={teacher.avatar} className="w-full h-full object-cover" />
        ) : (
          initialsFor(teacher.name)
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{teacher.name}</p>
        <p className="text-xs text-gray-500">{teacher.email}</p>
      </div>
    </div>
  );
}

function ProgramThumbnail({label}: {label: string}) {
  return (
    <div
      className={`w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-[11px] font-semibold ${colorFor(
        label,
      )}`}
    >
      {label}
    </div>
  );
}

const POPOVER_WIDTH = 340;
const POPOVER_GAP = 8;

function ProgramsPopover({
  teacher,
  triggerRef,
  onClose,
}: {
  teacher: Teacher;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{top: number; left: number} | null>(
    null,
  );

  useLayoutEffect(() => {
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(rect.left, window.innerWidth - POPOVER_WIDTH - 8);
      setPosition({top: rect.bottom + POPOVER_GAP, left: Math.max(8, left)});
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [triggerRef]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (popoverRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, triggerRef]);

  if (!position) return null;

  return createPortal(
    <div
      ref={popoverRef}
      style={{top: position.top, left: position.left, width: POPOVER_WIDTH}}
      className="fixed rounded-xl border border-gray-200 bg-white p-4 shadow-lg shadow-gray-200/60 z-50"
    >
      <p className="text-xs text-gray-500 mb-3">
        All programs {teacher.name.split(" ")[0]} has enrolled in. (
        {teacher.programs.length})
      </p>
      <div className="flex flex-col gap-3">
        {teacher.programs.map((program) => (
          <div key={program.id} className="flex items-start gap-2.5">
            <ProgramThumbnail label={program.thumbnailLabel} />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {program.title}
              </p>
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                {program.subtitle.includes("level") && (
                  <Icon icon="lucide:info" size={12} />
                )}
                {program.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>,
    document.body,
  );
}

function ProgramCell({teacher}: {teacher: Teacher}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const primary = teacher.programs[0];
  const extraCount = teacher.programs.length - 1;

  return (
    <div className="min-w-0">
      <div className="flex items-start gap-2.5">
        <ProgramThumbnail label={primary.thumbnailLabel} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate max-w-55">
            {primary.title}
          </p>
          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
            {primary.subtitle.includes("level") && (
              <Icon icon="lucide:info" size={12} />
            )}
            {primary.subtitle}
          </p>
        </div>
      </div>

      {extraCount > 0 && (
        <button
          ref={triggerRef}
          onClick={() => setOpen((o) => !o)}
          className="mt-2 inline-flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Icon
            icon={open ? "lucide:chevron-up" : "lucide:chevron-down"}
            size={12}
          />
          {extraCount} more program{extraCount > 1 ? "s" : ""}
        </button>
      )}

      {open && (
        <ProgramsPopover
          teacher={teacher}
          triggerRef={triggerRef}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

function leaderboardTier(rank: number): LeaderboardTier {
  if (rank === 1) return "gold";
  if (rank === 2) return "silver";
  if (rank === 3) return "bronze";
  return "standard";
}

const TIER_STYLES: Record<LeaderboardTier, string> = {
  gold: "bg-violet-600 text-white",
  silver: "bg-amber-500 text-white",
  bronze: "bg-teal-500 text-white",
  standard: "bg-gray-700 text-white",
};

function LeaderboardBadge({rank}: {rank: number}) {
  const tier = leaderboardTier(rank);
  return (
    <div
      className={`w-9 h-10 flex items-start justify-center pt-1.5 text-xs font-bold ${TIER_STYLES[tier]}`}
      style={{clipPath: "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)"}}
    >
      #{rank}
    </div>
  );
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  danger: boolean;
  action?: (teacher: Teacher) => void;
}

const MENU_WIDTH = 200;
const MENU_GAP = 8;

function ActionsMenuPortal({
  teacher,
  triggerRef,
  onClose,
  onOpenProfile,
  onMessageTeacher,
  onDisableTeacher,
  onAssignProgram,
  onAssignCra,
}: {
  teacher: Teacher;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onOpenProfile?: (teacher: Teacher) => void;
  onMessageTeacher?: (teacher: Teacher) => void;
  onDisableTeacher?: (teacher: Teacher) => void;
  onAssignProgram?: (teacher: Teacher) => void;
  onAssignCra?: (teacher: Teacher) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{top: number; left: number} | null>(
    null,
  );

  const menuItems: MenuItem[] = [
    {
      id: "open-profile",
      label: "Open profile",
      icon: "lucide:smile",
      danger: false,
      action: onOpenProfile,
    },
    {
      id: "assign-program",
      label: "Assign Program",
      icon: "ri:user-follow-line",
      danger: false,
      action: onAssignProgram,
    },
    {
      id: "message",
      label: "Message teacher",
      icon: "lucide:mail",
      danger: false,
      action: onMessageTeacher,
    },
    {
      id: "crm",
      label: "Assign CRA",
      icon: "ri:user-forbid-line",
      danger: false,
      action: onAssignCra,
    },
    {
      id: "disable",
      label: "Disable Teacher",
      icon: "ri:user-forbid-line",
      danger: true,
      action: onDisableTeacher,
    },
  ];

  useLayoutEffect(() => {
    function updatePosition() {
      const rect = triggerRef?.current?.getBoundingClientRect();
      if (!rect) return;
      const left = Math.min(
        rect.right - MENU_WIDTH,
        window.innerWidth - MENU_WIDTH - 8,
      );
      setPosition({top: rect.bottom + MENU_GAP, left: Math.max(8, left)});
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [triggerRef]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (triggerRef?.current?.contains(target)) return;
      onClose();
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [onClose, triggerRef]);

  if (!position) return null;

  return createPortal(
    <div
      ref={menuRef}
      style={{top: position.top, left: position.left, width: MENU_WIDTH}}
      className="fixed rounded-xl border border-gray-200 bg-white py-1.5 shadow-lg shadow-gray-200/60 z-50"
    >
      {menuItems.map((item) => (
        <button
          key={item.id}
          onClick={() => {
            item.action?.(teacher);
            onClose();
          }}
          className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-left transition-colors ${
            item.danger
              ? "text-red-600 hover:bg-red-50"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          <Icon icon={item.icon} size={16} />
          {item.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

function ActionsCell({
  teacher,
  onOpenProfile,
  onMessageTeacher,
  onDisableTeacher,
  onAssignProgram,
  onAssignCra,
}: {
  teacher: Teacher;
  onOpenProfile?: (teacher: Teacher) => void;
  onMessageTeacher?: (teacher: Teacher) => void;
  onDisableTeacher?: (teacher: Teacher) => void;
  onAssignProgram?: (teacher: Teacher) => void;
  onAssignCra?: (teacher: Teacher) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-center w-full">
      <button
        ref={triggerRef}
        onClick={() => setOpen((o) => !o)}
        aria-label="More actions"
        aria-expanded={open}
        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <Icon icon="lucide:more-vertical" size={16} />
      </button>

      {open && (
        <ActionsMenuPortal
          teacher={teacher}
          triggerRef={triggerRef}
          onClose={() => setOpen(false)}
          onOpenProfile={onOpenProfile}
          onMessageTeacher={onMessageTeacher}
          onDisableTeacher={onDisableTeacher}
          onAssignProgram={onAssignProgram}
          onAssignCra={onAssignCra}
        />
      )}
    </div>
  );
}

const columnHelper = createColumnHelper<Teacher>();

export default function TeachersTable({
  onOpenProfile,
  onAssignProgram,
  onMessageTeacher,
  onAssignCra,
  onDisableTeacher,
}: TeachersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const {teachers, isLoading} = useAdminTeachers();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name of Teacher",
        enableSorting: false,
        cell: (info) => <NameCell teacher={info.row.original} />,
      }),
      columnHelper.accessor((row) => row.programs[0]?.title ?? "", {
        id: "programs",
        header: "Programs ",
        cell: (info) => <ProgramCell teacher={info.row.original} />,
      }),
      columnHelper.accessor("dateJoined", {
        header: "Date joined",

        cell: (info) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("sessions", {
        header: "No of sessions",

        cell: (info) => {
          const {total, completed} = info.row.original.sessions;
          return (
            <span className="text-sm text-gray-600 whitespace-nowrap">
              {completed != null ? (
                <>
                  <span className="text-black font-medium">
                    Completed {completed}
                  </span>
                  <sub>/{total}</sub>
                </>
              ) : (
                <span className="text-black font-medium">{total}</span>
              )}
            </span>
          );
        },
      }),
      columnHelper.accessor("rank", {
        header: "L. Board",

        cell: (info) => <LeaderboardBadge rank={info.getValue()} />,
      }),
      columnHelper.accessor("rating", {
        header: "Ratings",

        cell: (info) => (
          <div className="flex items-center gap-2">
            <Icon
              icon="material-symbols:star-rounded"
              className="text-green-500"
            />
            <span className="text-gray-600 whitespace-nowrap">
              {info.getValue()}
            </span>
          </div>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: (info) => (
          <ActionsCell
            teacher={info.row.original}
            onOpenProfile={onOpenProfile}
            onMessageTeacher={onMessageTeacher}
            onDisableTeacher={onDisableTeacher}
            onAssignProgram={onAssignProgram}
            onAssignCra={onAssignCra}
          />
        ),
      }),
    ],
    [
      onOpenProfile,
      onMessageTeacher,
      onDisableTeacher,
      onAssignProgram,
      onAssignCra,
    ],
  );

  const table = useReactTable({
    data: teachers,
    columns,
    state: {sorting},
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) {
    return <p className="py-10 text-center text-sm text-gray-400">Loading teachers…</p>;
  }

  if (teachers.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-400">No teachers yet.</p>;
  }

  return <EnhancedTable table={table} enableSelection className="min-w-full" />;
}
