"use client";

import {useMemo, useRef, useState} from "react";
import {Icon, Modal, ModalRef} from "@mcc/ui";

type DayOption = {
  key: string; // ISO date string, used as the value
  dayLabel: string; // "Su", "Mo", ...
  date: number; // 1-31
};

const DAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

/**
 * Builds the selectable day range for rescheduling.
 * Starts the day AFTER today (today = 5th -> list starts at 6th) and runs
 * for `count` days, since you can't reschedule a class into today or the past.
 */
function getUpcomingDays(count = 7): DayOption[] {
  const days: DayOption[] = [];
  const start = new Date();
  start.setDate(start.getDate() + 1);

  for (let i = 0; i < count; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);

    days.push({
      key: current.toISOString().slice(0, 10),
      dayLabel: DAY_LABELS[current.getDay()],
      date: current.getDate(),
    });
  }

  return days;
}

const TIME_SLOTS: Record<"Morning" | "Afternoon" | "Evening", string[]> = {
  Morning: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"],
  Afternoon: ["12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM"],
  Evening: ["05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM", "07:00 PM"],
};

export default function RescheduleClass({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel?: () => void;
  onConfirm?: (selection: {date: string; time: string}) => void;
}) {
  const days = useMemo(() => getUpcomingDays(7), []);
  const [selectedDay, setSelectedDay] = useState<string>(days[0]?.key ?? "");
  const [selectedTime, setSelectedTime] = useState<string>("09:00 AM");

  const modalRef = useRef<ModalRef>(null);
  return (
    <Modal open={open} ref={modalRef} maxWidth=" max-w-[550px] ">
      <div className="w-full">
        <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gray-100">
          <Icon
            icon="mdi:calendar-clock-outline"
            size={22}
            className="text-gray-800"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-4">
          Reschedule class
        </h2>
        <p className="text-gray-500 mt-1">
          Select your preferred time and date.
        </p>

        <div className="mt-5 overflow-x-auto">
          <div className="flex w-max items-center gap-2 py-1">
            {days.map((day) => {
              const isSelected = day.key === selectedDay;
              return (
                <button
                  key={day.date}
                  onClick={() => setSelectedDay(day.key)}
                  className={`flex h-10 shrink-0 rounded-xl transition-all focus:ring-2 focus:ring-primary focus:border-0 focus:outline-0 ${
                    isSelected
                      ? "bg-primary"
                      : "bg-white border-transparent ring-2 ring-gray-100"
                  }`}
                >
                  <div
                    className={`flex w-8 items-center justify-center text-[11px] font-medium ${
                      isSelected ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {day.dayLabel}
                  </div>

                  <div
                    className={`flex w-10 items-center justify-center text-sm font-bold m-1 rounded-lg ${
                      isSelected ? "bg-white" : "bg-muted/20"
                    }`}
                  >
                    {day.date}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {(Object.keys(TIME_SLOTS) as (keyof typeof TIME_SLOTS)[]).map(
          (section) => (
            <div key={section} className="mt-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {section}
              </h3>
              <div className="flex flex-wrap gap-2">
                {TIME_SLOTS[section].map((time) => {
                  const isSelected = time === selectedTime;
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setSelectedTime(time)}
                      className={`flex items-center gap-1 px-3.5 py-2 rounded-full text-sm font-medium transition-colors focus:ring-2 focus:ring-primary focus:border-0 focus:outline-0 ${
                        isSelected
                          ? "bg-white border border-violet-600 text-gray-900"
                          : "bg-gray-100 text-gray-400 border border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {isSelected && (
                        <Icon
                          icon="mdi:check"
                          size={14}
                          className="text-violet-600"
                        />
                      )}
                      {time}
                    </button>
                  );
                })}
              </div>
            </div>
          ),
        )}

        <div className="flex items-center gap-3 mt-7">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-primary focus:border-0 focus:outline-0"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm?.({date: selectedDay, time: selectedTime})}
            className="flex-1 py-3 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors focus:ring-2 focus:ring-primary focus:border-0 focus:outline-0"
          >
            Confirm
          </button>
        </div>
      </div>
    </Modal>
  );
}
