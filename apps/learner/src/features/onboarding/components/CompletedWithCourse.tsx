"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { PendingCourse } from "@mcc/store";

export function CompletedWithCourse({ course }: { course: PendingCourse }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center pt-20 max-sm:pt-10">
      <div className="max-w-132.5 w-full flex flex-col gap-8">
        <div className="text-center flex flex-col gap-2">
          <h3 className="text-xl font-semibold">You&apos;re all set!</h3>
          <p className="text-sm text-muted">
            Your profile is ready. Here&apos;s the course you selected:
          </p>
        </div>

        <div className="flex items-center rounded-2xl p-1 bg-white dark:bg-hint border border-muted/30 shadow-md gap-3">
          <div className="h-[67px] w-[85px] rounded-xl border border-hint overflow-hidden flex-shrink-0">
            {course.image ? (
              <Image
                src={course.image}
                alt={course.title}
                width={85}
                height={67}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted/20 rounded-xl" />
            )}
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium">{course.title}</p>
            <div className="flex items-center gap-4">
              {course.originalPrice !== undefined && (
                <p className="line-through italic text-muted text-sm">
                  ${course.originalPrice.toFixed(2)}
                </p>
              )}
              <p className="font-semibold text-sm">
                {course.price !== undefined
                  ? `$${course.price.toFixed(2)}`
                  : "Free"}
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.push(`/courses/${course.id}`)}
          className="bg-primary text-white border-muted/50 border shadow-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-primary/90 rounded-full py-2.5 w-full font-medium active:scale-95 outline-primary/50 focus:outline transition-all duration-300"
        >
          Continue to Course
        </button>
      </div>
    </div>
  );
}
