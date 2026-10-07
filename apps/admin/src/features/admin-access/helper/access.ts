/**
 * What the signed-in admin may use, and how that maps onto the console's pages.
 * The server decides and enforces (app/core/admin_access.py); this only decides
 * what to SHOW, so an admin isn't offered pages that would refuse them.
 */
export type AccessLevel = "none" | "view" | "manage";
export type PermissionMap = Record<string, AccessLevel>;

export interface MyAccess {
  user_id: string;
  level: "super" | "limited";
  is_super: boolean;
  preset: string;
  preset_label: string;
  permissions: PermissionMap;
}

/** Names for the console's areas (the access form takes its own from the server). */
export const AREA_LABELS: Record<string, string> = {
  analytics: "Dashboard & performance",
  courses: "Courses",
  exams: "Exam programs",
  question_bank: "Question Bank & quizzes",
  landing: "Landing page",
  students: "Students",
  teachers: "Teachers",
  cra: "CRAs",
  users: "Users & onboarding insights",
  live_sessions: "Live sessions",
  messaging: "Messaging",
  moderation: "Moderation",
  finance: "Finance & pricing",
  ai: "AI tools & settings",
};

/** Console route -> the area it needs, longest prefix first. "/dashboard" itself is the home page. */
const ROUTE_AREAS: [string, string][] = [
  ["/dashboard/performance", "analytics"],
  ["/dashboard/live-sessions", "live_sessions"],
  ["/dashboard/ai-studio", "ai"],
  ["/dashboard/teachers", "teachers"],
  ["/dashboard/cra", "cra"],
  ["/dashboard/exam-program", "exams"],
  ["/dashboard/courses", "courses"],
  ["/dashboard/categories", "courses"],
  ["/dashboard/question-bank", "question_bank"],
  ["/dashboard/landing", "landing"],
  ["/dashboard/students", "students"],
  ["/finance", "finance"],
  ["/messaging", "messaging"],
  ["/moderation", "moderation"],
  ["/users", "users"],
  ["/settings", "ai"],
];

/** The area a console path belongs to; null for the home page and anything unmapped. */
export function areaForPath(pathname: string | null | undefined): string | null {
  if (!pathname) return null;
  const hit = ROUTE_AREAS.find(([prefix]) => pathname === prefix || pathname.startsWith(prefix + "/"));
  return hit ? hit[1] : null;
}

export const levelFor = (access: MyAccess | undefined, area: string): AccessLevel =>
  access?.is_super ? "manage" : (access?.permissions[area] ?? "none");

export const canView = (access: MyAccess | undefined, area: string): boolean => levelFor(access, area) !== "none";
export const canManage = (access: MyAccess | undefined, area: string): boolean => levelFor(access, area) === "manage";

/** Whether a page may be opened. Unknown access (not loaded, or the server can't say) shows everything:
 * the server still refuses what it must, so this never decides security. */
export function canOpen(access: MyAccess | undefined, pathname: string | null | undefined): boolean {
  const area = areaForPath(pathname);
  return !access || area === null || canView(access, area);
}

/** The first console page this admin can open, to send them somewhere useful. */
export function firstAllowedHref(access: MyAccess | undefined, candidates: string[]): string | null {
  return candidates.find((href) => canOpen(access, href)) ?? null;
}

const labelOf = (area: string) => AREA_LABELS[area] ?? area;

/** "Manage Courses, Exam programs · View Teachers": a one-line summary of an admin's areas. */
export function summarizeAccess(permissions: PermissionMap, isSuper = false): string {
  if (isSuper) return "Everything, including admin accounts";
  const named = (level: AccessLevel) =>
    Object.entries(permissions)
      .filter(([, l]) => l === level)
      .map(([area]) => labelOf(area));
  const parts: string[] = [];
  const manage = named("manage");
  const view = named("view");
  if (manage.length) parts.push(`Manage ${manage.join(", ")}`);
  if (view.length) parts.push(`View ${view.join(", ")}`);
  return parts.join(" · ") || "No areas";
}

/** Only the areas actually granted, as the API takes them. */
export function toApiPermissions(permissions: PermissionMap): Record<string, "view" | "manage"> {
  const out: Record<string, "view" | "manage"> = {};
  for (const [area, level] of Object.entries(permissions)) {
    if (level === "view" || level === "manage") out[area] = level;
  }
  return out;
}

export const sameAreas = (a: PermissionMap, b: PermissionMap): boolean => {
  const grant = (m: PermissionMap) => JSON.stringify(Object.entries(toApiPermissions(m)).sort());
  return grant(a) === grant(b);
};

export interface PresetLike {
  key: string;
  is_super: boolean;
  permissions: Record<string, string>;
}

/** Which template these areas amount to: the one they match exactly, else "custom". */
export function presetFor(permissions: PermissionMap, presets: PresetLike[]): string {
  const match = presets.find((p) => !p.is_super && sameAreas(permissions, p.permissions as PermissionMap));
  return match ? match.key : "custom";
}

/** The access form's starting point for a template: its areas, or nothing for custom. */
export function permissionsForPreset(key: string, presets: PresetLike[]): PermissionMap {
  const preset = presets.find((p) => p.key === key);
  return preset && !preset.is_super ? {...(preset.permissions as PermissionMap)} : {};
}

/** Whether the form can be submitted: a super admin needs no areas, anyone else needs at least one. */
export const hasValidAccess = (preset: string, permissions: PermissionMap): boolean =>
  preset === "super_admin" || Object.keys(toApiPermissions(permissions)).length > 0;
