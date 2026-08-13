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

interface MethodBadge {
  type: "badge";
  label: string;
}

interface MethodCourse {
  type: "course";
  thumbnailLabel: string;
  title: string;
  subtitle: string;
}

type Method = MethodBadge | MethodCourse;

export interface ProspectiveStudent {
  id: string;
  name: string;
  email: string;
  dateJoined: string;
  time: string;
  method: Method;
}

interface ProspectiveStudentsTableProps {
  onOpenProfile?: (student: ProspectiveStudent) => void;
  onOnboardStudent?: (student: ProspectiveStudent) => void;
  onMessageStudent?: (student: ProspectiveStudent) => void;
  onAssignCra?: (student: ProspectiveStudent) => void;
  onRejectStudent?: (student: ProspectiveStudent) => void;
}

const STUDENTS: ProspectiveStudent[] = [
  {
    id: "1",
    name: "Bright Mba",
    email: "bright@gmail.com",
    dateJoined: "05 Apr, 2026",
    time: "8:30 PM",
    method: {type: "badge", label: "Free Exam program"},
  },
  {
    id: "2",
    name: "Bright Mba",
    email: "bright@gmail.com",
    dateJoined: "05 Apr, 2026",
    time: "8:30 PM",
    method: {
      type: "course",
      thumbnailLabel: "PT",
      title: "Pilates Teacher Training Certification 20…",
      subtitle: "Moderate level.",
    },
  },
  {
    id: "3",
    name: "Bright Mba",
    email: "bright@gmail.com",
    dateJoined: "05 Apr, 2026",
    time: "8:30 PM",
    method: {type: "badge", label: "Free Exam program"},
  },
  {
    id: "4",
    name: "Bright Mba",
    email: "bright@gmail.com",
    dateJoined: "05 Apr, 2026",
    time: "8:30 PM",
    method: {
      type: "course",
      thumbnailLabel: "W",
      title: "West African Examination Council - WAEC",
      subtitle: "English, Maths, Physics & 3 more…",
    },
  },
  {
    id: "5",
    name: "Bright Mba",
    email: "bright@gmail.com",
    dateJoined: "05 Apr, 2026",
    time: "8:30 PM",
    method: {type: "badge", label: "Free Exam program"},
  },
  {
    id: "6",
    name: "Bright Mba",
    email: "bright@gmail.com",
    dateJoined: "05 Apr, 2026",
    time: "8:30 PM",
    method: {
      type: "course",
      thumbnailLabel: "W",
      title: "West African Examination Council - WAEC",
      subtitle: "English, Maths, Physics & 3 more…",
    },
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

function colorFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function NameCell({student}: {student: ProspectiveStudent}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${colorFor(
          student.name,
        )}`}
      >
        {initialsFor(student.name)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900">{student.name}</p>
        <p className="text-xs text-gray-500">{student.email}</p>
      </div>
    </div>
  );
}

function MethodCell({method}: {method: Method}) {
  if (method.type === "badge") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {method.label}
      </span>
    );
  }
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-md overflow-hidden bg-gray-100 shrink-0 flex items-center justify-center text-gray-400 text-[10px] font-medium">
        {method.thumbnailLabel}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate max-w-55">
          {method.title}
        </p>
        <p className="text-xs text-gray-500 truncate max-w-55">
          {method.subtitle}
        </p>
      </div>
    </div>
  );
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  danger: boolean;
  action?: (student: ProspectiveStudent) => void;
}

const MENU_WIDTH = 224; // w-56
const MENU_GAP = 8;

function ActionsMenuPortal({
  student,
  triggerRef,
  onClose,
  onOpenProfile,
  onOnboardStudent,
  onMessageStudent,
  onAssignCra,
  onRejectStudent,
}: {
  student: ProspectiveStudent;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onOpenProfile?: (student: ProspectiveStudent) => void;
  onOnboardStudent?: (student: ProspectiveStudent) => void;
  onMessageStudent?: (student: ProspectiveStudent) => void;
  onAssignCra?: (student: ProspectiveStudent) => void;
  onRejectStudent?: (student: ProspectiveStudent) => void;
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
      id: "onboard",
      label: "Onboard student",
      icon: "lucide:user-plus",
      danger: false,
      action: onOnboardStudent,
    },
    {
      id: "message",
      label: "Message student",
      icon: "lucide:mail",
      danger: false,
      action: onMessageStudent,
    },
    {
      id: "assign-cra",
      label: "Assign CRA",
      icon: "lucide:git-branch",
      danger: false,
      action: onAssignCra,
    },
    {
      id: "reject",
      label: "Reject Student",
      icon: "lucide:user-x",
      danger: true,
      action: onRejectStudent,
    },
  ];

  useLayoutEffect(() => {
    function updatePosition() {
      const rect = triggerRef.current?.getBoundingClientRect();
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
  onOnboardStudent,
  onMessageStudent,
  onAssignCra,
  onRejectStudent,
}: {
  student: ProspectiveStudent;
  onOpenProfile?: (student: ProspectiveStudent) => void;
  onOnboardStudent?: (student: ProspectiveStudent) => void;
  onMessageStudent?: (student: ProspectiveStudent) => void;
  onAssignCra?: (student: ProspectiveStudent) => void;
  onRejectStudent?: (student: ProspectiveStudent) => void;
}) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  return (
    <div className="inline-flex items-center justify-end gap-2 shrink-0 w-full">
      <button
        onClick={() => onOpenProfile?.(student)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Icon icon="lucide:external-link" size={15} />
        Open
      </button>
      <button
        onClick={() => onMessageStudent?.(student)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3.5 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <Icon icon="lucide:mail" size={15} />
        Message
      </button>
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
          onOnboardStudent={onOnboardStudent}
          onMessageStudent={onMessageStudent}
          onAssignCra={onAssignCra}
          onRejectStudent={onRejectStudent}
        />
      )}
    </div>
  );
}

const columnHelper = createColumnHelper<ProspectiveStudent>();

export default function ProspectiveStudentsTable({
  onOpenProfile,
  onOnboardStudent,
  onMessageStudent,
  onAssignCra,
  onRejectStudent,
}: ProspectiveStudentsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <NameCell student={info.row.original} />,
      }),
      columnHelper.accessor("dateJoined", {
        header: "Date joined",
        cell: (info) => (
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {info.getValue()}
            <span className="text-gray-300 mx-1">|</span>
            {info.row.original.time}
          </span>
        ),
      }),
      columnHelper.accessor("method", {
        header: "Method",
        cell: (info) => <MethodCell method={info.getValue()} />,
      }),
      columnHelper.display({
        id: "actions",
        header: () => <span className="block w-full text-right">Actions</span>,
        cell: (info) => (
          <ActionsCell
            student={info.row.original}
            onOpenProfile={onOpenProfile}
            onOnboardStudent={onOnboardStudent}
            onMessageStudent={onMessageStudent}
            onAssignCra={onAssignCra}
            onRejectStudent={onRejectStudent}
          />
        ),
      }),
    ],
    [
      onOpenProfile,
      onOnboardStudent,
      onMessageStudent,
      onAssignCra,
      onRejectStudent,
    ],
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
