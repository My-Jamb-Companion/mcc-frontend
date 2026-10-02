export type GroupKind = "research" | "assignment" | "exam";

export interface SidebarGroup {
  id: string;
  name: string;
  /** Set on the three default groups; null on groups the user created. */
  kind: GroupKind | null;
}

export interface GroupableSession {
  id: string;
  mode: string;
  groupId?: string;
  pinned?: boolean;
  pinnedAt?: Date;
}

// Shown only if the groups endpoint can't be reached (for instance the
// frontend deploying ahead of the backend), so chats never vanish from the
// sidebar. The ids are synthetic and never sent to the server.
export const LEGACY_GROUPS: SidebarGroup[] = [
  {id: "legacy-research", name: "Research", kind: "research"},
  {id: "legacy-assignment", name: "Assignment", kind: "assignment"},
  {id: "legacy-exam", name: "Exam Study", kind: "exam"},
];

export const isLegacyGroup = (id: string): boolean => id.startsWith("legacy-");

/**
 * Which group a chat is listed under: its own group if that group still
 * exists, otherwise the default group for its mode (every chat created before
 * groups existed, and any chat whose group is unknown to this client).
 */
export function resolveGroupId<T extends GroupableSession>(
  session: T,
  groups: SidebarGroup[],
): string | undefined {
  if (session.groupId && groups.some((g) => g.id === session.groupId)) return session.groupId;
  return groups.find((g) => g.kind === session.mode)?.id ?? groups[0]?.id;
}

export function sessionsByGroup<T extends GroupableSession>(
  sessions: T[],
  groups: SidebarGroup[],
): Map<string, T[]> {
  const byGroup = new Map<string, T[]>(groups.map((g) => [g.id, []]));
  for (const session of sessions) {
    const id = resolveGroupId(session, groups);
    if (id) byGroup.get(id)?.push(session);
  }
  return byGroup;
}

/** Pinned chats first (most recently pinned on top); the rest are left for date bucketing. */
export function splitPinned<T extends GroupableSession>(sessions: T[]): {pinned: T[]; rest: T[]} {
  const pinned = sessions
    .filter((s) => s.pinned)
    .sort((a, b) => (b.pinnedAt?.getTime() ?? 0) - (a.pinnedAt?.getTime() ?? 0));
  return {pinned, rest: sessions.filter((s) => !s.pinned)};
}
