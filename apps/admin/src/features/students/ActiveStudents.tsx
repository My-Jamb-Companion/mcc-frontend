"use client";
import {Button} from "@/src/components/Buttons";
import {Icon} from "@mcc/ui";
import ActiveTable, {Student} from "./ActiveTable";
import {FormInputs} from "@mcc/features";
import {useState} from "react";
import ViewActiveStudent from "./ViewActiveStudent";

export default function ActiveStudents() {
  const [program, setProgram] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [student, setStudent] = useState<Student | null>(null);

  const handleOpenProfile = (student: Student) => {
    // Navigate or open modal
    setStudent(student);
    console.log("Opening profile for:", student.name);
  };

  const handleMessageStudent = (student: Student) => {
    // Open message modal
    console.log("Messaging:", student.email);
  };

  const handleDisableStudent = (student: Student) => {
    // Open confirmation dialog
    console.log("Disabling student ID:", student.id);
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
        />
      </div>

      <div>
        <ViewActiveStudent student={student} onClose={() => setStudent(null)} />
      </div>
    </section>
  );
}
