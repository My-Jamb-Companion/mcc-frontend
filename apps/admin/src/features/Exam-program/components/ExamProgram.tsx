"use client";

import {Button} from "@/src/components/Buttons";
import TabbedButton from "@/src/components/TabbedButton";
import {FormInputs} from "@mcc/features";
import {AnimatePresence, motion, Icon, showError, showSuccess} from "@mcc/ui";
import {useEffect, useMemo, useRef, useState} from "react";
import {ProgramList} from "./Programslist";
import {useExamPrograms} from "../hooks/useExamPrograms";
import ShareSessionLink from "@/src/components/Modals/ShareLink";
import {ProgramListRowData} from "./ProgramRow";
import {useRouter} from "next/navigation";
import {useTeachers} from "@mcc/features";
import {useDebouncedValue} from "@/src/features/students/hooks/useDebouncedValue";
import {ListTab, resultsLabel, toListParams} from "../helper/listParams";
import {
  deleteExamProgram,
  getApiErrorMessage,
  publishExamProgram,
  unpublishExamProgram,
} from "../services/exam.service";

export default function ExamProgram() {
  const [active, setActive] = useState<ListTab>("published");
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);
  const {
    programs,
    meta,
    isLoading: isLoadingPrograms,
    isError: isProgramsError,
    refetch: refetchPrograms,
  } = useExamPrograms(
    toListParams({
      tab: active,
      search: debouncedSearch,
      teacherId: teachers[0]?.id,
      page,
    }),
  );
  const [open, setOpen] = useState(false);
  const [shareTarget, setShareTarget] = useState<ProgramListRowData | null>(
    null,
  );
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {data: teacherData = []} = useTeachers();
  const allTeachers = useMemo<TeacherOption[]>(
    () =>
      teacherData.map((t) => ({
        id: t.teacher_id || t.id || t.email,
        name: t.teacher_name || t.name || t.email,
        avatarUrl: t.avatar_url,
      })),
    [teacherData],
  );

  // Every filter change starts again from the first page.
  const changeTab = (tab: string) => {
    setActive(tab as ListTab);
    setPage(1);
  };
  const changeTeachers = (next: TeacherOption[]) => {
    setTeachers(next);
    setPage(1);
  };
  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <section className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Exam program</h1>
        <div ref={ref} className="relative">
          <Button
            width="fit"
            className="p-2! pr-4!"
            leftIcon={<Icon icon="line-md:plus" />}
            onClick={() => setOpen(!open)}
          >
            <p>Create Program</p>
          </Button>
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{opacity: 0, y: -8, scale: 0.97}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, y: -8, scale: 0.97}}
                transition={{duration: 0.15, ease: [0.22, 1, 0.36, 1]}}
                className="absolute right-0 top-full z-20 mt-2 w-64 rounded-2xl border border-muted/30 bg-white p-3 shadow-xl"
              >
                {[
                  {label: "Exam program", icon: "mdi:bookshelf"},
                  {
                    label: "Course",
                    icon: "material-symbols-light:book-outline",
                  },
                ].map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      // item.onClick?.();
                      if (item.label === "Exam program") {
                        router.push("/dashboard/exam-program/create-program");
                      } else {
                        router.push("/dashboard/courses/create-course");
                      }
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-4 rounded-lg px-2 py-2.5 text-left text-base transition-colors hover:bg-zinc-50 text-subtle`}
                  >
                    <Icon
                      icon={item.icon}
                      className={`h-5 w-5 text-zinc-500 `}
                    />
                    {item.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-col h-full border border-muted/20 rounded-2xl px-6 py-8 ">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3 ">
            <TabbedButton
              tabs={[
                {key: "published", label: "Published", icon: "ri:cloudy-line"},
                {key: "drafts", label: "Drafts", icon: "ic:round-cloud-off"},
              ]}
              active={active}
              onChange={changeTab}
            />

            <TeacherMultiSelect
              teachers={allTeachers}
              value={teachers}
              onChange={changeTeachers}
            />
          </div>

          <div className="w-full max-w-[20%]">
            <FormInputs
              placeholder="Search for conversation/program"
              type="text"
              icon={<Icon icon="ri:search-line" size={18} />}
              value={search}
              onChange={changeSearch}
              inputClassName=" rounded-full! shadow-sm border-muted/30"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 flex items-center justify-center pt-10 overflow-y-auto">
          {isLoadingPrograms ? (
            <p className="text-sm text-muted">Loading exam programs…</p>
          ) : isProgramsError ? (
            <p className="text-sm text-red-600">
              Failed to load exam programs. Please try again.
            </p>
          ) : (
            <ProgramList
              program={programs}
              onOpen={(program) => {
                router.push(
                  `/dashboard/exam-program/${program.examType}?id=${program.id}`,
                );
              }}
              onShareLink={(id) => {
                const target = programs.find((p) => p.id === id);
                if (target) setShareTarget(target);
              }}
              onEditProgram={(id) => {
                router.push(`/dashboard/exam-program/edit-program?id=${id}`);
              }}
              onPublishProgram={async (id) => {
                const target = programs.find((p) => p.id === id);
                if (!target) return;
                try {
                  if (target.status === "draft") {
                    await publishExamProgram(id);
                    showSuccess("Exam program published successfully!");
                  } else {
                    await unpublishExamProgram(id);
                    showSuccess("Exam program moved back to drafts.");
                  }
                  refetchPrograms();
                } catch (err) {
                  showError(
                    getApiErrorMessage(
                      err,
                      "Failed to update exam program status. Please try again.",
                    ),
                  );
                }
              }}
              onDeleteProgram={async (id) => {
                try {
                  await deleteExamProgram(id);
                  showSuccess("Exam program deleted.");
                  refetchPrograms();
                } catch (err) {
                  showError(
                    getApiErrorMessage(
                      err,
                      "Failed to delete exam program. Please try again.",
                    ),
                  );
                }
              }}
            />
          )}
        </div>

        <div className="flex justify-end w-full mt-4 gap-4">
          <span className="flex items-center gap-2 text-sm text-muted">
            {resultsLabel(meta)}
          </span>
          <Button
            variant="secondary"
            radius="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </Button>
          <Button
            variant="secondary"
            radius="sm"
            disabled={!meta || page >= meta.total_pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>

      <ShareSessionLink
        key={shareTarget?.link}
        open={shareTarget !== null}
        link={shareTarget?.link}
        onCancel={() => setShareTarget(null)}
        onSendLink={({recipient: _recipient, link: _link}) => {
          // call your actual "send link to recipient" API here
          setShareTarget(null);
        }}
      />
    </section>
  );
}
function TeacherMultiSelect({
  teachers,
  value,
  onChange,
  placeholder = "Select teacher",
}: TeacherMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const results = useMemo(
    () =>
      teachers.filter((t) =>
        (t.name ?? "").toLowerCase().includes(query.toLowerCase()),
      ),
    [teachers, query],
  );

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSelected = (id: string) => value.some((t) => t.id === id);

  // The list is filtered by one teacher at a time (the API takes a single teacher_id).
  const toggle = (teacher: TeacherOption) => {
    onChange(isSelected(teacher.id) ? [] : [teacher]);
    setOpen(false);
  };
  function triggerLabel(value: TeacherOption[], placeholder: string) {
    if (value.length === 0) return placeholder;
    return value[0].name;
  }
  return (
    <div ref={ref} className="relative w-full max-w-xs">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-2 rounded-full border bg-white text-sm text-left outline-none transition-colors
          ${open ? "border-primary ring-2 ring-primary/20" : "border-gray-200"}`}
      >
        <span
          className={`truncate ${value.length > 0 ? "text-gray-900 font-medium" : "text-gray-400"}`}
        >
          {triggerLabel(value, placeholder)}
        </span>
        <Icon
          icon="mdi:chevron-down"
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-10 w-72 bg-white border border-gray-100 rounded-2xl shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
            <Icon
              icon="mdi:magnify"
              className="h-4 w-4 shrink-0 text-gray-400"
            />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="w-full text-sm outline-none placeholder:text-gray-400"
            />
          </div>

          <ul className="max-h-64 overflow-y-auto py-1">
            {results.map((teacher) => {
              const selected = isSelected(teacher.id);
              return (
                <li key={teacher.id}>
                  <button
                    type="button"
                    onClick={() => toggle(teacher)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    {teacher.avatarUrl ? (
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.name}
                        className="h-8 w-8 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                        {teacher.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                    )}
                    <span className="flex-1 text-left truncate">
                      {teacher.name}
                    </span>
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors
                        ${selected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"}`}
                    >
                      {selected && (
                        <Icon
                          icon="mdi:check"
                          className="h-3.5 w-3.5 text-white"
                        />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
            {results.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-gray-400">
                No results found
              </li>
            )}
          </ul>

          <button
            type="button"
            onClick={() => onChange([])}
            disabled={value.length === 0}
            className="w-full border-t border-gray-100 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 disabled:text-gray-300 disabled:hover:bg-transparent transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}

interface TeacherOption {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface TeacherMultiSelectProps {
  teachers: TeacherOption[];
  value: TeacherOption[];
  onChange: (teachers: TeacherOption[]) => void;
  placeholder?: string;
}
