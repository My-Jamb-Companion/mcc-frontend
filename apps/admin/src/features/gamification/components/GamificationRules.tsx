"use client";

import {useMemo, useState} from "react";
import {Icon, showSuccess} from "@mcc/ui";
import {useMyAccess} from "@/src/features/admin-access/hooks/useAdminAccess";
import {canManage, MyAccess} from "@/src/features/admin-access/helper/access";
import {NumberField, Section} from "@/src/features/Pricing/components/Fields";
import {
  useActiveGamificationConfig,
  useGamificationVersion,
  useSaveGamificationConfig,
} from "../hooks/useGamification";
import {
  ApiGamificationVersion,
  GoalPeriod,
  RewardType,
  gamificationErrorMessage,
} from "../services/gamification.service";
import {
  GOAL_PERIODS,
  MAX_PACKS,
  MAX_STREAKS,
  RulesForm,
  describeGoal,
  fingerprint,
  fromApi,
  newPack,
  newStreak,
  toInput,
  validate,
} from "../helper/rulesForm";
import VersionHistory from "./VersionHistory";

const REWARD_LABEL: Record<RewardType, string> = {points: "points", gems: "gems", silver: "silver"};

const PERIOD_TITLE: Record<GoalPeriod, string> = {daily: "Daily goal", weekly: "Weekly goal", monthly: "Monthly goal"};
const PERIOD_UNIT: Record<GoalPeriod, string> = {
  daily: "practice sessions",
  weekly: "passed practice tests",
  monthly: "points earned",
};

export default function GamificationRules() {
  const active = useActiveGamificationConfig();
  const [viewing, setViewing] = useState<number | null>(null);
  const [seed, setSeed] = useState<ApiGamificationVersion | null>(null);
  const past = useGamificationVersion(viewing);
  const {data: access} = useMyAccess();
  const mayManage = !access || canManage(access as MyAccess, "gamification");

  const current = active.data ?? null;
  const activeVersion = current?.version_number ?? null;

  const header = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Gamification rules</h1>
        <p className="mt-1 max-w-2xl text-base text-neutral-700">
          What students earn and how: points for each action, goals, streaks, the weekly prize, the referral reward
          and gem packs. Saving creates a new version that applies from then on. What students have already earned
          doesn&apos;t change.
        </p>
      </div>
      <span className={`rounded-full px-3 py-1.5 text-base font-medium ${activeVersion === null ? "bg-neutral-100 text-neutral-700" : "bg-green-50 text-green-700"}`}>
        {activeVersion === null ? "Using built-in defaults" : `Active: version ${activeVersion}`}
      </span>
    </div>
  );

  if (active.isLoading) {
    return (
      <section className="flex flex-col gap-6 pb-10">
        {header}
        <p className="text-base text-neutral-600">Loading the rules…</p>
      </section>
    );
  }

  if (active.isError || !current) {
    return (
      <section className="flex flex-col gap-6 pb-10">
        {header}
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-base text-red-700">
          {gamificationErrorMessage(active.error, "Couldn't load the gamification rules.")}{" "}
          <button type="button" onClick={() => active.refetch()} className="font-semibold underline">Try again</button>
        </div>
      </section>
    );
  }

  const viewingPast = viewing !== null;
  const source = viewingPast ? past.data ?? null : seed ?? current;
  const editorKey = viewingPast ? `view-${viewing}` : `edit-${activeVersion ?? "defaults"}-${seed?.version_number ?? "active"}`;

  return (
    <section className="flex flex-col gap-6 pb-10">
      {header}

      {!mayManage && (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-base text-neutral-800">
          You can view these rules but not change them.
        </div>
      )}

      {viewingPast && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-100 bg-violet-50 px-5 py-4 text-base text-violet-900">
          <span>Viewing version {viewing}, which is no longer active. It can&apos;t be edited.</span>
          <div className="flex gap-2">
            {past.data && mayManage && (
              <button type="button" onClick={() => { setSeed(past.data); setViewing(null); }}
                className="rounded-full bg-violet-600 px-4 py-2 font-medium text-white hover:bg-violet-700">
                Start a new version from this one
              </button>
            )}
            <button type="button" onClick={() => setViewing(null)}
              className="rounded-full border border-violet-200 bg-white px-4 py-2 font-medium text-violet-900 hover:bg-violet-50">
              Back to active version
            </button>
          </div>
        </div>
      )}

      {!viewingPast && seed && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-amber-50 px-5 py-4 text-base text-amber-900">
          <span>Editing from version {seed.version_number}. Saving creates version {(activeVersion ?? 0) + 1}.</span>
          <button type="button" onClick={() => setSeed(null)}
            className="rounded-full border border-amber-200 bg-white px-4 py-2 font-medium hover:bg-amber-100">
            Discard and edit the active version
          </button>
        </div>
      )}

      {viewingPast && past.isLoading ? (
        <p className="text-base text-neutral-600">Loading version {viewing}…</p>
      ) : (
        <RulesEditor
          key={editorKey}
          source={source}
          active={current}
          readOnly={viewingPast || !mayManage}
          onSaved={() => setSeed(null)}
          onReloadLatest={() => { setSeed(null); active.refetch(); }}
        />
      )}

      <VersionHistory
        activeVersion={activeVersion}
        viewing={viewing}
        onView={(n) => { setViewing(n); window.scrollTo({top: 0, behavior: "smooth"}); }}
      />
    </section>
  );
}

function RewardSelect({id, value, onChange, readOnly}: {id: string; value: RewardType; onChange: (v: RewardType) => void; readOnly: boolean}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-base font-medium text-neutral-900">Reward type</label>
      <select
        id={id}
        value={value}
        disabled={readOnly}
        onChange={(e) => onChange(e.target.value as RewardType)}
        className="rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-violet-500 disabled:opacity-60"
      >
        {(Object.keys(REWARD_LABEL) as RewardType[]).map((t) => <option key={t} value={t}>{REWARD_LABEL[t]}</option>)}
      </select>
    </div>
  );
}

function RulesEditor({
  source, active, readOnly, onSaved, onReloadLatest,
}: {
  source: ApiGamificationVersion | null;
  active: ApiGamificationVersion;
  readOnly: boolean;
  onSaved: () => void;
  onReloadLatest: () => void;
}) {
  const [form, setForm] = useState<RulesForm>(() => fromApi((source ?? active).config));
  const [reason, setReason] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [saveError, setSaveError] = useState<{message: string; conflict: boolean} | null>(null);
  const save = useSaveGamificationConfig();

  const errors = useMemo(() => validate(form), [form]);
  const hasErrors = Object.keys(errors).length > 0;
  const activeFingerprint = useMemo(() => fingerprint(fromApi(active.config)), [active]);
  const unchanged = !hasErrors && fingerprint(form) === activeFingerprint;

  const patch = (changes: Partial<RulesForm>) => setForm((prev) => ({...prev, ...changes}));
  const setGoal = (period: GoalPeriod, changes: Partial<RulesForm["goals"][GoalPeriod]>) =>
    setForm((prev) => ({...prev, goals: {...prev.goals, [period]: {...prev.goals[period], ...changes}}}));
  const err = (key: string) => (showErrors ? errors[key] : undefined);

  const handleSave = () => {
    setSaveError(null);
    if (hasErrors) { setShowErrors(true); return; }
    if (reason.trim().length < 3) { setSaveError({message: "Say briefly why these rules are changing.", conflict: false}); return; }
    save.mutate(toInput(form, active.version_number, reason), {
      onSuccess: (saved) => { showSuccess(`Saved as version ${saved.version_number}`); setReason(""); onSaved(); },
      onError: (error) => {
        const status = (error as {response?: {status?: number}})?.response?.status;
        setSaveError({message: gamificationErrorMessage(error, "Couldn't save the rules."), conflict: status === 409});
      },
    });
  };

  const f = (id: string, label: string, key: string, value: string, set: (v: string) => void, extra: {hint?: string; suffix?: string} = {}) => (
    <NumberField id={id} label={label} value={value} onChange={set} error={err(key)} readOnly={readOnly} {...extra} />
  );

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
      <div className="flex min-w-0 flex-col gap-6">
        <Section title="Quizzes and practice" description="Points for finishing a quiz, test or practice session with a good enough score. The daily cap stops the same effort being farmed.">
          <div className="grid gap-4 sm:grid-cols-3">
            {f("quizPoints", "Points per session", "quizPoints", form.quizPoints, (v) => patch({quizPoints: v}))}
            {f("quizPass", "Score needed", "quizPass", form.quizPass, (v) => patch({quizPass: v}), {suffix: "%"})}
            {f("quizCap", "Most per student per day", "quizCap", form.quizCap, (v) => patch({quizCap: v}), {hint: "In points"})}
          </div>
        </Section>

        <Section title="Courses and exam programs" description="A small award each time a student moves further through a course or program, and a one-time bonus (with the certificate) for finishing.">
          <div className="grid gap-4 sm:grid-cols-3">
            {f("stepPoints", "Points per step forward", "stepPoints", form.stepPoints, (v) => patch({stepPoints: v}))}
            {f("stepCap", "Most per student per day", "stepCap", form.stepCap, (v) => patch({stepCap: v}), {hint: "In points"})}
            {f("completionPoints", "Completion bonus", "completionPoints", form.completionPoints, (v) => patch({completionPoints: v}), {hint: "Once per course or program"})}
          </div>
        </Section>

        <Section title="Goals" description="Every student gets a daily, weekly and monthly goal. Completing one makes a reward they claim. What a goal counts is fixed; its target and reward are yours. A goal already in progress keeps the target it started with.">
          <div className="flex flex-col gap-6">
            {GOAL_PERIODS.map((period) => (
              <div key={period} className="rounded-xl border border-neutral-100 p-4">
                <h3 className="text-base font-bold text-neutral-900">{PERIOD_TITLE[period]}</h3>
                <p className="text-sm text-neutral-600">{describeGoal(period, form.goals[period].target)}</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  {f(`${period}-target`, `Target (${PERIOD_UNIT[period]})`, `goals.${period}.target`, form.goals[period].target, (v) => setGoal(period, {target: v}))}
                  <RewardSelect id={`${period}-type`} value={form.goals[period].rewardType} onChange={(v) => setGoal(period, {rewardType: v})} readOnly={readOnly} />
                  {f(`${period}-reward`, "Reward amount", `goals.${period}.rewardAmount`, form.goals[period].rewardAmount, (v) => setGoal(period, {rewardAmount: v}))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Streaks" description="A streak is days in a row with the daily goal completed. Each milestone pays a reward once.">
          <div className="flex flex-col gap-3">
            {errors.streaks && showErrors && <p className="text-sm text-red-600">{errors.streaks}</p>}
            {form.streaks.map((m, i) => (
              <div key={m.key} className="grid items-end gap-3 rounded-xl border border-neutral-100 p-3 sm:grid-cols-[90px_130px_110px_1fr_auto]">
                {f(`streak-days-${m.key}`, "Days", `streaks.${i}.days`, m.days, (v) => patch({streaks: form.streaks.map((s, j) => j === i ? {...s, days: v} : s)}))}
                <RewardSelect id={`streak-type-${m.key}`} value={m.rewardType} onChange={(v) => patch({streaks: form.streaks.map((s, j) => j === i ? {...s, rewardType: v} : s)})} readOnly={readOnly} />
                {f(`streak-amount-${m.key}`, "Amount", `streaks.${i}.rewardAmount`, m.rewardAmount, (v) => patch({streaks: form.streaks.map((s, j) => j === i ? {...s, rewardAmount: v} : s)}))}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor={`streak-title-${m.key}`} className="text-base font-medium text-neutral-900">Title (optional)</label>
                  <input
                    id={`streak-title-${m.key}`}
                    value={m.title}
                    readOnly={readOnly}
                    placeholder={`${m.days || "N"} Day Streak!`}
                    onChange={(e) => patch({streaks: form.streaks.map((s, j) => j === i ? {...s, title: e.target.value} : s)})}
                    className="rounded-xl border border-neutral-200 px-3 py-2.5 text-base text-neutral-900 outline-none focus:border-violet-500"
                  />
                  {err(`streaks.${i}.title`) && <p className="text-sm text-red-600">{err(`streaks.${i}.title`)}</p>}
                </div>
                {!readOnly && (
                  <button type="button" aria-label={`Remove the ${m.days || "new"}-day milestone`}
                    onClick={() => patch({streaks: form.streaks.filter((_, j) => j !== i)})}
                    className="mb-1 rounded-full p-2 text-neutral-600 hover:bg-neutral-100">
                    <Icon icon="ph:trash" size={18} />
                  </button>
                )}
              </div>
            ))}
            {!readOnly && form.streaks.length < MAX_STREAKS && (
              <button type="button" onClick={() => patch({streaks: [...form.streaks, newStreak()]})}
                className="self-start rounded-full border border-neutral-200 px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50">
                Add a milestone
              </button>
            )}
          </div>
        </Section>

        <Section title="Weekly leaderboard prize" description="One prize per student per week for being ahead of enough of the week's active learners. It needs at least three active learners to be meaningful.">
          <div className="grid max-w-xl gap-4 sm:grid-cols-2">
            {f("prizeGems", "Prize", "prizeGems", form.prizeGems, (v) => patch({prizeGems: v}), {hint: "In gems. 0 turns the prize off."})}
            {f("prizePercentile", "Must be ahead of at least", "prizePercentile", form.prizePercentile, (v) => patch({prizePercentile: v}), {suffix: "% of learners"})}
          </div>
        </Section>

        <Section title="Referral reward" description="What a student earns when a friend they invited signs up and verifies their email.">
          <div className="max-w-xs">
            {f("referralGems", "Reward", "referralGems", form.referralGems, (v) => patch({referralGems: v}), {hint: "In gems, claimable once per friend"})}
          </div>
        </Section>

        <Section title="Gem packs" description="The packs students can buy in their wallet, and the largest amount a custom purchase can be. The price per gem is fixed.">
          <div className="flex flex-col gap-4">
            {errors.packs && showErrors && <p className="text-sm text-red-600">{errors.packs}</p>}
            <div className="flex flex-wrap gap-3">
              {form.packs.map((p, i) => (
                <div key={p.key} className="flex items-end gap-1">
                  <div className="w-28">
                    {f(`pack-${p.key}`, `Pack ${i + 1}`, `packs.${i}`, p.gems, (v) => patch({packs: form.packs.map((x, j) => j === i ? {...x, gems: v} : x)}), {suffix: "gems"})}
                  </div>
                  {!readOnly && form.packs.length > 1 && (
                    <button type="button" aria-label={`Remove pack ${i + 1}`}
                      onClick={() => patch({packs: form.packs.filter((_, j) => j !== i)})}
                      className="mb-1 rounded-full p-2 text-neutral-600 hover:bg-neutral-100">
                      <Icon icon="ph:trash" size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {!readOnly && form.packs.length < MAX_PACKS && (
              <button type="button" onClick={() => patch({packs: [...form.packs, newPack()]})}
                className="self-start rounded-full border border-neutral-200 px-4 py-2 text-base font-medium text-neutral-900 hover:bg-neutral-50">
                Add a pack
              </button>
            )}
            <div className="max-w-xs">
              {f("customMax", "Largest custom purchase", "customMax", form.customMax, (v) => patch({customMax: v}), {suffix: "gems"})}
            </div>
          </div>
        </Section>
      </div>

      <aside className="flex flex-col gap-4 xl:sticky xl:top-6">
        {!readOnly ? (
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
            <label htmlFor="change-reason" className="text-base font-semibold text-neutral-900">Why are these changing?</label>
            <textarea
              id="change-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Raised the daily cap so keen students can earn more"
              className="mt-2 w-full rounded-xl border border-neutral-200 p-3 text-base text-neutral-900 outline-none focus:border-violet-500"
            />
            {showErrors && hasErrors && <p className="mt-2 text-sm text-red-600">Some values need fixing before this can be saved.</p>}
            {saveError && (
              <div className="mt-2 text-sm text-red-600">
                <p>{saveError.message}</p>
                {saveError.conflict && <button type="button" onClick={onReloadLatest} className="mt-1 font-semibold underline">Load the latest version</button>}
              </div>
            )}
            <button type="button" onClick={handleSave} disabled={save.isPending || unchanged}
              className="mt-4 w-full rounded-full bg-violet-600 px-4 py-2.5 text-base font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-50">
              {save.isPending ? "Saving…" : unchanged ? "No changes to save" : `Save as version ${(active.version_number ?? 0) + 1}`}
            </button>
            <p className="mt-2 text-sm text-neutral-600">Takes effect within about 30 seconds. Rewards students already have don&apos;t change.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-100 bg-white p-6 text-base text-neutral-700 shadow-sm">
            Read only{source?.change_reason ? ` · "${source.change_reason}"` : ""}
          </div>
        )}
      </aside>
    </div>
  );
}
