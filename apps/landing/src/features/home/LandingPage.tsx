import type { ComponentType } from "react";
import { visibleBlocks } from "@mcc/landing-content";
import type { FieldData, LandingContent } from "@mcc/landing-content";
import "./landing.css";
import { Brainy } from "./blocks/Brainy";
import { Courses } from "./blocks/Courses";
import { Cta } from "./blocks/Cta";
import { Exams } from "./blocks/Exams";
import { Faq } from "./blocks/Faq";
import { Hero } from "./blocks/Hero";
import { Humans } from "./blocks/Humans";
import { Parents } from "./blocks/Parents";
import { Practice } from "./blocks/Practice";
import { Proof } from "./blocks/Proof";
import { Steps } from "./blocks/Steps";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type BlockView = ComponentType<{ data: FieldData; blockId: string }>;

/** Block type to the component that draws it. A type missing here is skipped, so content from a newer editor can't break an older site. */
const VIEWS: Record<string, BlockView> = {
  hero: Hero, exams: Exams, steps: Steps, brainy: Brainy, practice: Practice, humans: Humans,
  courses: Courses, parents: Parents, proof: Proof, faq: Faq, cta: Cta,
};

/** The whole landing page, drawn from its content. Used by the live site and by the admin's live preview. */
export function LandingPage({ content }: { content: LandingContent }) {
  return (
    <div className="mcc-root" style={{ width: "100%", background: "#fff", color: "#171717" }}>
      <SiteHeader site={content.site} />
      <main>
        {visibleBlocks(content).map((block) => {
          const View = VIEWS[block.type];
          return View ? <View key={block.id} data={block.data} blockId={block.id} /> : null;
        })}
      </main>
      <SiteFooter site={content.site} />
    </div>
  );
}
