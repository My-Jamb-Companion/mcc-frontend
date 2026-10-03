import {Icon} from "@mcc/ui";
import type {ChosenResponse} from "../helper/practiceFeedback";

/**
 * What a student reads after checking a Practice answer: whether it was right,
 * the teacher's response for each option they chose (right or wrong alike), the
 * right answer when they missed it, and the explanation.
 */
export default function PracticeFeedbackCard({
  correct,
  chosen,
  correctAnswers,
  explanation,
}: {
  correct: boolean;
  chosen: ChosenResponse[];
  correctAnswers: string[];
  explanation?: string | null;
}) {
  return (
    <div
      role="status"
      className={`mt-5 rounded-2xl border p-5 ${
        correct ? "border-green-300 bg-green-50 text-green-900" : "border-amber-300 bg-amber-50 text-amber-900"
      }`}
    >
      <p className="mb-2 flex items-center gap-2 text-sm font-bold">
        <Icon icon={correct ? "ph:check-circle-fill" : "ph:lightbulb-fill"} size={18} />
        {correct ? "That's right" : "Not quite, and that's okay"}
      </p>

      {chosen.map((c) => (
        <div key={c.option} className="mb-2 text-sm leading-relaxed">
          {chosen.length > 1 && <p className="font-semibold">{c.option}</p>}
          {c.response ? <p>{c.response}</p> : chosen.length === 1 ? null : <p className="opacity-70">No response written.</p>}
        </div>
      ))}

      {!correct && (
        <p className="mb-2 text-sm">
          <span className="font-semibold">The right answer:</span> {correctAnswers.join(", ")}
        </p>
      )}

      {explanation && (
        <p className="border-t border-current/15 pt-2 text-sm leading-relaxed opacity-90">{explanation}</p>
      )}
    </div>
  );
}
