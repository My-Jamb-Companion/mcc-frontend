"use client";

import {useMemo, useState} from "react";
import {ConfirmModal, Icon, showError, showSuccess} from "@mcc/ui";
import {useAssignCities, useCities, useCreateCity, useTierSet, useUpdateCity} from "../hooks/useLocations";
import {NIGERIAN_STATES, type ApiPricingCity, type ApiTier} from "../services/locations.service";
import {pricingErrorMessage} from "../services/pricing.service";
import {Section} from "./Fields";

// "" in a tier select means "use the default tier" (tier_id: null on the API).
const DEFAULT = "";

export default function CityList() {
  const {data: cities, isLoading} = useCities({});
  const {data: tierSet} = useTierSet();
  const tiers = tierSet?.tiers ?? [];
  const defaultTier = tiers.find((t) => t.is_default);

  const [state, setState] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [query, setQuery] = useState("");
  const [showInactive, setShowInactive] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkTier, setBulkTier] = useState<string>(DEFAULT);

  const assign = useAssignCities();

  // ~125 rows: filtering in the browser keeps it instant and avoids a request per keystroke.
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (cities ?? []).filter(
      (c) =>
        (showInactive || c.is_active) &&
        (!state || c.state === state) &&
        (!tierFilter || c.effective_tier_id === tierFilter) &&
        (!q || c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q)),
    );
  }, [cities, state, tierFilter, query, showInactive]);

  const allVisibleSelected = visible.length > 0 && visible.every((c) => selected.has(c.city_id));
  const toggleAll = () =>
    setSelected((prev) => {
      const next = new Set(prev);
      visible.forEach((c) => (allVisibleSelected ? next.delete(c.city_id) : next.add(c.city_id)));
      return next;
    });

  const applyBulk = () =>
    assign.mutate(
      {city_ids: [...selected], tier_id: bulkTier || null},
      {
        onSuccess: ({updated}) => {
          const target = bulkTier ? tiers.find((t) => t.tier_id === bulkTier)?.name : "the default tier";
          showSuccess(updated ? `Moved ${updated} ${updated === 1 ? "city" : "cities"} to ${target}` : "Those cities were already there");
          setSelected(new Set());
        },
        onError: (err) => showError(pricingErrorMessage(err, "Couldn't move those cities")),
      },
    );

  const control = "rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm outline-none focus:border-violet-500";

  return (
    <Section
      title="Cities"
      description="The list students choose their city from. Cities without a tier use the default. Students never see tiers."
      aside={<AddCity />}
    >
      <div className="flex flex-wrap items-center gap-2">
        <input aria-label="Search cities" placeholder="Search city or state" value={query}
          onChange={(e) => setQuery(e.target.value)} className={`${control} w-56`} />
        <select aria-label="Filter by state" value={state} onChange={(e) => setState(e.target.value)} className={control}>
          <option value="">All states</option>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select aria-label="Filter by tier" value={tierFilter} onChange={(e) => setTierFilter(e.target.value)} className={control}>
          <option value="">All tiers</option>
          {tiers.map((t) => <option key={t.tier_id} value={t.tier_id}>{t.name}</option>)}
        </select>
        <label className="ml-1 flex items-center gap-2 text-sm text-neutral-600">
          <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} className="h-4 w-4 accent-violet-600" />
          Show deactivated
        </label>
      </div>

      {selected.size > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-violet-50 px-4 py-2.5 text-sm text-violet-900">
          <span className="font-medium">{selected.size} selected</span>
          <span>· Move to</span>
          <TierSelect tiers={tiers} defaultTier={defaultTier} value={bulkTier} onChange={setBulkTier} className={control} label="Tier for selected cities" />
          <button type="button" onClick={applyBulk} disabled={assign.isPending}
            className="rounded-full bg-violet-600 px-4 py-1.5 font-medium text-white hover:bg-violet-700 disabled:opacity-50">
            {assign.isPending ? "Moving…" : "Move"}
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="ml-auto text-violet-700 underline">
            Clear
          </button>
        </div>
      )}

      <div className="mt-3 overflow-x-auto">
        {isLoading ? (
          <p className="py-6 text-sm text-neutral-400">Loading cities…</p>
        ) : (
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-neutral-100 text-xs uppercase tracking-wide text-neutral-400">
                <th className="w-8 pb-2">
                  <input type="checkbox" aria-label="Select all shown cities" checked={allVisibleSelected} onChange={toggleAll} className="h-4 w-4 accent-violet-600" />
                </th>
                <th className="pb-2 pr-3 font-medium">City</th>
                <th className="pb-2 pr-3 font-medium">State</th>
                <th className="pb-2 pr-3 font-medium">Tier</th>
                <th className="pb-2 pr-3 text-right font-medium">Students</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {visible.map((city) => (
                <CityRow
                  key={city.city_id}
                  city={city}
                  tiers={tiers}
                  defaultTier={defaultTier}
                  selected={selected.has(city.city_id)}
                  onSelect={(on) => setSelected((prev) => {
                    const next = new Set(prev);
                    if (on) next.add(city.city_id); else next.delete(city.city_id);
                    return next;
                  })}
                  control={control}
                />
              ))}
            </tbody>
          </table>
        )}
        {!isLoading && visible.length === 0 && <p className="py-6 text-sm text-neutral-400">No cities match these filters.</p>}
      </div>
      <p className="mt-2 text-xs text-neutral-400">
        Showing {visible.length} of {cities?.length ?? 0} cities
      </p>
    </Section>
  );
}

function TierSelect({tiers, defaultTier, value, onChange, className, label}: {
  tiers: ApiTier[];
  defaultTier?: ApiTier;
  value: string;
  onChange: (v: string) => void;
  className: string;
  label: string;
}) {
  return (
    <select aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} className={className}>
      <option value={DEFAULT}>Default{defaultTier ? ` (${defaultTier.name})` : ""}</option>
      {tiers.map((t) => <option key={t.tier_id} value={t.tier_id}>{t.name}</option>)}
    </select>
  );
}

function CityRow({city, tiers, defaultTier, selected, onSelect, control}: {
  city: ApiPricingCity;
  tiers: ApiTier[];
  defaultTier?: ApiTier;
  selected: boolean;
  onSelect: (on: boolean) => void;
  control: string;
}) {
  const update = useUpdateCity();

  const moveTo = (value: string) =>
    update.mutate(
      {cityId: city.city_id, input: {tier_id: value || null}},
      {
        onSuccess: (saved) => showSuccess(`${city.name} now uses ${saved.tier_id ? saved.effective_tier_name : "the default tier"}`),
        onError: (err) => showError(pricingErrorMessage(err, "Couldn't move this city")),
      },
    );

  const setActive = (isActive: boolean) =>
    update.mutate(
      {cityId: city.city_id, input: {is_active: isActive}},
      {
        onSuccess: () => showSuccess(isActive ? `${city.name} is back in the list` : `${city.name} removed from the list`),
        onError: (err) => showError(pricingErrorMessage(err, "Couldn't update this city")),
      },
    );

  return (
    <tr className={city.is_active ? "" : "text-neutral-400"}>
      <td className="py-2">
        <input type="checkbox" aria-label={`Select ${city.name}`} checked={selected} onChange={(e) => onSelect(e.target.checked)} className="h-4 w-4 accent-violet-600" />
      </td>
      <td className="py-2 pr-3">
        <span className={city.is_active ? "font-medium text-neutral-900" : ""}>{city.name}</span>
        {!city.is_active && <span className="ml-2 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">Deactivated</span>}
      </td>
      <td className="py-2 pr-3">{city.state}</td>
      <td className="py-2 pr-3">
        <TierSelect tiers={tiers} defaultTier={defaultTier} value={city.tier_id ?? DEFAULT}
          onChange={moveTo} className={`${control} py-1.5`} label={`Tier for ${city.name}`} />
      </td>
      <td className="py-2 pr-3 text-right tabular-nums">{city.student_count}</td>
      <td className="py-2 text-right">
        {city.is_other ? null : city.is_active ? (
          <ConfirmModal
            title={`Remove ${city.name} from the list?`}
            description={
              city.student_count > 0
                ? `${city.student_count} ${city.student_count === 1 ? "student has" : "students have"} chosen it and will keep it, but no one else can pick it.`
                : "Students won't be able to choose it. You can bring it back later."
            }
            confirmText="Remove"
            variant="danger"
            onConfirm={() => setActive(false)}
            trigger={
              <button type="button" className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600" aria-label={`Remove ${city.name}`}>
                <Icon icon="ph:eye-slash" size={16} />
              </button>
            }
          />
        ) : (
          <button type="button" onClick={() => setActive(true)} className="text-xs font-medium text-violet-700 underline">
            Restore
          </button>
        )}
      </td>
    </tr>
  );
}

function AddCity() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [state, setState] = useState("");
  const create = useCreateCity();

  const submit = () => {
    if (!name.trim() || !state) return;
    create.mutate(
      {name: name.trim(), state},
      {
        onSuccess: (city) => {
          showSuccess(`${city.name}, ${city.state} added`);
          setName("");
          setState("");
          setOpen(false);
        },
        onError: (err) => showError(pricingErrorMessage(err, "Couldn't add this city")),
      },
    );
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50">
        <Icon icon="ph:plus" size={14} />
        Add a city
      </button>
    );
  }

  const control = "rounded-lg border border-neutral-200 px-2.5 py-2 text-sm outline-none focus:border-violet-500";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input aria-label="New city name" placeholder="City or town" value={name} onChange={(e) => setName(e.target.value)} className={`${control} w-44`} />
      <select aria-label="New city state" value={state} onChange={(e) => setState(e.target.value)} className={control}>
        <option value="">State…</option>
        {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <button type="button" onClick={submit} disabled={!name.trim() || !state || create.isPending}
        className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50">
        {create.isPending ? "Adding…" : "Add"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="text-sm text-neutral-500 underline">Cancel</button>
    </div>
  );
}
