import {FormStep} from "../types/formTypes";
import {MixedStepRenderer} from "./MixedStepRender";
import {TileMultiRenderer} from "./TileRenderer";

export function StepRenderer({step}: {step: FormStep}) {
  switch (step?.inputType) {
    case "mixed":
      return <MixedStepRenderer step={step} />;

    case "tile-multi":
      return <TileMultiRenderer step={step} />;

    default:
      return null;
  }
}
