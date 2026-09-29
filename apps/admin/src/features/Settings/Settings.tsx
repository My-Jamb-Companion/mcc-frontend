"use client";

import Configurations from "./AiSettings/Configurations";

/**
 * The Users table used to live here as a second tab -- moved to its own
 * page (apps/admin/src/features/Users/Users.tsx, at /users) with its own
 * sidebar icon, since account management isn't really a "setting". This
 * page is Configurations-only now, so the tab toggle went with it.
 */
export default function Settings() {
  return (
    <div className="h-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
      </div>

      <Configurations />
    </div>
  );
}
