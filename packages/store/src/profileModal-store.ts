// stores/profile-progress.ts

import {create} from "zustand";
import {persist} from "zustand/middleware";

type ProfileProgressStore = {
  step: number;

  form: Partial<ProfileModalFormValues>;

  completedSteps: number[];

  setStep: (step: number) => void;

  saveForm: (data: Partial<ProfileModalFormValues>) => void;

  completeStep: (step: number) => void;

  reset: () => void;
};

export const useProfileProgressStore = create<ProfileProgressStore>()(
  persist(
    (set) => ({
      step: 1,

      form: {},

      completedSteps: [],

      setStep: (step) =>
        set({
          step,
        }),

      saveForm: (data) =>
        set((state) => ({
          form: {
            ...state.form,
            ...data,
          },
        })),

      completeStep: (step) =>
        set((state) => ({
          completedSteps: state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step],
        })),

      reset: () =>
        set({
          step: 1,
          form: {},
          completedSteps: [],
        }),
    }),
    {
      name: "profile-progress",
    },
  ),
);

type PhoneValue = {
  code: string;
  number: string;
};

export type ProfileModalFormValues = {
  fullName: string;
  email: string;
  phone: PhoneValue;
  gender: string;

  country: string;
  state: string;
  city: string;
  street: string;

  avatar?: AvatarValue;
};

export type AvatarValue = {
  type: "upload" | "preset";
  value: string;
};
