"use client";
import FormInputs from "@/src/components/FormInput";
import TabbedButton from "@/src/components/TabbedButton";
import {Button, Icon} from "@mcc/ui";
import {useState} from "react";

export default function StudioAnalysis() {
  const [active, setActive] = useState("student");
  const [search, setSearch] = useState("");
  const [program, setProgram] = useState("");
  const [date, setDate] = useState("");
  const [quality, setQuality] = useState("");
  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI studio analysis</h1>
        <Button variant="outline" width="fit" className="p-2!">
          <Icon icon="ri:export-line" />
        </Button>
      </div>

      <div className="bg-white border border-muted/20 rounded-2xl px-6 py-8">
        <div className="flex items-center gap-3 justify-between">
          <div className="flex items-center gap-3 ">
            <TabbedButton
              tabs={[
                {key: "student", label: "Student"},
                {key: "teachers", label: "Teachers"},
              ]}
              active={active}
              onChange={setActive}
            />

            <FormInputs
              type="select"
              placeholder="Select program"
              icon="ri:book-shelf-line"
              options={[
                {value: "jamb", label: "JAMB"},
                {value: "waec", label: "WAEC"},
              ]}
              value={program}
              onChange={setProgram}
              selectRadius="full"
              selectClassName="py-1.5! text-nowrap gap-2"
            />
            <FormInputs
              type="date"
              placeholder="Date"
              icon="uil:calender"
              value={date}
              onChange={setDate}
              selectRadius="sm"
              selectClassName="py-1.5! text-nowrap gap-2 rounded-full!"
            />
            <FormInputs
              type="select"
              placeholder="Select quality"
              icon="line-md:star"
              options={[
                {value: "excellent", label: "Excellent"},
                {value: "average", label: "Average"},
                {value: "poor", label: "Poor"},
              ]}
              value={quality}
              onChange={setQuality}
              selectRadius="full"
              selectClassName="py-1.5! text-nowrap gap-2"
            />
          </div>

          <div className="w-full max-w-[20%]">
            <FormInputs
              placeholder="Search for conversation/program"
              type="text"
              icon={<Icon icon="ri:search-line" size={18} />}
              value={search}
              onChange={setSearch}
              inputClassName=" rounded-full! shadow-sm border-muted/30"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
