"use client";

import {useEffect, useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import RescheduleClass from "./ResheduleSession";

type CallStatus = "completed" | "upcoming";
type ActionVariant = "replay" | "share" | "countdown";

type CallRowData = {
  id: string;
  studentName: string;
  hostName: string;
  studentAvatar?: string;
  hostAvatar?: string;
  subject: string;
  time: string;
  type: "Exam" | "Course";
  status: CallStatus;
  action: ActionVariant;
  countdownSeconds?: number;
};

const CALLS: CallRowData[] = [
  {
    id: "1",
    studentName: "Emmanuel",
    hostName: "Mo",
    subject: "Maths: Algebra",
    time: "09:45 PM",
    type: "Exam",
    status: "completed",
    action: "replay",
  },
  {
    id: "2",
    studentName: "Emmanuel",
    hostName: "Mo",
    subject: "Maths: Algebra",
    time: "12:45 PM",
    type: "Exam",
    status: "upcoming",
    action: "share",
  },
  {
    id: "3",
    studentName: "Misturah",
    hostName: "Mo",
    subject: "Pilates: Introduction",
    time: "12:45 PM",
    type: "Course",
    status: "upcoming",
    action: "share",
  },
  {
    id: "4",
    studentName: "Emmanuel",
    hostName: "Mo",
    subject: "Maths: Algebra",
    time: "12:45 PM",
    type: "Exam",
    status: "upcoming",
    action: "countdown",
    countdownSeconds: 12 * 3600 + 40 * 60 + 59,
  },
];

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function Avatar({
  src,
  fallback,
  className = "",
}: {
  src?: string;
  fallback: string;
  className?: string;
}) {
  if (src) {
    return (
      <img src={src} alt={fallback} className={`object-cover ${className}`} />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-600 text-[10px] font-medium ${className}`}
    >
      {fallback.slice(0, 1)}
    </div>
  );
}

function TypeTag({type}: {type: "Exam" | "Course"}) {
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
      {type}
    </span>
  );
}

function StatusTag({status}: {status: CallStatus}) {
  if (status === "completed") {
    return (
      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
        Call completed
      </span>
    );
  }
  return (
    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
      Upcoming call
    </span>
  );
}

function OutlinePillButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors"
    >
      <Icon icon={icon} size={15} />
      {label}
    </button>
  );
}

function CountdownButton({seconds}: {seconds: number}) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const interval = setInterval(() => {
      setRemaining((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [remaining]);

  return (
    <span className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-200 text-sm font-medium text-gray-800 tabular-nums">
      <Icon icon="mdi:clock-outline" size={15} />
      {formatCountdown(remaining)}
    </span>
  );
}

function RowMenu({
  onReschedule,
  onCancel,
}: {
  onReschedule?: () => void;
  onCancel?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
        aria-label="More options"
      >
        <Icon icon="mdi:dots-vertical" size={18} />
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-10 w-48 bg-white border border-gray-100 rounded-xl shadow-lg py-1">
          <button
            type="button"
            onClick={() => {
              onReschedule?.();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:calendar-refresh-outline" size={16} />
            Reschedule class
          </button>
          <button
            type="button"
            onClick={() => {
              onCancel?.();
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-gray-800 hover:bg-gray-50 transition-colors"
          >
            <Icon icon="mdi:calendar-remove-outline" size={16} />
            Cancel class
          </button>
        </div>
      )}
    </div>
  );
}
type CallRowProps = {
  call: CallRowData;
  onReplay?: (call: CallRowData) => void;
  onShare?: (call: CallRowData) => void;
  onMessage?: (call: CallRowData) => void;
  onReschedule?: (call: CallRowData) => void;
  onCancel?: (call: CallRowData) => void;
};

function CallRow({
  call,
  onReplay,
  onShare,
  onMessage,
  onReschedule,
  onCancel,
}: CallRowProps) {
  return (
    <div className="flex items-center justify-between py-4 gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <div className="relative w-11 h-11 shrink-0">
          <Avatar
            src={call.studentAvatar}
            fallback={call.studentName}
            className="w-9 h-9 rounded-full absolute top-0 left-0 border-2 border-white"
          />
          <Avatar
            src={call.hostAvatar}
            fallback={call.hostName}
            className="w-6 h-6 rounded-full absolute bottom-0 right-0 border-2 border-white"
          />
        </div>

        <div className="min-w-0">
          <div className="text-sm text-gray-900">
            <span className="font-semibold">{call.studentName}</span>{" "}
            <span className="text-gray-400 font-normal">x</span>{" "}
            <span className="font-semibold">{call.hostName}</span>
          </div>
          <div className="text-xs text-gray-400 mt-0.5">
            {call.subject} · {call.time}
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <TypeTag type={call.type} />
        <StatusTag status={call.status} />
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {call.action === "replay" && (
          <button
            type="button"
            onClick={() => onReplay?.(call)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors"
          >
            <Icon icon="mdi:play" size={14} />
            View replay
          </button>
        )}
        {call.action === "share" && (
          <OutlinePillButton
            icon="mdi:link-variant"
            label="Share link"
            onClick={() => onShare?.(call)}
          />
        )}
        {call.action === "countdown" && (
          <CountdownButton seconds={call.countdownSeconds ?? 0} />
        )}

        <OutlinePillButton
          icon="mdi:email-outline"
          label="message"
          onClick={() => onMessage?.(call)}
        />
        <RowMenu
          onReschedule={() => onReschedule?.(call)}
          onCancel={() => onCancel?.(call)}
        />
      </div>
    </div>
  );
}

export default function SessionCallsList({
  onReplay,
  onShare,
  onMessage,
  onReschedule,
  onCancel,
}: SessionCallsListProps) {
  const [rescheduleCall, setRescheduleCall] = useState<CallRowData | null>(
    null,
  );
  const [cancelCall, setCancelCall] = useState<CallRowData | null>(null);
  const [shareCall, setShareCall] = useState<CallRowData | null>(null);
  const [messageCall, setMessageCall] = useState<CallRowData | null>(null);
  const [replayCall, setReplayCall] = useState<CallRowData | null>(null);
  return (
    <div className="w-full bg-white pt-10">
      <h2 className="text-base font-semibold text-gray-900">
        {CALLS.length > 0
          ? "323 calls happening this week!"
          : "No calls this week"}
      </h2>
      <p className="text-sm text-gray-400 mt-0.5">
        Reach out to your students to help them prepare
      </p>

      <div className="mt-4 divide-y divide-gray-100">
        {CALLS.map((call) => {
          return (
            <>
              <CallRow
                key={call.id}
                call={call}
                onReplay={onReplay}
                onShare={onShare}
                onMessage={onMessage}
                onReschedule={(call) => setRescheduleCall(call)}
                onCancel={onCancel}
              />
            </>
          );
        })}
      </div>
      <RescheduleClass
        open={!!rescheduleCall}
        onCancel={() => setRescheduleCall(null)}
        onConfirm={(selection) => {
          onReschedule?.(rescheduleCall!, selection);
          setRescheduleCall(null);
        }}
      />
    </div>
  );
}

type SessionCallsListProps = {
  onReplay?: (call: CallRowData) => void;
  onShare?: (call: CallRowData) => void;
  onMessage?: (call: CallRowData) => void;
  onCancel?: (call: CallRowData) => void;
  onReschedule?: (
    call: CallRowData,
    selection: {
      date: string;
      time: string;
    },
  ) => void;
};
