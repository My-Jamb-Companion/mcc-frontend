"use client";

import { useCaptureAcquisitionSource } from "@/src/features/enrollment/acquisitionSource";

/** Records where the visitor came from (UTM/referrer) so sign-up can be attributed. Draws nothing. */
export function CaptureAcquisitionSource() {
  useCaptureAcquisitionSource();
  return null;
}
