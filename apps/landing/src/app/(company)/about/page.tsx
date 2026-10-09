import type { Metadata } from "next";
import { CompanyPage, H2, P } from "@/src/features/company/CompanyPage";
import { ABOUT } from "@/src/features/company/pages";
import { pageMetadata } from "@/src/features/seo";

// Refreshed with the home page, so the header and footer follow what an admin publishes.
export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "About us",
  description: ABOUT.summary,
  path: "/about",
});

export default async function Page() {
  return (
    <CompanyPage title={ABOUT.title} summary={ABOUT.summary}>
      {ABOUT.sections.map((section) => (
        <section key={section.heading} style={{ marginBottom: 32 }}>
          <H2>{section.heading}</H2>
          {section.paragraphs?.map((p, i) => <P key={i}>{p}</P>)}
          {section.bullets && (
            <ul style={{ margin: "0 0 12px", paddingLeft: 22, fontSize: 17, lineHeight: 1.7, color: "#262626" }}>
              {section.bullets.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
            </ul>
          )}
        </section>
      ))}
    </CompanyPage>
  );
}
