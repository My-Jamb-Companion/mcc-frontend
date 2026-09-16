"use client";

import {useState} from "react";
import {useLocationAudit} from "../hooks/useLocations";
import type {ApiLocationAuditEntry} from "../services/locations.service";
import {Section} from "./Fields";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-NG", {day: "numeric", month: "short", hour: "numeric", minute: "2-digit"});

const describe = (e: ApiLocationAuditEntry): string => {
  const d = e.details as Record<string, unknown>;
  switch (e.action) {
    case "tiers_updated":
      return `Updated the tiers (weighted multiplier ${Number(d.weighted_multiplier).toFixed(3)})`;
    case "city_added":
      return `Added ${d.name}, ${d.state}`;
    case "city_updated": {
      const changes = Object.keys((d.changes as Record<string, unknown>) ?? {});
      const what = changes.map((c) => (c === "tier_id" ? "tier" : c === "is_active" ? "availability" : c)).join(", ");
      return `Changed ${d.name}, ${d.state} (${what})`;
    }
    case "cities_assigned":
      return `Moved ${d.updated} ${d.updated === 1 ? "city" : "cities"} to a new tier`;
    case "city_change_approved":
      return `Approved a student's city change${d.from_tier !== d.to_tier ? ` (${d.from_tier ?? "none"} → ${d.to_tier})` : ""}`;
    case "city_change_rejected":
      return "Rejected a student's city change";
    default:
      return e.action;
  }
};

export default function LocationAudit() {
  const [open, setOpen] = useState(false);
  const {data, isLoading} = useLocationAudit();

  return (
    <Section
      title="Change history"
      description="Every change to tiers, cities and city change requests, with who made it and why."
      aside={
        <button type="button" onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          {open ? "Hide" : "Show"}
        </button>
      }
    >
      {!open ? null : isLoading ? (
        <p className="text-sm text-neutral-400">Loading…</p>
      ) : !data?.length ? (
        <p className="text-sm text-neutral-400">No changes recorded yet.</p>
      ) : (
        <ul className="divide-y divide-neutral-100">
          {data.map((e) => (
            <li key={e.audit_id} className="py-3">
              <p className="text-sm text-neutral-900">{describe(e)}</p>
              {e.reason && <p className="mt-0.5 text-sm text-neutral-600 break-words">&ldquo;{e.reason}&rdquo;</p>}
              <p className="mt-0.5 text-xs text-neutral-400">{e.actor_name ?? "Unknown admin"} · {when(e.created_at)}</p>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
