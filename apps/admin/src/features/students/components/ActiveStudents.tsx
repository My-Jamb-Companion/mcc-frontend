"use client";

import {Icon, Button, Modal} from "@mcc/ui";
import ActiveTable from "./ActiveTable";
import {FormInputs} from "@mcc/features";
import {useState} from "react";
import ViewActiveStudent from "./ViewActiveStudent";
import CreateStudentModal from "./CreateStudent";
import EnrollStudentModal from "./EnrollStudent";
import {Student} from "../types/types";
import Image from "next/image";

export default function ActiveStudents() {
  const [program, setProgram] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState(false);
  const [createStudent, setCreateStudent] = useState(false);
  const [enrollStudent, setEnrollStudent] = useState(false);
  const [confirmDisable, setConfirmDisable] = useState(false);

  const handleOpenProfile = (student: Student) => {
    setViewStudent(true);
    setStudent(student);
  };

  const handleMessageStudent = (student: Student) => {
    // Open message modal
    console.log("Messaging:", student.email);
  };

  const handleDisableStudent = (student: Student) => {
    setConfirmDisable(true);
    setStudent(student);
  };

  const handleEnrollStudent = (student: Student) => {
    setStudent(student);
    setEnrollStudent(true);
  };
  return (
    <section className="flex flex-col gap-6 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Active Students</h1>
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
          <div className="flex items-center gap-3 w-[30%]">
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
            <FormInputs
              type="select"
              placeholder="Select Location"
              icon="mdi:location"
              options={[
                {value: "Abuja", label: "Abuja"},
                {value: "Lagos", label: "Lagos"},
                {value: "Kano", label: "Kano"},
                {value: "Oyo", label: "Oyo"},
              ]}
              value={location}
              onChange={setLocation}
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
        <ActiveTable
          onOpenProfile={handleOpenProfile}
          onMessageStudent={handleMessageStudent}
          onDisableStudent={handleDisableStudent}
          onEnrollStudent={handleEnrollStudent}
        />
      </div>

      <div>
        <ViewActiveStudent
          isOpen={viewStudent}
          student={student}
          onDisableStudent={handleDisableStudent}
          onClose={() => {
            setViewStudent(false);
            setStudent(null);
          }}
        />

        <CreateStudentModal
          isOpen={createStudent}
          onClose={() => setCreateStudent(false)}
        />

        <EnrollStudentModal
          student={student}
          isOpen={enrollStudent}
          onClose={() => setEnrollStudent(false)}
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
                      <div className="h-1.5 w-1.5  bg-green-500 rounded-full" />
                      <span>Active student</span>
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

            <h2 className="text-2xl font-semibold pt-6">Disable Student</h2>

            <p className="text-sm text-muted py-5">
              Are you sure you want to disable {student?.name}? This action can
              not be undone.
            </p>
            <div className="inline-flex items-center gap-3 pt-6  w-full ">
              <Button variant="danger" width="full">
                Disable Student
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
      </div>
    </section>
  );
}
