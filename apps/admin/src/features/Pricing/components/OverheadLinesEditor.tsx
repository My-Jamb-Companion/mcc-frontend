import {Icon} from "@mcc/ui";
import {
  FormErrors,
  newLine,
  OVERHEAD_CATEGORIES,
  OverheadLineForm,
} from "../helper/pricingForm";
import type {OverheadCategory, OverheadCurrency} from "../services/pricing.service";

const naira = new Intl.NumberFormat("en-NG", {maximumFractionDigits: 0});

export default function OverheadLinesEditor({
  lines,
  onChange,
  lineNgn,
  errors,
  showVatColumnNote,
  readOnly,
}: {
  lines: OverheadLineForm[];
  onChange: (lines: OverheadLineForm[]) => void;
  lineNgn: Record<string, number>;
  errors: FormErrors;
  showVatColumnNote: boolean;
  readOnly?: boolean;
}) {
  const update = (key: string, patch: Partial<OverheadLineForm>) =>
    onChange(lines.map((line) => (line.key === key ? {...line, ...patch} : line)));

  const cell = "rounded-lg border border-neutral-200 bg-white px-2.5 py-2 text-sm text-neutral-900 outline-none focus:border-violet-500 disabled:bg-neutral-50";

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="text-sm uppercase tracking-wide text-neutral-600">
              <th className="pb-2 pr-2 font-medium">Category</th>
              <th className="pb-2 pr-2 font-medium">Description</th>
              <th className="pb-2 pr-2 font-medium">Annual amount</th>
              <th className="pb-2 pr-2 font-medium">Billed in</th>
              <th className="pb-2 pr-2 font-medium" title="Whether MCC pays VAT on this cost">
                VAT paid on it
              </th>
              <th className="pb-2 pr-2 text-right font-medium">Per year in ₦</th>
              <th className="pb-2" aria-label="Remove" />
            </tr>
          </thead>
          <tbody>
            {lines.map((line, index) => {
              const error = errors[`line-${line.key}`];
              return (
                <tr key={line.key} className="align-top">
                  <td className="py-1.5 pr-2">
                    <select
                      aria-label={`Category for cost ${index + 1}`}
                      value={line.category}
                      disabled={readOnly}
                      onChange={(e) => update(line.key, {category: e.target.value as OverheadCategory})}
                      className={`${cell} w-44`}
                    >
                      <option value="">Choose…</option>
                      {OVERHEAD_CATEGORIES.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      aria-label={`Description for cost ${index + 1}`}
                      value={line.label}
                      readOnly={readOnly}
                      placeholder="e.g. Annual legal retainer"
                      onChange={(e) => update(line.key, {label: e.target.value})}
                      className={`${cell} w-full min-w-44`}
                    />
                    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
                  </td>
                  <td className="py-1.5 pr-2">
                    <input
                      aria-label={`Annual amount for cost ${index + 1}`}
                      inputMode="decimal"
                      value={line.amount}
                      readOnly={readOnly}
                      placeholder="0"
                      onChange={(e) => update(line.key, {amount: e.target.value})}
                      className={`${cell} w-36 tabular-nums`}
                    />
                  </td>
                  <td className="py-1.5 pr-2">
                    <select
                      aria-label={`Currency for cost ${index + 1}`}
                      value={line.currency}
                      disabled={readOnly}
                      onChange={(e) => update(line.key, {currency: e.target.value as OverheadCurrency})}
                      className={`${cell} w-24`}
                    >
                      <option value="NGN">₦ NGN</option>
                      <option value="USD">$ USD</option>
                    </select>
                  </td>
                  <td className="py-1.5 pr-2 text-center">
                    <input
                      type="checkbox"
                      aria-label={`VAT paid on cost ${index + 1}`}
                      checked={line.vatable}
                      disabled={readOnly}
                      onChange={(e) => update(line.key, {vatable: e.target.checked})}
                      className="mt-2.5 h-4 w-4 accent-violet-600"
                    />
                  </td>
                  <td className="py-1.5 pr-2 pt-3.5 text-right tabular-nums text-neutral-900">
                    ₦{naira.format(lineNgn[line.key] ?? 0)}
                  </td>
                  <td className="py-1.5 pt-2">
                    {!readOnly && lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => onChange(lines.filter((l) => l.key !== line.key))}
                        aria-label={`Remove cost ${index + 1}`}
                        className="rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-red-600"
                      >
                        <Icon icon="ph:trash" size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!readOnly && (
        <button
          type="button"
          onClick={() => onChange([...lines, newLine()])}
          className="inline-flex w-fit items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50"
        >
          <Icon icon="ph:plus" size={14} />
          Add a cost
        </button>
      )}
      {showVatColumnNote && (
        <p className="text-sm text-neutral-700">
          Courses are VAT exempt, so VAT paid on ticked costs can&apos;t be reclaimed and is included
          in their naira figure.
        </p>
      )}
    </div>
  );
}
