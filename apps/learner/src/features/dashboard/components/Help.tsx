import {Icon} from "@mcc/ui";
import {useState} from "react";

export default function Help() {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col z-9999">
      {open && <CompleteProfileCard />}

      <div
        className="self-end rounded-full mt-4 p-2 w-fit border border-muted/40 cursor-pointer bg-white hover:bg-muted/30 dark:text-white dark:bg-subtle dark:border dark:border-white"
        onClick={() => setOpen(!open)}
      >
        <Icon icon="line-md:question" size={24} />
      </div>
    </div>
  );
}

const steps = [
  {
    title: "Personal details",
    status: "completed",
  },
  {
    title: "Your location",
    status: "loading",
  },
  {
    title: "Profile photo",
    status: "pending",
  },
];

export function CompleteProfileCard() {
  return (
    <div className="w-115 rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm">
      {/* top */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-violet-600">
            <Icon icon="lucide:user" size={22} />
          </div>

          <p className="text-xl font-semibold text-neutral-900">
            Complete profile
          </p>
        </div>

        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-neutral-600">
            <Icon
              icon="ri:progress-2-line"
              size={20}
              className="text-violet-600"
            />
            <span className="text-xs font-semibold">1/3</span>
          </div>

          <Icon
            icon="lucide:chevron-down"
            size={22}
            className="cursor-pointer text-neutral-500"
          />
        </div>
      </div>

      {/* body */}
      <div className="mt-6 rounded-[28px] bg-[#f3f3f3] p-6">
        <div className="flex flex-1 flex-col justify-between py-1">
          {steps.map((step) => (
            <div
              key={step.title}
              className="flex min-h-[64px] items-start gap-3"
            >
              {step.status === "pending" ? (
                <div className="h-10 w-10 rounded-full border border-neutral-200 bg-white shadow-sm">
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-5 w-5 rounded-full border border-neutral-300 animate-pulse" />
                  </div>
                </div>
              ) : step.status === "loading" ? (
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm">
                  <Icon
                    icon="tabler:loader"
                    size={16}
                    className="animate-spin text-neutral-500"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-white shadow-sm">
                  <Icon icon="material-symbols:check-rounded" size={16} />
                </div>
              )}

              <p className="pt-2 text-sm font-medium text-neutral-900 ">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* progress bar */}
      <div className="mt-8 flex items-center gap-4">
        <div className="relative h-14 flex-1 overflow-hidden rounded-full bg-white shadow-inner">
          <div className="absolute left-0 top-0 flex h-full w-[33%] items-center justify-between rounded-full bg-primary px-2">
            <div className="h-10 w-10 overflow-hidden rounded-full border-2 border-white bg-pink-600">
              <img
                src="/assets/images/profile.png"
                alt="profile"
                className="h-full w-full object-cover"
              />
            </div>

            <span className="pr-1 text-sm font-bold text-white">33%</span>
          </div>
        </div>

        <button className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-200 bg-[#f8f8f8] transition hover:bg-neutral-100">
          <Icon
            icon="lucide:move-up-right"
            size={22}
            className="text-neutral-700"
          />
        </button>
      </div>
    </div>
  );
}
