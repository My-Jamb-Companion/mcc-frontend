"use client";

import {useState} from "react";
import {ConfirmModal, showError, showSuccess} from "@mcc/ui";
import {useCityChangeRequests, useResolveCityChangeRequest} from "../hooks/useLocations";
import type {ApiCityChangeRequest, ApiCityOption} from "../services/locations.service";
import {pricingErrorMessage} from "../services/pricing.service";
import {Section} from "./Fields";

const place = (city: ApiCityOption | null) =>
  city ? `${city.name}, ${city.state}${city.country && city.country !== "Nigeria" ? `, ${city.country}` : ""}` : "No city set";
const when = (iso: string) => new Date(iso).toLocaleDateString("en-NG", {day: "numeric", month: "short", year: "numeric"});

export default function CityChangeRequests() {
  const [showResolved, setShowResolved] = useState(false);
  const {data, isLoading} = useCityChangeRequests(showResolved ? undefined : "pending");
  const pending = data?.filter((r) => r.status === "pending").length ?? 0;

  return (
    <Section
      title="City change requests"
      description="A student's city locks after their first paid purchase. These are students asking to change it — check the reason before approving, since a different city can mean a different price."
      aside={
        <button type="button" onClick={() => setShowResolved((v) => !v)}
          className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50">
          {showResolved ? "Show pending only" : "Include resolved"}
        </button>
      }
    >
      {isLoading ? (
        <p className="text-sm text-neutral-400">Loading…</p>
      ) : !data?.length ? (
        <p className="text-sm text-neutral-400">{showResolved ? "No requests yet." : "Nothing waiting for review."}</p>
      ) : (
        <>
          {!showResolved && pending > 0 && (
            <p className="mb-3 text-xs font-medium text-amber-700">{pending} waiting for review</p>
          )}
          <ul className="divide-y divide-neutral-100">
            {data.map((r) => <RequestRow key={r.request_id} request={r} />)}
          </ul>
        </>
      )}
    </Section>
  );
}

function RequestRow({request}: {request: ApiCityChangeRequest}) {
  const resolve = useResolveCityChangeRequest();
  const tierChanges = request.from_tier_name !== request.to_tier_name;

  const decide = (decision: "approve" | "reject") =>
    resolve.mutate(
      {requestId: request.request_id, decision},
      {
        onSuccess: () => showSuccess(decision === "approve" ? "City change approved" : "City change rejected"),
        onError: (err) => showError(pricingErrorMessage(err, "Couldn't resolve this request")),
      },
    );

  return (
    <li className="flex flex-wrap items-start justify-between gap-4 py-4">
      <div className="min-w-0 max-w-2xl">
        <p className="text-sm font-semibold text-neutral-900">
          {request.student_name ?? "Unnamed student"}
          {request.student_email && <span className="font-normal text-neutral-400"> · {request.student_email}</span>}
        </p>
        <p className="mt-1 text-sm text-neutral-700">
          {place(request.from_city)} <span className="text-neutral-400">→</span> {place(request.to_city)}
        </p>
        <p className={`mt-0.5 text-xs ${tierChanges ? "font-medium text-amber-700" : "text-neutral-400"}`}>
          {tierChanges
            ? `Changes tier: ${request.from_tier_name ?? "none"} → ${request.to_tier_name}`
            : `Same tier (${request.to_tier_name}) — no price difference`}
        </p>
        <p className="mt-2 text-sm text-neutral-600 break-words">&ldquo;{request.reason}&rdquo;</p>
        <p className="mt-1 text-xs text-neutral-400">
          Requested {when(request.created_at)}
          {request.resolved_at && ` · ${request.status} by ${request.resolved_by_name ?? "an admin"} on ${when(request.resolved_at)}`}
        </p>
      </div>
      {request.status === "pending" ? (
        <div className="flex shrink-0 gap-2">
          <ConfirmModal
            title="Approve city change"
            description={`Moves this student to ${place(request.to_city)}. ${tierChanges ? `Their future purchases will be priced at ${request.to_tier_name}. ` : ""}Their city stays locked.`}
            confirmText="Approve"
            variant="default"
            onConfirm={() => decide("approve")}
            trigger={
              <button type="button" disabled={resolve.isPending}
                className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
                Approve
              </button>
            }
          />
          <ConfirmModal
            title="Reject city change"
            description="The student keeps their current city."
            confirmText="Reject"
            variant="danger"
            onConfirm={() => decide("reject")}
            trigger={
              <button type="button" disabled={resolve.isPending}
                className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">
                Reject
              </button>
            }
          />
        </div>
      ) : (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
          request.status === "approved" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-600"}`}>
          {request.status}
        </span>
      )}
    </li>
  );
}
