"use client";
import {Icon, Modal, Button} from "@mcc/ui";
import ProspectiveTable from "./ProspectiveTable";
import {FormInputs} from "@mcc/features";
import {useState} from "react";
import CreateStudentModal from "./CreateStudent";
import ViewProspectiveStudent from "./ViewProspectiveStudent";
import Image from "next/image";
import {ProspectiveStudent} from "../types/types";

export default function ProspectiveStudents() {
  const [program, setProgram] = useState("");
  const [search, setSearch] = useState("");
  const [createStudent, setCreateStudent] = useState(false);
  const [student, setStudent] = useState<ProspectiveStudent | null>(null);
  const [viewStudent, setViewStudent] = useState(false);
  const [rejectStudent, setRejectStudent] = useState(false);

  const handleOpenProfile = (student: ProspectiveStudent) => {
    setViewStudent(true);
    setStudent(student);
  };
  const handleRejectStudent = (student: ProspectiveStudent) => {
    setStudent(student);
    setRejectStudent(true);
  };
  return (
    <section className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Prospective Students</h1>
        <div className="relative">
          <Button
            width="fit"
            className="p-2! pr-4!"
            leftIcon={<Icon icon="line-md:plus" />}
            onClick={() => setCreateStudent(true)}
          >
            <p>Create Student</p>
          </Button>
        </div>
      </div>

      <div className="flex flex-col h-full border border-muted/20 rounded-2xl px-6 py-8 ">
        <div className="flex items-center justify-between w-full  pb-4">
          <div className="flex items-center gap-3">
            <FormInputs
              type="select"
              placeholder="Select method"
              icon="ri:book-shelf-line"
              options={[
                {value: "free_class", label: "Free Class"},
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
          </div>
          <div className="w-full max-w-75">
            <FormInputs
              placeholder="Search for Prospective student"
              type="text"
              icon={<Icon icon="ri:search-line" size={18} />}
              value={search}
              onChange={setSearch}
              inputClassName=" rounded-full! shadow-sm border-muted/30"
            />
          </div>
        </div>
        <ProspectiveTable
          onOpenProfile={handleOpenProfile}
          onRejectStudent={handleRejectStudent}
        />

        <CreateStudentModal
          isOpen={createStudent}
          onClose={() => setCreateStudent(false)}
        />
        <ViewProspectiveStudent
          isOpen={viewStudent}
          student={student}
          onClose={() => {
            setViewStudent(false);
            setStudent(null);
          }}
          onRejectStudent={handleRejectStudent}
        />

        <Modal open={rejectStudent} onClose={() => setRejectStudent(false)}>
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
                <div className="relative size-33 overflow-hidden rounded-full border border-white/20 bg-white/10 backdrop-blur-md">
                  <img
                    src={student?.avatar}
                    alt="profile"
                    className="object-cover w-full h-full"
                  />
                </div>
              </div>

              {/* GLASS CARD */}
              <div className="absolute bottom-2 left-1/2 z-20 w-[96%] -translate-x-1/2 rounded-xl border border-white/20 bg-black/30 p-6 backdrop-blur-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-medium text-white text-xl">
                      {student?.name}
                    </h1>
                    <h1 className="flex items-center gap-1 text-gray-400 text-xs">
                      <div className="h-1.5 w-1.5  bg-gray-500 rounded-full" />
                      <span>Prospective student</span>
                    </h1>
                  </div>

                  <div className="flex flex-col gap-3 ">
                    <div className="flex items-center gap-6">
                      <p className="text-gray-400 text-xs">Onboarding level</p>
                      <p className="text-white text-xs font-medium">94%</p>
                    </div>

                    <div className="relative flex items-center justify-center h-3">
                      <div
                        className="w-full border border-white/50 h-full rounded-xs "
                        style={{
                          transform: "skewX(22deg)",
                        }}
                      >
                        <div
                          className="absolute left-0 z-10 w-[78%] rounded-tr-xs rounded-br-xs bg-white h-full"
                          style={{
                            transform: "skewX(1deg)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-semibold pt-6">Reject Student</h2>

            <p className="text-sm text-muted py-5">
              Are you sure you want to reject {student?.name}? This action can
              not be undone.
            </p>
            <div className="inline-flex items-center gap-3 pt-6  w-full ">
              <Button variant="danger" width="full">
                Reject Student
              </Button>
              <Button
                variant="outline"
                width="full"
                onClick={() => setRejectStudent(false)}
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
