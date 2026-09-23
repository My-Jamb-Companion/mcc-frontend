"use client";

import { Controller, FormInputs, useForm } from "@mcc/features";
import { Button } from "@mcc/ui";
import {
  useAvailability,
  useCreateAvailabilitySlot,
  useDeleteAvailabilitySlot,
} from "./useAvailability";

const DAYS = [
  { label: "Monday", value: "1" },
  { label: "Tuesday", value: "2" },
  { label: "Wednesday", value: "3" },
  { label: "Thursday", value: "4" },
  { label: "Friday", value: "5" },
  { label: "Saturday", value: "6" },
  { label: "Sunday", value: "7" },
];

const DAY_LABEL: Record<number, string> = Object.fromEntries(
  DAYS.map((d) => [Number(d.value), d.label]),
);

interface SlotFormInputs {
  day_of_week: string;
  start_time: string;
  end_time: string;
}

export const AvailabilityManager = () => {
  const { data: slots, isLoading } = useAvailability();
  const createSlot = useCreateAvailabilitySlot();
  const deleteSlot = useDeleteAvailabilitySlot();
  const { register, control, handleSubmit, formState, reset } = useForm<SlotFormInputs>();

  const onSubmit = (data: SlotFormInputs) => {
    createSlot.mutate(
      {
        day_of_week: Number(data.day_of_week),
        start_time: data.start_time,
        end_time: data.end_time,
      },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end rounded-lg border border-muted/20 p-4"
      >
        <Controller
          name="day_of_week"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <FormInputs
              label="Day"
              type="select"
              options={DAYS}
              value={field.value}
              onChange={field.onChange}
              errors={formState.errors.day_of_week}
            />
          )}
        />
        <FormInputs
          label="Start time"
          type="text"
          placeholder="18:00"
          registration={register("start_time", {
            required: "Required",
            pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: "HH:MM, 24-hour" },
          })}
          errors={formState.errors.start_time}
        />
        <FormInputs
          label="End time"
          type="text"
          placeholder="19:00"
          registration={register("end_time", {
            required: "Required",
            pattern: { value: /^([01]\d|2[0-3]):[0-5]\d$/, message: "HH:MM, 24-hour" },
          })}
          errors={formState.errors.end_time}
        />
        <Button type="submit" loading={createSlot.isPending} width="full">
          Add slot
        </Button>
      </form>

      {isLoading ? (
        <p className="text-sm text-muted">Loading your availability…</p>
      ) : !slots || slots.length === 0 ? (
        <p className="text-sm text-muted">
          No recurring availability set yet. Add a weekly slot above so the matching
          engine knows when you&apos;re free for 1:1 sessions.
        </p>
      ) : (
        <ul className="space-y-2">
          {slots.map((slot) => (
            <li
              key={slot.id}
              className="flex items-center justify-between rounded-lg border border-muted/20 px-4 py-3"
            >
              <span className="text-sm">
                {DAY_LABEL[slot.day_of_week] ?? slot.day_of_week} ·{" "}
                {slot.start_time.slice(0, 5)}–{slot.end_time.slice(0, 5)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                width="fit"
                loading={deleteSlot.isPending && deleteSlot.variables === slot.id}
                onClick={() => deleteSlot.mutate(slot.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
