"use client";
import Link from "next/link";
import {Icon} from "@mcc/ui";
import type {ApiDailyLimit} from "@/src/features/courses/services/course.service";
import {limitState, timeUntil} from "@/src/features/learnings/helper/dailyLimit";
import type {Module} from "@/src/features/learnings/helper/content.mapper";

/**
 * What the free-course daily limit means for the learner right now, above the course:
 * choose today's module, or come back tomorrow / sign up for a paid course.
 * Renders nothing for a learner the limit does not apply to.
 */
export default function DailyLimitBanner({limit, modules}: {limit: ApiDailyLimit; modules: Module[]}) {
  const state = limitState(limit, modules.map((m) => m.id));
  if (state === "none") return null;

  const todaysModule = modules.find((m) => m.id === limit.unlocked_module_id);
  const wait = timeUntil(limit.unlocks_at);

  return (
    <div
      role="status"
      className="mx-4 mb-6 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="flex min-w-0 items-start gap-3">
        <Icon icon={state === "choose" ? "solar:book-bookmark-bold" : "solar:lock-keyhole-bold"} size={22} className="mt-0.5 shrink-0 text-primary" />
        {state === "choose" ? (
          <div>
            <p className="text-sm font-semibold">Free courses open one module a day</p>
            <p className="text-sm text-muted">
              Choose the module you want to learn today. The others unlock tomorrow.
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm font-semibold">
              {state === "used-here" && todaysModule
                ? `Today's module: ${todaysModule.title}`
                : "You've used today's free module"}
            </p>
            <p className="text-sm text-muted">
              Come back tomorrow (in {wait}) to continue learning, or sign up for a paid course to learn without a daily
              limit.
            </p>
          </div>
        )}
      </div>
      <Link
        href="/explore"
        className="shrink-0 rounded-full border border-primary px-4 py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
      >
        Browse paid courses
      </Link>
    </div>
  );
}
