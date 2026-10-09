import type { Metadata } from "next";
import { CompanyPage, H2, P } from "@/src/features/company/CompanyPage";
import { CONTACT } from "@/src/features/company/pages";
import { contactChannels } from "@/src/features/company/contact";
import { pageMetadata } from "@/src/features/seo";
import { LEARNER_URL, PARENT_URL, TEACHER_URL } from "@/src/config";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Contact us",
  description: CONTACT.summary,
  path: "/contact",
});

const linkStyle = { color: "#4F0FB0", fontWeight: 600 } as const;

export default async function Page() {
  const channels = contactChannels();

  return (
    <CompanyPage title={CONTACT.title} summary={CONTACT.summary}>
      {channels.length > 0 && (
        <section style={{ marginBottom: 32 }}>
          <H2>Write to us</H2>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10 }}>
            {channels.map((c) => (
              <li key={c.label} style={{ fontSize: 17, lineHeight: 1.6 }}>
                <span style={{ color: "#525252" }}>{c.label}: </span>
                <a href={c.href} style={linkStyle}>{c.value}</a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section style={{ marginBottom: 32 }}>
        <H2>Students</H2>
        <P>
          Already learning with us? <a href={`${LEARNER_URL}/login`} style={linkStyle}>Log in</a> and message your course
          coordinator from the page of the course or program you enrolled in. Payment questions? Your receipts are in your wallet.
        </P>
      </section>

      <section style={{ marginBottom: 32 }}>
        <H2>Parents</H2>
        <P>
          <a href={`${PARENT_URL}/login`} style={linkStyle}>Log in to the parent app</a> to see your children&apos;s progress and every
          payment you have made, with receipts.
        </P>
      </section>

      <section style={{ marginBottom: 32 }}>
        <H2>Teachers</H2>
        <P>
          Want to teach with us? <a href="/go/teacher/signup" style={linkStyle}>Apply here</a>. Already teaching?{" "}
          <a href={`${TEACHER_URL}/login`} style={linkStyle}>Log in to the teacher app</a>.
        </P>
      </section>

      {channels.length === 0 && (
        <section style={{ marginBottom: 32 }}>
          <H2>Anything else</H2>
          <P>
            We&apos;re setting up our public support channels. For now, please reach us through your account in the app that fits
            you above.
          </P>
        </section>
      )}
    </CompanyPage>
  );
}
