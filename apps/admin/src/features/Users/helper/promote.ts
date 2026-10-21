/** Roles whose accounts can be made admins: plain accounts. A teacher or CRA holds records of its own (courses,
 * payouts, students), so the server refuses them and they need a different email for an admin account. */
export const PROMOTABLE_ROLES = ["student", "parent"] as const;

export const canMakeAdmin = (user: {role: string; is_active: boolean}): boolean =>
  user.is_active && (PROMOTABLE_ROLES as readonly string[]).includes(user.role);
