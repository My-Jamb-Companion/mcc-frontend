"use client";

import {Icon, Button, Modal, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {FormInputs} from "@mcc/features";
import {useState} from "react";
import {Teacher} from "../types/types";
import TeachersTable from "./TeachersTable";
import ViewTeacher from "./ViewTeacher";
import Image from "next/image";
import SendMessage from "./SendMessage";
import AssignCRAModal from "./AssignCRA";
import AssignProgram from "./AssignProgram";
import TeacherAvatar from "./TeacherAvatar";
import {
  useApproveTeacher,
  useAssignTeacherToAssignment,
  useDisableTeacher,
  useEscalatedAssignments,
  useRejectTeacher,
} from "../hooks/useAdminTeachers";

export default function Teachers() {
  const [program, setProgram] = useState("");
  const [date, setDate] = useState("");
  const [search, setSearch] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [viewTeacher, setViewTeacher] = useState(false);
  const [messageCall, setMessageCall] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignProgram, setAssignProgram] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const disableTeacherMutation = useDisableTeacher();
  const approveTeacherMutation = useApproveTeacher();
  const rejectTeacherMutation = useRejectTeacher();
  const assignTeacherMutation = useAssignTeacherToAssignment();
  const {data: escalatedAssignments = []} = useEscalatedAssignments(
    isAssignOpen ? teacher?.subject : undefined,
  );

  const handleOpenProfile = (teacher: Teacher) => {
    setViewTeacher(true);
    setTeacher(teacher);
  };

  const handleDisableTeacher = (teacher: Teacher) => {
    setConfirmDisable(true);
    setTeacher(teacher);
  };

  const handleApproveTeacher = (teacher: Teacher) => {
    approveTeacherMutation.mutate(teacher.id, {
      onSuccess: () => showSuccess(`${teacher.name} has been approved`),
      onError: (error) => showError(extractApiError(error, "Couldn't approve this teacher")),
    });
  };

  const handleRejectTeacher = (teacher: Teacher) => {
    setTeacher(teacher);
    setConfirmReject(true);
  };

  const handleAssignCra = (teacher: Teacher) => {
    setTeacher(teacher);
    setIsAssignOpen(true);
  };

  const handleAssignToEscalation = (assignmentId: string) => {
    if (!teacher) return;
    assignTeacherMutation.mutate(
      {assignmentId, teacherUserId: teacher.id},
      {
        onSuccess: () => {
          showSuccess(`${teacher.name} was assigned to that student`);
          setIsAssignOpen(false);
          setTeacher(null);
        },
        onError: (error) => showError(extractApiError(error, "Couldn't assign this teacher")),
      },
    );
  };

  const handleAssignProgram = (teacher: Teacher) => {
    setTeacher(teacher);
    setAssignProgram(true);
  };

  return (
    <section className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Teachers</h1>
        <div className="relative">
          {/* <Button
            width="fit"
            className="p-2! pr-4!"
            leftIcon={<Icon icon="line-md:plus" />}
            onClick={() => setCreateTeacher(true)}
          >
            <p>Create Teacher</p>
          </Button> */}
        </div>
      </div>

      <div className="flex flex-col h-full border border-muted/20 rounded-2xl px-6 py-8 ">
        <div className="flex items-center justify-between w-full  pb-4">
          <div className="flex items-center gap-3 w-[20%]">
            <FormInputs
              type="select"
              placeholder="Select program"
              icon="ri:book-shelf-line"
              options={[
                {value: "ielts", label: "IELTS"},
                {value: "jamb", label: "JAMB"},
                {value: "waec", label: "WAEC"},
                {value: "toefl", label: "TOEFL"},
                {value: "pmp", label: "PMP"},
                {value: "pim", label: "PIM"},
              ]}
              value={program}
              onChange={setProgram}
              selectRadius="full"
              selectClassName="py-1.5! text-nowrap gap-2"
            />
            <FormInputs
              type="select"
              placeholder="Select Date"
              icon="mdi:calendar"
              options={[
                {value: "today", label: "Today"},
                {value: "yesterday", label: "Yesterday"},
                {value: "week", label: "This Week"},
                {value: "month", label: "This Month"},
                {value: "year", label: "This Year"},
              ]}
              value={date}
              onChange={setDate}
              selectRadius="full"
              selectClassName="py-1.5! text-nowrap gap-2"
            />
          </div>
          <div className="w-full max-w-75">
            <FormInputs
              placeholder="Search for Active student"
              type="text"
              icon={<Icon icon="ri:search-line" size={18} />}
              value={search}
              onChange={setSearch}
              inputClassName=" rounded-full! shadow-sm border-muted/30"
            />
          </div>
        </div>
        <TeachersTable
          onOpenProfile={handleOpenProfile}
          onMessageTeacher={() => setMessageCall(true)}
          onDisableTeacher={handleDisableTeacher}
          onAssignProgram={handleAssignProgram}
          onAssignCra={handleAssignCra}
          onApproveTeacher={handleApproveTeacher}
          onRejectTeacher={handleRejectTeacher}
        />
      </div>

      <div>
        <ViewTeacher
          isOpen={viewTeacher}
          teacher={teacher}
          onDisableTeacher={handleDisableTeacher}
          onClose={() => {
            setViewTeacher(false);
            setTeacher(null);
          }}
        />

        <SendMessage
          open={!!messageCall}
          onClose={() => setMessageCall(false)}
          onSend={() => {
            setMessageCall(false);
          }}
        />

        {/* Keyed per teacher and per opening: the selection resets by
            remounting, rather than by an effect that writes state on render. */}
        <AssignCRAModal
          key={`cra-${teacher?.id ?? "none"}-${isAssignOpen}`}
          isOpen={isAssignOpen}
          onClose={() => setIsAssignOpen(false)}
          teacher={teacher!}
          assignments={escalatedAssignments}
          onAssign={handleAssignToEscalation}
          isAssigning={assignTeacherMutation.isPending}
        />

        <AssignProgram
          teacher={teacher}
          isOpen={assignProgram}
          onClose={() => setAssignProgram(false)}
        />
        <Modal open={confirmDisable} onClose={() => setConfirmDisable(false)}>
          <div className="flex flex-col ">
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
                <div className="relative size-42 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <TeacherAvatar
                    name={teacher?.name ?? ""}
                    avatar={teacher?.avatar}
                    className="w-full h-full rounded-full"
                    textClassName="text-4xl"
                  />
                </div>
              </div>

              <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-medium text-white text-xl">
                      {teacher?.name}
                    </h1>
                    <h1 className="flex items-center gap-1 text-gray-400 text-xs">
                      <div className="h-1.5 w-1.5  bg-green-500 rounded-full" />
                      <span>Active Teacher</span>
                    </h1>
                  </div>

                  <div className="flex  gap-3 ">
                    <div className="flex items-center gap-1">
                      <Icon
                        icon="material-symbols:star-rounded"
                        className="text-green-500"
                        size={15}
                      />
                      <p className="text-white text-xs ">2.4k (1.4k)</p>
                    </div>

                    <div
                      className={`relative w-10 h-12 flex items-start justify-center pt-1.5 text-xs font-bold text-purple-200 bg-purple-600`}
                      style={{
                        clipPath:
                          "polygon(0 0, 100% 0, 100% 78%, 50% 100%, 0 78%)",
                      }}
                    >
                      <span className="translate-y-2">#24</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold pt-6">Disable Teacher</h2>

            <p className="text-sm text-muted py-5">
              Are you sure you want to disable {teacher?.name}? This action can
              not be undone.
            </p>
            {disableTeacherMutation.isError && (
              <p className="text-sm text-red-500 pb-3">
                Failed to disable teacher. Please try again.
              </p>
            )}
            <div className="inline-flex items-center gap-3 pt-6  w-full ">
              <Button
                variant="danger"
                width="full"
                disabled={disableTeacherMutation.isPending}
                onClick={() => {
                  if (!teacher) return;
                  disableTeacherMutation.mutate(teacher.id, {
                    onSuccess: () => {
                      setConfirmDisable(false);
                      setTeacher(null);
                    },
                  });
                }}
              >
                {disableTeacherMutation.isPending ? "Disabling…" : "Disable Teacher"}
              </Button>
              <Button
                variant="outline"
                width="full"
                onClick={() => setConfirmDisable(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          open={confirmReject}
          onClose={() => {
            setConfirmReject(false);
            setRejectReason("");
          }}
        >
          <div className="flex flex-col">
            <h2 className="text-2xl font-semibold">Reject Application</h2>
            <p className="text-sm text-muted py-3">
              Reject {teacher?.name}&apos;s teacher application? They&apos;ll receive this
              reason by email.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (required)"
              rows={4}
              className="w-full rounded-xl border border-muted/30 p-3 text-sm outline-none focus:border-muted/60"
            />
            {rejectTeacherMutation.isError && (
              <p className="text-sm text-red-500 pt-3">
                {extractApiError(
                  rejectTeacherMutation.error,
                  "Failed to reject application. Please try again.",
                )}
              </p>
            )}
            <div className="inline-flex items-center gap-3 pt-6 w-full">
              <Button
                variant="danger"
                width="full"
                disabled={rejectTeacherMutation.isPending || !rejectReason.trim()}
                onClick={() => {
                  if (!teacher) return;
                  rejectTeacherMutation.mutate(
                    {teacherId: teacher.id, reason: rejectReason.trim()},
                    {
                      onSuccess: () => {
                        showSuccess(`${teacher.name}'s application was rejected`);
                        setConfirmReject(false);
                        setTeacher(null);
                        setRejectReason("");
                      },
                    },
                  );
                }}
              >
                {rejectTeacherMutation.isPending ? "Rejecting…" : "Reject Application"}
              </Button>
              <Button
                variant="outline"
                width="full"
                onClick={() => {
                  setConfirmReject(false);
                  setRejectReason("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </section>
  );
}
