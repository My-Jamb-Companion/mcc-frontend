"use client";

import {Icon, Modal} from "@mcc/ui";

export default function CancelClass({
  open,
  onKeepClass,
  onConfirmCancel,
}: {
  open: boolean;
  onKeepClass?: () => void;
  onConfirmCancel?: () => void;
}) {
  return (
    <Modal open={open} onClose={onKeepClass}>
      <div className="w-full">
        <div className="w-11 h-11 flex items-center justify-center rounded-2xl bg-gray-100">
          <Icon
            icon="mdi:calendar-remove-outline"
            size={22}
            className="text-gray-800"
          />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-4">Cancel class</h2>

        <p className="text-gray-500 mt-3 leading-relaxed">
          Are you sure you want to cancel your class for the week? you will not
          be able to reschedule for the week if you do.
        </p>

        <p className="text-gray-500 mt-3 leading-relaxed">
          However you class for next week still continues.
        </p>

        <div className="flex items-center gap-3 mt-6">
          <button
            type="button"
            onClick={onConfirmCancel}
            className="flex-1 py-3 rounded-full border border-gray-200 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
          >
            Yes, cancel
          </button>
          <button
            type="button"
            onClick={onKeepClass}
            className="flex-1 py-3 rounded-full bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
          >
            No, do not cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}
