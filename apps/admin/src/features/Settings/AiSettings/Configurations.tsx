import AiModelCard from "./AiModelCard";
import ChangeHistory from "./ChangeHistory";

/**
 * Admin-editable platform settings that used to only be changeable via a
 * backend redeploy. AI model switching is the first one; more settings can
 * be added as their own Section here later.
 */
export default function Configurations() {
  return (
    <div className="flex flex-col gap-6">
      <AiModelCard />
      <ChangeHistory />
    </div>
  );
}
