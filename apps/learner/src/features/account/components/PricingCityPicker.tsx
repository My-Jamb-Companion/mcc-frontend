"use client";

import {useMemo, useState} from "react";
import {Icon, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useCityOptions, useMyCity, useRequestCityChange, useSetMyCity} from "../hooks/usePricingCity";
import type {ApiCityOption} from "../services/pricingCity.service";

const selectClass =
  "w-full rounded-md border border-muted/20 bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-NG", {day: "numeric", month: "long", year: "numeric"});

/**
 * The student's city, chosen from MCC's list rather than typed.
 *
 * Replaces the old free-text city: typed cities couldn't be matched reliably
 * ("Lagos", "lagos", "Ikeja"). Before any purchase the student can change it
 * freely; afterwards it's locked and a change goes to an admin for review.
 */
export default function PricingCityPicker() {
  const {data: mine, isLoading: mineLoading} = useMyCity();
  const {data: options, isLoading: optionsLoading} = useCityOptions();

  if (mineLoading || optionsLoading) {
    return <p className="text-sm text-muted">Loading your city…</p>;
  }
  if (!mine || !options) {
    return <p className="text-sm text-danger">Your city couldn&apos;t be loaded. Refresh to try again.</p>;
  }

  if (mine.pending_request) {
    return (
      <div className="flex flex-col gap-3">
        <CurrentCity city={mine.city} locked />
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
          <Icon icon="ph:hourglass" className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            You asked to change your city to{" "}
            <strong>{mine.pending_request.to_city.name}, {mine.pending_request.to_city.state}</strong> on{" "}
            {formatDate(mine.pending_request.created_at)}. An admin will review it soon.
          </span>
        </div>
      </div>
    );
  }

  return mine.locked ? (
    <LockedCity key={mine.city?.city_id} city={mine.city} options={options} />
  ) : (
    <ChooseCity key={mine.city?.city_id ?? "none"} city={mine.city} options={options} />
  );
}

function CurrentCity({city, locked}: {city: ApiCityOption | null; locked?: boolean}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {locked && <Icon icon="ph:lock-simple" className="h-4 w-4 text-muted" />}
      <span className="text-muted">Your city:</span>
      <span className="font-semibold text-foreground">
        {city ? `${city.name}, ${city.state}` : "Not set"}
      </span>
    </div>
  );
}

function CitySelects({
  options,
  state,
  cityId,
  onState,
  onCity,
  idPrefix,
}: {
  options: ApiCityOption[];
  state: string;
  cityId: string;
  onState: (state: string) => void;
  onCity: (cityId: string) => void;
  idPrefix: string;
}) {
  const states = useMemo(() => [...new Set(options.map((c) => c.state))].sort(), [options]);
  // Named towns alphabetically, then the state's "Other town" choice last.
  const cities = useMemo(
    () =>
      options
        .filter((c) => c.state === state)
        .sort((a, b) => Number(a.is_other) - Number(b.is_other) || a.name.localeCompare(b.name)),
    [options, state],
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-state`} className="text-start text-sm">Your State</label>
        <select id={`${idPrefix}-state`} value={state} className={selectClass}
          onChange={(e) => { onState(e.target.value); onCity(""); }}>
          <option value="">Choose your state</option>
          {states.map((s) => <option key={s} value={s}>{s === "FCT" ? "FCT (Abuja)" : s}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor={`${idPrefix}-city`} className="text-start text-sm">Your City or Town</label>
        <select id={`${idPrefix}-city`} value={cityId} disabled={!state} className={selectClass}
          onChange={(e) => onCity(e.target.value)}>
          <option value="">{state ? "Choose your city or town" : "Choose a state first"}</option>
          {cities.map((c) => <option key={c.city_id} value={c.city_id}>{c.name}</option>)}
        </select>
      </div>
    </div>
  );
}

function ChooseCity({city, options}: {city: ApiCityOption | null; options: ApiCityOption[]}) {
  const [state, setState] = useState(city?.state ?? "");
  const [cityId, setCityId] = useState(city?.city_id ?? "");
  const save = useSetMyCity();
  const changed = !!cityId && cityId !== city?.city_id;

  const submit = () =>
    save.mutate(cityId, {
      onSuccess: () => showSuccess("City saved"),
      onError: (err) => showError(extractApiError(err, "Your city couldn't be saved. Try again.")),
    });

  return (
    <div className="flex flex-col gap-3">
      <CitySelects options={options} state={state} cityId={cityId} onState={setState} onCity={setCityId} idPrefix="city" />
      <p className="text-xs text-muted">
        Choose where you live. Course and exam prices are set for your city, so it locks after your
        first purchase, and changes after that are reviewed. If your town isn&apos;t listed, choose
        &ldquo;Other town&rdquo; in your state.
      </p>
      {changed && (
        <button type="button" onClick={submit} disabled={save.isPending}
          className="w-fit rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60">
          {save.isPending ? "Saving…" : "Save city"}
        </button>
      )}
    </div>
  );
}

function LockedCity({city, options}: {city: ApiCityOption | null; options: ApiCityOption[]}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState("");
  const [cityId, setCityId] = useState("");
  const [reason, setReason] = useState("");
  const request = useRequestCityChange();
  const canSubmit = !!cityId && cityId !== city?.city_id && reason.trim().length >= 3;

  const submit = () =>
    request.mutate(
      {cityId, reason: reason.trim()},
      {
        onSuccess: () => showSuccess("Change requested. An admin will review it."),
        onError: (err) => showError(extractApiError(err, "Your request couldn't be sent. Try again.")),
      },
    );

  return (
    <div className="flex flex-col gap-3">
      <CurrentCity city={city} locked />
      <p className="text-xs text-muted">
        Your city is locked because you&apos;ve paid for a course or exam program, since prices are set
        for where you live.
      </p>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)} className="w-fit text-sm font-semibold text-primary underline">
          Moved? Request a change
        </button>
      ) : (
        <div className="flex flex-col gap-3 rounded-lg border border-muted/20 p-4">
          <CitySelects options={options} state={state} cityId={cityId} onState={setState} onCity={setCityId} idPrefix="change" />
          <div className="flex flex-col gap-2">
            <label htmlFor="city-change-reason" className="text-start text-sm">Why has your city changed?</label>
            <textarea id="city-change-reason" rows={2} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. My family moved to Ibadan in August"
              className="w-full rounded-md border border-muted/20 bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={submit} disabled={!canSubmit || request.isPending}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-50">
              {request.isPending ? "Sending…" : "Send request"}
            </button>
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2 text-sm text-muted hover:text-foreground">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
