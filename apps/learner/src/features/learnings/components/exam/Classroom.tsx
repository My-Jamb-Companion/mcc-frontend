"use client";

import {Button, Icon} from "@mcc/ui";
import {useExam} from "./context/ExamContext";

export default function Classroom() {
  const {activeClassroomSubject, activeClassroomUnit} = useExam();
  console.log(activeClassroomUnit);
  return (
    <section className="flex flex-col gap-y-6 min-h-screen py-6 px-4">
      <div className="w-full flex items-center justify-between">
        <div>
          <p className="text-xl">
            Welcome <span className="font-bold">Bright 🌞</span>
          </p>
          <p className="text-sm font-medium">
            Start preparing for your <span className="font-bold">UTME 📖</span>
          </p>
        </div>

        <div className="flex items-center border-2 ">
          <div className="flex items-center">
            <Icon icon="ri:rocket-fill" />
            <div className="flex items-center">
              <p className="text-4xl font-bold text-subtle">0</p>
              <p className="text-xs text-subtle">
                prep
                <br />
                steak
              </p>
            </div>
          </div>

          <div></div>

          <div className="flex items-center border-2">
            <Icon icon="raphael:arrowright" size={45} />
            <div className="flex flex-col gap-1 ml-2">
              <div className="flex items-center gap-1">
                <p className="text-sm text-nowrap">Level 1 </p>
                <Icon icon="ri:information-2-line" />
              </div>

              <div className="flex items-center gap-3">
                <div className="rounded-full bg-muted/10  w-[140px] h-1" />
                <div className="flex items-center justify-center text-nowrap">
                  <span className="font-medium">0</span>
                  <span className="text-subtle">/1 skill</span>
                </div>
              </div>
            </div>

            <Button radius="sm" className="bg-blue-500! ml-10">
              Level up <Icon icon="grommet-icons:link-next" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex w-full flex-1">
        <div className="w-full grow  bg-red-400 border-2  max-w-[300px]"></div>
        <div className="w-full grow border-2"></div>
      </div>
    </section>
  );
}
