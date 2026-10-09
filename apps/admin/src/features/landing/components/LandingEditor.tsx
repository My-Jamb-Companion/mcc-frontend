"use client";

import {BLOCK_BY_TYPE, BLOCKS, SITE_FIELDS, defaultContent, normalizeContent} from "@mcc/landing-content";
import {blockSubtitle, blockTitle} from "../helper/editor";
import PageEditor from "./PageEditor";
import type {PageEditorConfig} from "./PageEditor";
import PreviewPane from "./PreviewPane";

export const HOME_CONFIG: PageEditorConfig = {
  page: "home",
  area: "landing",
  heading: "Landing page",
  subtitle: "Edit the public home page. Changes reach visitors only when you publish.",
  siteTitle: "Header, footer and search",
  siteHint: "Name, menu, footer links, SEO",
  siteFields: SITE_FIELDS,
  blocks: BLOCKS,
  blockByType: BLOCK_BY_TYPE,
  startContent: (state) => normalizeContent(state.draft?.content ?? state.published?.content ?? defaultContent()),
  describe: (block) => ({title: blockTitle(block), subtitle: blockSubtitle(block)}),
  sectionNoun: "section",
  notPublishedLabel: "Not published yet: visitors see the built-in design",
  publishTitle: "Publish the landing page?",
  publishBody: "Visitors will see this version within about a minute. The page it replaces stays in the history, so you can go back.",
  publishedMessage: "Published. Visitors will see it within about a minute.",
  Preview: PreviewPane,
};

/** The landing page editor: the home page's sections, header and footer. */
export default function LandingEditor() {
  return <PageEditor config={HOME_CONFIG} />;
}
