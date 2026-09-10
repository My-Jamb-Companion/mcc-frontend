import { apiClient } from "@mcc/api";

export interface AvailabilitySlot {
  id: string;
  day_of_week: number; // ISO 8601: 1=Monday..7=Sunday
  start_time: string;
  end_time: string;
}

export const getAvailability = async (): Promise<AvailabilitySlot[]> => {
  const res = await apiClient.get<{ success: boolean; data: { slots: AvailabilitySlot[] } }>(
    "/teacher/availability",
  );
  return res.data.data.slots;
};

export const createAvailabilitySlot = async (input: {
  day_of_week: number;
  start_time: string;
  end_time: string;
}): Promise<{ id: string }> => {
  const res = await apiClient.post<{ success: boolean; data: { id: string } }>(
    "/teacher/availability",
    input,
  );
  return res.data.data;
};

export const deleteAvailabilitySlot = async (slotId: string): Promise<void> => {
  await apiClient.delete(`/teacher/availability/${slotId}`);
};
