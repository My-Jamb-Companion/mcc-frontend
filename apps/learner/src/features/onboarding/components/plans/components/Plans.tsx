"use client";

import CourseCard from "./courseCard";
import PlanForm from "./planForm";

export default function Plan({plan}: {plan: "free" | "paid"}) {
  return (
    <div className="flex flex-col items-center pt-20 h-full">
      <div className="max-w-132.5 w-full flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="text-center">
            <p className="text-xl font-bold">Enter your details to proceed</p>
            <p className="text-sm text-muted">
              You have to pay to proceed to access your program
            </p>
          </div>
          <CourseCard plan={plan} />
          <PlanForm plan={plan} />
        </div>
      </div>
    </div>
  );
}
