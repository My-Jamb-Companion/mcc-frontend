// import { sharedConfig } from "@mcc/tooling/tailwind/tailwind.config";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "../../packages/ui/**/*.{ts,tsx}",
  ],
  ...sharedConfig,
};