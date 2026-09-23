import { FormStep } from "../types/formTypes";
import { MixedStepRenderer } from "./MixedStepRender";
import { TileMultiRenderer } from "./TileRenderer";
import { AvailabilityStepRenderer } from "./AvailabilityStepRenderer";

export function StepRenderer({ step, preview }: { step: FormStep; preview: boolean }) {
  switch (step?.inputType) {
    case "mixed":
      return <MixedStepRenderer step={step} preview={preview} />;

    case "tile-multi":
      return <TileMultiRenderer step={step} />;

    case "component":
      return <AvailabilityStepRenderer step={step} preview={preview} />;

    default:
      return null;
  }
}
