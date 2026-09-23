import {useEffect, useRef, useState} from "react";
import {AnimatePresence, motion} from "framer-motion";
import Image from "next/image";
import {Button, Icon, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {FormInputs} from "@mcc/features";
import {Teacher} from "../types/types";
import TeacherAvatar from "./TeacherAvatar";
import {useTeacherDetail, useUpdateTeacherProfile} from "../hooks/useAdminTeachers";
import {uploadTeacherAvatar} from "../services/media.service";
import type {
  CoTeacher,
  TeacherDetail,
  TeacherProgram,
  UpcomingSession as ApiUpcomingSession,
} from "../services/teacherPrograms.service";

interface ViewTeacherProps {
  isOpen: boolean;
  teacher: Teacher | null;
  onDisableTeacher: (teacher: Teacher) => void;
  onClose: () => void;
}

export default function ViewTeacher({
  isOpen,
  teacher,
  onClose,
  onDisableTeacher,
}: ViewTeacherProps) {
  // Optional: Close on Escape key press
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const {data: detail, isLoading: isLoadingDetail, isError: isDetailError} = useTeacherDetail(
    isOpen ? teacher?.id : undefined,
  );
  const updateProfile = useUpdateTeacherProfile(teacher?.id);

  const [isEditing, setIsEditing] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // A different teacher was opened -- don't carry over the last one's edit
  // state. Adjusted during render (React's documented pattern for "reset
  // state when a prop changes") rather than in an effect, which would cost
  // an extra render on every open.
  const [lastTeacherId, setLastTeacherId] = useState(teacher?.id);
  if (teacher?.id !== lastTeacherId) {
    setLastTeacherId(teacher?.id);
    setIsEditing(false);
  }

  const name = detail?.teacher_name || teacher?.name || "";
  const avatarUrl = detail?.avatar_url || teacher?.avatar || "";
  // The list row's rating is "—" (a display placeholder, not a number) when
  // a teacher has none yet — Number("—") is NaN, so that placeholder must
  // never reach here. Once the real detail has loaded, prefer it outright
  // (even a real null/no-rating) over the list's possibly-stale value.
  const listRating = teacher?.rating && teacher.rating !== "—" ? Number(teacher.rating) : 0;
  const rating = detail ? (detail.rating ?? 0) : listRating;
  const rank = detail ? (detail.leaderboard_position ?? 0) : (teacher?.rank ?? 0);
  const isActive = (detail?.status ?? "active") !== "inactive";

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !teacher) return;
    if (!file.type.startsWith("image/")) {
      showError("Please choose an image file.");
      return;
    }
    setIsUploadingAvatar(true);
    try {
      const newAvatarUrl = await uploadTeacherAvatar(file);
      await updateProfile.mutateAsync({avatar_url: newAvatarUrl});
      showSuccess("Photo updated.");
    } catch (err) {
      showError(extractApiError(err, "Couldn't update the photo. Please try again."));
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  return (
    <AnimatePresence>
      {isOpen && teacher ? (
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{duration: 0.2}}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]"
          />

          <motion.section
            initial={{x: "100%", opacity: 0}}
            animate={{x: 0, opacity: 1}}
            exit={{x: "100%", opacity: 0}}
            transition={{type: "tween", duration: 0.3}}
            className="fixed top-0 right-0 z-50 h-screen w-full max-w-150 bg-white p-6 shadow-2xl overflow-y-auto"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-muted/20">
                <div className="flex items-center gap-3">
                  <Button
                    variant={"ghost"}
                    leftIcon={<Icon icon="mdi-light:share" />}
                  >
                    Share
                  </Button>
                  <Button
                    variant={"ghost"}
                    leftIcon={<Icon icon="mdi-light:share" />}
                  >
                    Export
                  </Button>
                </div>

                <Button
                  onClick={onClose}
                  variant={"ghost"}
                  size={"fit"}
                  className="rounded-full py-1 px-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                  aria-label="Close panel"
                >
                  ✕
                </Button>
              </div>

              <div className="flex flex-col relative">
                <Image
                  src="/assets/images/ProfileBg.png"
                  alt="profileBg"
                  width={800}
                  height={500}
                  className="w-full h-auto object-cover rounded-lg"
                  priority
                />

                <div className="absolute left-1/2 top-[50%] z-10 -translate-x-1/2 -translate-y-1/2">
                  <div className="group relative size-42 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                    <TeacherAvatar
                      name={name}
                      avatar={avatarUrl}
                      className="w-full h-full rounded-full"
                      textClassName="text-4xl"
                    />
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                      aria-label="Change photo"
                      className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100 disabled:opacity-100"
                    >
                      {isUploadingAvatar ? (
                        <Icon icon="line-md:loading-twotone-loop" size={28} />
                      ) : (
                        <Icon icon="lucide:camera" size={28} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="font-medium text-white text-xl">{name}</h1>
                      <h1 className="flex items-center gap-1 text-gray-400 text-xs">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <span>{isActive ? "Active Teacher" : "Inactive Teacher"}</span>
                      </h1>
                    </div>

                    <div className="flex  gap-3 ">
                      <div className="flex items-center gap-1">
                        <Icon
                          icon="material-symbols:star-rounded"
                          className="text-green-500"
                          size={15}
                        />
                        <p className="text-white text-xs ">{rating.toFixed(1)}</p>
                      </div>

                      <div
                        className={`relative w-10 h-12 flex items-start justify-center pt-1.5 text-xs font-bold text-purple-200 bg-purple-600`}
                        style={{
                          clipPath:
                            "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
                        }}
                      >
                        <span className="translate-y-2">#{rank}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {isDetailError ? (
                <p className="text-sm text-red-600">
                  Couldn&apos;t load this teacher&apos;s profile. Please try again.
                </p>
              ) : (
                <div>
                  <PersonalDetails
                    detail={detail}
                    isLoading={isLoadingDetail}
                    isEditing={isEditing}
                    isSaving={updateProfile.isPending}
                    onStartEdit={() => setIsEditing(true)}
                    onCancelEdit={() => setIsEditing(false)}
                    onSave={async (updates) => {
                      try {
                        await updateProfile.mutateAsync(updates);
                        showSuccess("Profile updated.");
                        setIsEditing(false);
                      } catch (err) {
                        showError(
                          extractApiError(err, "Couldn't update this profile. Please try again."),
                        );
                      }
                    }}
                  />

                  <Programs programs={detail?.programs} isLoading={isLoadingDetail} />

                  <LearningInformation detail={detail} isLoading={isLoadingDetail} />

                  <UpcomingSessionSection session={detail?.upcoming_session} />

                  <CoTeachersSection teachers={detail?.co_teachers} />
                </div>
              )}

              <Button
                variant={"ghost"}
                width={"full"}
                className="text-red-500"
                onClick={() => onDisableTeacher(teacher)}
              >
                Disable Teacher
              </Button>
            </div>
          </motion.section>
        </>
      ) : null}
    </AnimatePresence>
  );
}

interface ProfileEdits {
  teacher_name?: string;
  email?: string;
  phone?: string;
  location?: string;
  subject?: string;
}

function PersonalDetails({
  detail,
  isLoading,
  isEditing,
  isSaving,
  onStartEdit,
  onCancelEdit,
  onSave,
}: {
  detail: TeacherDetail | undefined;
  isLoading: boolean;
  isEditing: boolean;
  isSaving: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: (updates: ProfileEdits) => Promise<void>;
}) {
  const [revealed, setRevealed] = useState(false);
  const [form, setForm] = useState<ProfileEdits>({});

  function startEdit() {
    setForm({
      teacher_name: detail?.teacher_name || "",
      email: detail?.email || "",
      phone: detail?.phone || "",
      location: detail?.location || "",
    });
    onStartEdit();
  }

  const email = detail?.email || "";
  const phone = detail?.phone || "";
  const maskedPhone = phone ? phone.replace(/\d(?=\d{4})/g, "*") : "";
  const username = detail?.username || "";
  const location = detail?.location || "";

  function set<K extends keyof ProfileEdits>(key: K) {
    return (value: string) => setForm((prev) => ({...prev, [key]: value}));
  }

  async function handleSubmit() {
    if (!detail) return;
    const diff: ProfileEdits = {};
    if (form.teacher_name !== undefined && form.teacher_name !== (detail.teacher_name || "")) {
      diff.teacher_name = form.teacher_name;
    }
    if (form.email !== undefined && form.email !== (detail.email || "")) {
      diff.email = form.email;
    }
    if (form.phone !== undefined && form.phone !== (detail.phone || "")) {
      diff.phone = form.phone;
    }
    if (form.location !== undefined && form.location !== (detail.location || "")) {
      diff.location = form.location;
    }
    if (Object.keys(diff).length === 0) {
      onCancelEdit();
      return;
    }
    await onSave(diff);
  }

  return (
    <div className="w-[90%]">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-subtle">Personal Details</h2>
        {!isLoading && !isEditing && (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-800"
          >
            <Icon icon="lucide:pencil" size={13} />
            Edit
          </button>
        )}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : isEditing ? (
        <div className="flex flex-col gap-4">
          <FormInputs
            type="text"
            label="Name"
            value={form.teacher_name}
            onChange={set("teacher_name")}
            inputClassName="py-2.5"
          />
          <FormInputs
            type="text"
            label="Email"
            value={form.email}
            onChange={set("email")}
            inputClassName="py-2.5"
          />
          <FormInputs
            type="text"
            label="Phone"
            value={form.phone}
            onChange={set("phone")}
            inputClassName="py-2.5"
          />
          <FormInputs
            type="text"
            label="Location"
            value={form.location}
            onChange={set("location")}
            inputClassName="py-2.5"
          />
          <div className="flex items-center gap-3">
            <Button type="button" size="sm" loading={isSaving} onClick={handleSubmit}>
              Save
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onCancelEdit} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-8">
          <div className="flex items-center gap-3">
            <Icon
              icon="lucide:mail"
              size={18}
              className="text-gray-500 shrink-0"
            />
            <span className="text-sm font-medium text-gray-600 truncate">
              {email || "No email on file"}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Icon
              icon="lucide:phone"
              size={18}
              className="text-gray-500 shrink-0"
            />
            <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
              {phone ? (revealed ? phone : maskedPhone) : "No phone on file"}
            </span>
            {phone && (
              <button
                onClick={() => setRevealed((prev) => !prev)}
                className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                {revealed ? "Hide" : "Reveal"}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Icon
              icon="lucide:user-check"
              size={18}
              className="text-gray-500 shrink-0"
            />
            <span className="text-sm font-medium text-gray-600">{username || "—"}</span>
          </div>

          <div className="flex items-center gap-3">
            <Icon icon="lucide:map-pin" size={18} className="text-gray-500 shrink-0" />
            <span className="text-sm font-semibold text-gray-800">
              {location || "No location on file"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function Programs({
  programs,
  isLoading,
}: {
  programs: TeacherProgram[] | undefined;
  isLoading: boolean;
}) {
  function ProgramRow({program}: {program: TeacherProgram}) {
    return (
      <div className="flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-sm font-semibold text-violet-600">
            {program.program_name?.slice(0, 1).toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {program.program_name}
            </p>
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              {program.program_type === "exam" ? "Exam program" : "Course"}
              {program.students_count > 0 && ` · ${program.students_count} students`}
            </p>
          </div>
        </div>
        {program.rating != null && (
          <div className="flex items-center gap-1 shrink-0 text-xs text-gray-500">
            <Icon icon="material-symbols:star-rounded" className="text-amber-500" size={14} />
            {program.rating}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <h2 className="text-sm font-semibold text-subtle mb-2">Programs</h2>
      {isLoading ? (
        <p className="py-4 text-sm text-muted">Loading…</p>
      ) : !programs?.length ? (
        <p className="py-4 text-sm text-muted">No programs assigned yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {programs.map((program) => (
            <ProgramRow key={program.program_id} program={program} />
          ))}
        </div>
      )}
    </div>
  );
}

function LearningInformation({
  detail,
  isLoading,
}: {
  detail: TeacherDetail | undefined;
  isLoading: boolean;
}) {
  const dateJoined = detail?.date_joined
    ? new Date(detail.date_joined).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

  return (
    <div className="w-full border-t border-muted/30 mt-6 pt-4">
      <h2 className="text-sm font-semibold text-subtle mb-2">
        Learning Information
      </h2>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="flex gap-x-8">
          <div className="flex gap-10 ">
            <div>
              <p className="text-xs font-semibold text-gray-900 mb-1">
                Date Joined
              </p>
              <p className="text-xs text-gray-500">{dateJoined}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-900 mb-1">
                Sessions
              </p>
              <p className="text-xs text-gray-600">
                {detail?.no_of_sessions ?? 0} total · {detail?.calls_taken ?? 0} calls taken
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function UpcomingSessionSection({session}: {session: ApiUpcomingSession | null | undefined}) {
  if (!session) {
    return (
      <div className="w-full max-w-xl font-sans text-gray-800 my-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Upcoming session
        </h3>
        <p className="text-sm text-muted">No upcoming session scheduled.</p>
      </div>
    );
  }

  const scheduled = new Date(session.scheduled_date);
  const timeText = scheduled.toLocaleString("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="w-full max-w-xl font-sans text-gray-800 my-6">
      <h3 className="text-base font-semibold text-gray-800 mb-4">
        Upcoming session
      </h3>

      <div className="relative w-full rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs">
        <div className="mb-3 inline-block rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {session.session_type}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-bold text-gray-900 truncate max-w-[280px]">
              {session.program_name}
            </h4>

            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">
                {session.teacher_names.join(" & ") || "—"}
              </p>
              <div className="flex items-center gap-1 text-xs font-medium text-purple-600 mt-0.5">
                <Icon icon="lucide:timer" size={13} />
                <span>{timeText}</span>
              </div>
            </div>
          </div>

          {session.zoom_url && (
            <a
              href={session.zoom_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#111318] pl-4 pr-1 py-1 text-xs font-medium text-white hover:bg-gray-800 transition-colors"
            >
              <span>Join</span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-gray-900">
                <Icon icon="lucide:video" size={15} />
              </div>
            </a>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm font-semibold text-gray-800">
        Calls taken: <span className="font-bold">{session.calls_taken}</span>
      </p>
    </div>
  );
}

function CoTeachersSection({teachers}: {teachers: CoTeacher[] | undefined}) {
  if (!teachers?.length) return null;

  return (
    <div className="w-full ">
      <h3 className="text-base font-semibold text-gray-800 mb-6">
        Teachers under same program
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {teachers.map((coTeacher) => (
          <div key={coTeacher.teacher_id} className="flex items-center gap-3.5">
            <div className="relative shrink-0 p-0.5 rounded-full border border-gray-200/80 bg-white shadow-2xs">
              <TeacherAvatar
                name={coTeacher.teacher_name || coTeacher.email}
                className="h-11 w-11"
                textClassName="text-sm"
              />
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 truncate">
                {coTeacher.teacher_name || coTeacher.email}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {coTeacher.subject || coTeacher.email}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
