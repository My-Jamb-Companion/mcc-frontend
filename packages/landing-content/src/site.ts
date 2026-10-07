import type { Field, FieldData } from "./fields";

const text = (key: string, label: string, help?: string, maxLength = 200): Field => ({ kind: "text", key, label, help, maxLength });
const area = (key: string, label: string, help?: string, maxLength = 1000): Field => ({ kind: "textarea", key, label, help, maxLength });
const url = (key: string, label: string, help?: string): Field => ({ kind: "url", key, label, help });
const image = (key: string, label: string, help?: string): Field => ({ kind: "image", key, label, help });

const LINK_FIELDS: Field[] = [text("label", "Text", undefined, 60), url("href", "Link", "Leave empty to show the text without a link.")];

/** Page-wide settings: the header, the footer and the search listing. */
export const SITE_FIELDS: Field[] = [
  text("brand_name", "Brand name", "Shown next to the logo. It's a placeholder for now, so it lives in one place."),
  text("brand_short", "Short brand name", "Used in the header on small screens.", 12),
  image("logo_url", "Logo image (optional)", "Leave empty to use the round purple letter."),
  text("logo_letter", "Logo letter", "The letter shown when there is no logo image.", 2),
  {
    kind: "list", key: "nav_links", label: "Header menu", itemLabel: "Menu item", titleKey: "label", max: 7,
    fields: LINK_FIELDS,
  },
  text("login_label", "Log-in label"),
  url("login_href", "Log-in link"),
  text("cta_label", "Sign-up button label"),
  text("cta_label_short", "Sign-up button label on small screens", undefined, 24),
  url("cta_href", "Sign-up button link"),
  text("parent_label", "Parent link label (small-screen menu)"),
  url("parent_href", "Parent link"),
  area("footer_tagline", "Footer sentence"),
  text("teach_label", "Teacher box: title"),
  text("teach_body", "Teacher box: description"),
  url("teach_href", "Teacher box link", "/go/teacher/signup opens the teacher app."),
  {
    kind: "list", key: "footer_columns", label: "Footer columns", itemLabel: "Column", titleKey: "title", max: 5,
    fields: [
      text("title", "Column title", undefined, 40),
      { kind: "list", key: "links", label: "Links", itemLabel: "Link", titleKey: "label", fields: LINK_FIELDS, max: 8 },
    ],
  },
  { kind: "list", key: "socials", label: "Social links", itemLabel: "Link", titleKey: "label", fields: LINK_FIELDS, max: 8,
    help: "Only links with an address are shown." },
  text("copyright", "Copyright line"),
  text("currency_note", "Currency note (optional)", "A small pill in the footer, e.g. \"₦ NGN\". Leave empty to hide it.", 60),
  text("seo_title", "Search listing: title", "The browser tab and search result title.", 70),
  area("seo_description", "Search listing: description", "Shown under the title in search results.", 200),
  image("og_image_url", "Sharing image", "Shown when the page is shared in chats and social media. 1200 × 630 works best."),
];

export const SITE_DEFAULTS: FieldData = {
  brand_name: "My Course Companion",
  brand_short: "MCC",
  logo_url: "",
  logo_letter: "m",
  nav_links: [
    { label: "Exam prep", href: "#exams" },
    { label: "Courses", href: "#courses" },
    { label: "Brainy", href: "#brainy" },
    { label: "For parents", href: "#parents" },
    { label: "Teach with us", href: "#teach" },
  ],
  login_label: "Log in",
  login_href: "/login",
  cta_label: "Get started free",
  cta_label_short: "Start free",
  cta_href: "/signup",
  parent_label: "I'm a parent",
  parent_href: "#parents",
  footer_tagline: "Exam prep, new skills, an AI study companion and real teachers, all in one place. Made in Nigeria for students everywhere.",
  teach_label: "Teach on MCC",
  teach_body: "Are you a teacher? Apply to join us.",
  teach_href: "/go/teacher/signup",
  footer_columns: [
    { title: "LEARN", links: [
      { label: "Exam prep", href: "#exams" }, { label: "Courses", href: "#courses" },
      { label: "Brainy", href: "#brainy" }, { label: "Live classes", href: "#teachers" } ] },
    { title: "PARENTS", links: [
      { label: "Parent app", href: "#parents" }, { label: "Safety", href: "#parents" }, { label: "Pricing", href: "#faq" } ] },
    { title: "COMPANY", links: [
      { label: "About", href: "" }, { label: "Contact", href: "#contact" },
      { label: "Teach on MCC", href: "/go/teacher/signup" }, { label: "Help centre", href: "" } ] },
    { title: "LEGAL", links: [
      { label: "Terms", href: "" }, { label: "Privacy", href: "" }, { label: "Refund policy", href: "" } ] },
  ],
  socials: [
    { label: "Instagram", href: "" }, { label: "TikTok", href: "" }, { label: "X", href: "" },
    { label: "YouTube", href: "" }, { label: "WhatsApp", href: "" },
  ],
  copyright: "© 2026 My Course Companion",
  currency_note: "",
  seo_title: "My Course Companion: exam prep, courses and an AI study buddy",
  seo_description: "Prep for JAMB, WAEC, NECO, IGCSE and more with lessons, practice tests, live classes and Brainy, your AI study buddy.",
  og_image_url: "",
};
