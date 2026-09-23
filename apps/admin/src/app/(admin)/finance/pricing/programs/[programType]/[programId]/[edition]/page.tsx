import {notFound} from "next/navigation";
import CostTemplateEditor from "@/src/features/Pricing/CostTemplateEditor";

export const metadata = {
  title: "Cost template",
};

const EDITIONS: Record<string, string[]> = {course: ["standard", "premium"], exam: ["standard"]};

export default async function page({
  params,
}: {
  params: Promise<{programType: string; programId: string; edition: string}>;
}) {
  // In this Next.js version route params arrive as a Promise.
  const {programType, programId, edition} = await params;
  if (!EDITIONS[programType]?.includes(edition)) notFound();

  return (
    <CostTemplateEditor
      programType={programType as "course" | "exam"}
      programId={decodeURIComponent(programId)}
      edition={edition as "standard" | "premium"}
    />
  );
}
