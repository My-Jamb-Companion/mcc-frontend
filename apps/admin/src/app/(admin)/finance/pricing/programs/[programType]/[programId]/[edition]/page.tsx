import {notFound} from "next/navigation";
import CostTemplateEditor from "@/src/features/Pricing/CostTemplateEditor";
import {asEdition} from "@/src/features/Pricing/helper/templateForm";

export const metadata = {
  title: "Cost template",
};

const PROGRAM_TYPES = ["course", "exam"];

export default async function page({
  params,
}: {
  params: Promise<{programType: string; programId: string; edition: string}>;
}) {
  // In this Next.js version route params arrive as a Promise.
  const {programType, programId, edition} = await params;
  // Links from before the formats existed say "standard" or "premium"; asEdition maps them.
  const initial = asEdition(edition);
  if (!PROGRAM_TYPES.includes(programType) || !initial) notFound();

  return (
    <CostTemplateEditor
      programType={programType as "course" | "exam"}
      programId={decodeURIComponent(programId)}
      initialEdition={initial}
    />
  );
}
