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

interface Program {
  id: string;
  thumbnailLabel: string;
  title: string;
  subtitle: string;
}

type LeaderboardTier = "gold" | "silver" | "bronze" | "standard";

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar: string;
  programs: Program[];
  dateJoined: string;
  dateJoinedTime: string;
  dateOnboarded: string;
  dateOnboardedTime: string;
  rank: number;
  location: string;
}

interface ActiveTableProps {
  onOpenProfile?: (student: Student) => void;
  onMessageStudent?: (student: Student) => void;
  onDisableStudent?: (student: Student) => void;
}

const STUDENTS: Student[] = [
  {
    id: "1",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatar: "https://i.pravatar.cc/300?img=35",
    programs: [
      {
        id: "p1",
        thumbnailLabel: "U",
        title: "Universal Tertiary Matriculation Exam…",
        subtitle: "Use of English, Maths, & Physics",
      },
      {
        id: "p2",
        thumbnailLabel: "W",
        title: "West African Examination Council - WAEC",
        subtitle: "English, Maths, Physics & 3 more…",
      },
    ],
    dateJoined: "05 Apr, 2026",
    dateJoinedTime: "8:30 PM",
    dateOnboarded: "05 Apr, 2026",
    dateOnboardedTime: "8:30 PM",
    rank: 1,
    location: "Lagos, NG.",
  },
  {
    id: "2",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatar: "https://i.pravatar.cc/300?img=6",
    programs: [
      {
        id: "p1",
        thumbnailLabel: "PT",
        title: "Pilates Teacher Training Certification 20…",
        subtitle: "Moderate level.",
      },
      {
        id: "p2",
        thumbnailLabel: "W",
        title: "West African Examination Council - WAEC",
        subtitle: "English, Maths, Physics & 3 more…",
      },
      {
        id: "p3",
        thumbnailLabel: "U",
        title: "Universal Tertiary Matriculation Exam…",
        subtitle: "Use of English, Maths, & Physics",
      },
      {
        id: "p4",
        thumbnailLabel: "N",
        title: "National Examination Council - NECO",
        subtitle: "English, Maths, Biology & 2 more…",
      },
      {
        id: "p5",
        thumbnailLabel: "J",
        title: "JAMB CBT Practice Series",
        subtitle: "Full mock exam simulation.",
      },
    ],
    dateJoined: "05 Apr, 2026",
    dateJoinedTime: "8:30 PM",
    dateOnboarded: "05 Apr, 2026",
    dateOnboardedTime: "8:30 PM",
    rank: 21,
    location: "Uyo, NG.",
  },
  {
    id: "3",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatar: "https://i.pravatar.cc/300?img=15",
    programs: [
      {
        id: "p1",
        thumbnailLabel: "PT",
        title: "Pilates Teacher Training Certification 20…",
        subtitle: "Moderate level.",
      },
    ],
    dateJoined: "05 Apr, 2026",
    dateJoinedTime: "8:30 PM",
    dateOnboarded: "05 Apr, 2026",
    dateOnboardedTime: "8:30 PM",
    rank: 8,
    location: "Ibadan, NG.",
  },
  {
    id: "4",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatar: "https://i.pravatar.cc/300?img=2",
    programs: [
      {
        id: "p1",
        thumbnailLabel: "U",
        title: "Universal Tertiary Matriculation Exam…",
        subtitle: "Use of English, Maths, & Physics",
      },
      {
        id: "p2",
        thumbnailLabel: "N",
        title: "National Examination Council - NECO",
        subtitle: "English, Maths, Biology & 2 more…",
      },
    ],
    dateJoined: "05 Apr, 2026",
    dateJoinedTime: "8:30 PM",
    dateOnboarded: "05 Apr, 2026",
    dateOnboardedTime: "8:30 PM",
    rank: 1,
    location: "Lagos, NG.",
  },
  {
    id: "5",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatar: "https://i.pravatar.cc/300?img=7",
    programs: [
      {
        id: "p1",
        thumbnailLabel: "PT",
        title: "Pilates Teacher Training Certification 20…",
        subtitle: "Moderate level.",
      },
    ],
    dateJoined: "05 Apr, 2026",
    dateJoinedTime: "8:30 PM",
    dateOnboarded: "05 Apr, 2026",
    dateOnboardedTime: "8:30 PM",
    rank: 3,
    location: "Enugu, NG.",
  },
  {
    id: "6",
    name: "Bright Mba",
    email: "bright@gmail.com",
    avatar: "https://i.pravatar.cc/300?img=27",
    programs: [
      {
        id: "p1",
        thumbnailLabel: "W",
        title: "West African Examination Council - W…",
        subtitle: "English, Maths, Physics & 2 more…",
      },
      {
        id: "p2",
        thumbnailLabel: "U",
        title: "Universal Tertiary Matriculation Exam…",
        subtitle: "Use of English, Maths, & Physics",
      },
      {
        id: "p3",
        thumbnailLabel: "N",
        title: "National Examination Council - NECO",
        subtitle: "English, Maths, Biology & 2 more…",
      },
      {
        id: "p4",
        thumbnailLabel: "J",
        title: "JAMB CBT Practice Series",
        subtitle: "Full mock exam simulation.",
      },
    ],
    dateJoined: "05 Apr, 2026",
    dateJoinedTime: "8:30 PM",
    dateOnboarded: "05 Apr, 2026",
    dateOnboardedTime: "8:30 PM",
    rank: 12,
    location: "Port H…, NG.",
  },
];

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

function NameCell({student}: {student: Student}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 overflow-hidden ${colorFor(
          student.name,
        )}`}
      >
        {student.avatar ? (
          <img src={student.avatar} className="w-full h-full object-cover" />
        ) : (
          initialsFor(student.name)
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
        <p className="text-xs text-gray-500">{student.email}</p>
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
  student,
  triggerRef,
  onClose,
}: {
  student: Student;
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
        All programs {student.name.split(" ")[0]} has enrolled in. (
        {student.programs.length})
      </p>
      <div className="flex flex-col gap-3">
        {student.programs.map((program) => (
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

function ProgramCell({student}: {student: Student}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const primary = student.programs[0];
  const extraCount = student.programs.length - 1;

  return (
    <div className="min-w-0">
      <div className="flex items-start gap-2.5">
        <ProgramThumbnail label={primary.thumbnailLabel} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate max-w-[220px]">
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
          student={student}
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

function NigeriaFlag() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="shrink-0">
      <circle cx="8" cy="8" r="8" fill="#fff" />
      <rect x="0" y="0" width="5.34" height="16" fill="#0A7F3F" />
      <rect x="10.66" y="0" width="5.34" height="16" fill="#0A7F3F" />
    </svg>
  );
}

function LocationCell({location}: {location: string}) {
  return (
    <div className="flex items-center gap-1.5">
      <NigeriaFlag />
      <span className="text-sm text-gray-700 whitespace-nowrap">
        {location}
      </span>
    </div>
  );
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  danger: boolean;
  action?: (student: Student) => void;
}

const MENU_WIDTH = 200;
const MENU_GAP = 8;

function ActionsMenuPortal({
  student,
  triggerRef,
  onClose,
  onOpenProfile,
  onMessageStudent,
  onDisableStudent,
}: {
  student: Student;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onOpenProfile?: (student: Student) => void;
  onMessageStudent?: (student: Student) => void;
  onDisableStudent?: (student: Student) => void;
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
      id: "message",
      label: "Message student",
      icon: "lucide:mail",
      danger: false,
      action: onMessageStudent,
    },
    {
      id: "disable",
      label: "Disable Student",
      icon: "lucide:user-x",
      danger: true,
      action: onDisableStudent,
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
            item.action?.(student);
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
  student,
  onOpenProfile,
  onMessageStudent,
  onDisableStudent,
}: {
  student: Student;
  onOpenProfile?: (student: Student) => void;
  onMessageStudent?: (student: Student) => void;
  onDisableStudent?: (student: Student) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="flex items-center justify-end w-full">
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
          student={student}
          triggerRef={triggerRef}
          onClose={() => setOpen(false)}
          onOpenProfile={onOpenProfile}
          onMessageStudent={onMessageStudent}
          onDisableStudent={onDisableStudent}
        />
      )}
    </div>
  );
}

const columnHelper = createColumnHelper<Student>();

export default function ActiveTable({
  onOpenProfile,
  onMessageStudent,
  onDisableStudent,
}: ActiveTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        enableSorting: false,
        cell: (info) => <NameCell student={info.row.original} />,
      }),
      columnHelper.accessor((row) => row.programs[0]?.title ?? "", {
        id: "programs",
        header: "Program enrolled",
        cell: (info) => <ProgramCell student={info.row.original} />,
      }),
      columnHelper.accessor("dateJoined", {
        header: "Date joined",
        enableSorting: false,
        cell: (info) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {info.getValue()}
            <span className="text-gray-300 mx-1">|</span>
            {info.row.original.dateJoinedTime}
          </span>
        ),
      }),
      columnHelper.accessor("dateOnboarded", {
        header: "Date onb.",
        enableSorting: false,
        cell: (info) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {info.getValue()}
            <span className="text-gray-300 mx-1">|</span>
            {info.row.original.dateOnboardedTime}
          </span>
        ),
      }),
      columnHelper.accessor("rank", {
        header: "L. Board",
        enableSorting: false,
        cell: (info) => <LeaderboardBadge rank={info.getValue()} />,
      }),
      columnHelper.accessor("location", {
        header: "Location",
        enableSorting: false,
        cell: (info) => <LocationCell location={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: (info) => (
          <ActionsCell
            student={info.row.original}
            onOpenProfile={onOpenProfile}
            onMessageStudent={onMessageStudent}
            onDisableStudent={onDisableStudent}
          />
        ),
      }),
    ],
    [onOpenProfile, onMessageStudent, onDisableStudent],
  );

  const table = useReactTable({
    data: STUDENTS,
    columns,
    state: {sorting},
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return <EnhancedTable table={table} enableSelection className="min-w-full" />;
}
