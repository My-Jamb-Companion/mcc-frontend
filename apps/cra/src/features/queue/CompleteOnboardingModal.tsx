"use client";

import { Controller, FormInputs, useForm } from "@mcc/features";
import { Button, Modal } from "@mcc/ui";
import { QueueItem } from "./queue.service";
import { useCompleteOnboarding } from "./useQueue";

const DAYS = [
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
  { label: "Sunday", value: "7" },
];

interface FormInputsShape {
  weekly_day_of_week: string;
  weekly_start_time: string;
  duration_minutes: string;
}

export function CompleteOnboardingModal({
  item,
  onClose,
}: {
  item: QueueItem | null;
  onClose: () => void;
}) {
  const completeOnboarding = useCompleteOnboarding();
  const { register, control, handleSubmit, formState, reset } = useForm<FormInputsShape>({
    defaultValues: { duration_minutes: "60" },
  });

  function handleClose() {
    reset();
    onClose();
  }

  function onSubmit(data: FormInputsShape) {
    if (!item) return;
    completeOnboarding.mutate(
      {
        assignmentId: item.assignment_id,
        payload: {
          weekly_day_of_week: Number(data.weekly_day_of_week),
          weekly_start_time: data.weekly_start_time,
          duration_minutes: Number(data.duration_minutes) || 60,
        },
      },
      { onSuccess: handleClose },
    );
  }

  return (
    <Modal open={!!item} title="Complete onboarding" maxWidth="max-w-md">
      {item && (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Record the weekly day and time <strong>{item.student_name ?? item.student_email}</strong> agreed
            to for their recurring 1:1 teacher session.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="weekly_day_of_week"
              control={control}
              rules={{ required: "Required" }}
              render={({ field }) => (
                <FormInputs
                  label="Day"
                  type="select"
                  options={DAYS}
                  value={field.value}
                  onChange={field.onChange}
                  errors={formState.errors.weekly_day_of_week}
                />
              )}
            />
            <FormInputs
              label="Start time"
              type="text"
              placeholder="18:00"
              registration={register("weekly_start_time", {
                required: "Required",
                pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: "HH:MM, 24-hour" },
              })}
              errors={formState.errors.weekly_start_time}
            />
            <FormInputs
              label="Duration (minutes)"
              type="text"
              placeholder="60"
              registration={register("duration_minutes", {
                pattern: { value: /^\d+$/, message: "Numbers only" },
              })}
              errors={formState.errors.duration_minutes}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" width="fit" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" width="fit" loading={completeOnboarding.isPending}>
                Complete onboarding
              </Button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
}
