import {useState} from "react";

// ---- Types -----------------------------------------------------------

export interface LearnItem {
  id: string;
  type: "video" | "article";
  title: string;
  durationMin?: number;
}

interface ParagraphBlock {
  type: "paragraph";
  text: string;
}

interface ExampleStep {
  expr: string;
  note?: string;
}

interface ExampleBlock {
  type: "example";
  steps: ExampleStep[];
}

interface TableBlock {
  type: "table";
  columnHeaders: string[]; // e.g. ["Old way", "New way"]
  rows: {label: string; values: string[]}[];
}

export type ContentBlock = ParagraphBlock | ExampleBlock | TableBlock;

export interface ContentSection {
  heading: string;
  blocks: ContentBlock[];
}

export interface PracticeProblem {
  id: string;
  prompt: string;
  answer?: string;
}

export interface LessonContent {
  title: string;
  description: string;
  sections: ContentSection[];
  practiceProblems: PracticeProblem[];
  challengeProblems: PracticeProblem[];
}

// ---- Content block renderers ------------------------------------------

function ParagraphBlockView({block}: {block: ParagraphBlock}) {
  return (
    <p className="text-[13.5px] text-slate-700 leading-relaxed mb-4">
      {block.text}
    </p>
  );
}

function ExampleBlockView({block}: {block: ExampleBlock}) {
  return (
    <div className="mb-4 font-mono text-[13.5px]">
      {block.steps.map((step, i) => (
        <div key={i} className="flex items-baseline gap-4 py-0.5">
          <span className="text-slate-800">{step.expr}</span>
          {step.note && (
            <span className="font-sans text-slate-400 text-[12.5px]">
              {step.note}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function TableBlockView({block}: {block: TableBlock}) {
  return (
    <div className="mb-4 border border-slate-200 rounded-md overflow-hidden">
      <div
        className="grid text-[12.5px] font-medium text-slate-500 bg-white px-3 py-2"
        style={{
          gridTemplateColumns: `1fr repeat(${block.columnHeaders.length}, 1fr)`,
        }}
      >
        <span />
        {block.columnHeaders.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </div>
      {block.rows.map((row, i) => (
        <div
          key={row.label}
          className={`grid text-[13px] px-3 py-2 ${i % 2 === 0 ? "bg-slate-50" : "bg-white"}`}
          style={{gridTemplateColumns: `1fr repeat(${row.values.length}, 1fr)`}}
        >
          <span className="text-slate-600">{row.label}</span>
          {row.values.map((v, j) => (
            <span key={j} className="text-slate-700">
              {v}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

function ContentBlockView({block}: {block: ContentBlock}) {
  if (block.type === "paragraph") return <ParagraphBlockView block={block} />;
  if (block.type === "example") return <ExampleBlockView block={block} />;
  return <TableBlockView block={block} />;
}

// ---- Problem box (used for both practice + challenge) -----------------

function ProgressDots({
  total,
  current,
  onSelect,
}: {
  total: number;
  current: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({length: total}).map((_, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onSelect(i)}
          className={`w-2.5 h-2.5 rounded-full ${
            i === current ? "bg-blue-500" : "bg-slate-200"
          }`}
          aria-label={`Problem ${i + 1}`}
        />
      ))}
    </div>
  );
}

function ProblemBox({
  problems,
  label,
  showExplain,
}: {
  problems: PracticeProblem[];
  label: string;
  showExplain?: boolean;
}) {
  const [current, setCurrent] = useState(0);
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<
    "correct" | "incorrect" | "submitted" | null
  >(null);

  const problem = problems[current];

  function handleCheck() {
    if (!problem?.answer) {
      setFeedback("submitted");
      return;
    }
    setFeedback(
      value.trim().toLowerCase() === problem.answer.toLowerCase()
        ? "correct"
        : "incorrect",
    );
  }

  function selectProblem(i: number) {
    setCurrent(i);
    setValue("");
    setFeedback(null);
  }

  if (!problem) return null;

  return (
    <div>
      <div className="border border-slate-200 rounded-md overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200">
          <span className="text-[10.5px] font-semibold tracking-wide text-slate-500">
            {label} {current + 1}
          </span>
          <ProgressDots
            total={problems.length}
            current={current}
            onSelect={selectProblem}
          />
        </div>
        <div className="p-4">
          <p className="text-[13.5px] font-medium text-slate-900 mb-3">
            {problem.prompt}
          </p>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="w-40 border border-slate-300 rounded-md px-2.5 py-1.5 text-[13.5px] mb-3 block"
          />
          <button
            type="button"
            onClick={handleCheck}
            className="px-4 py-1.5 rounded-md border border-slate-300 text-slate-800 text-[13px] font-medium hover:bg-slate-50 transition-colors"
          >
            Check
          </button>
          {feedback === "correct" && (
            <p className="text-[12.5px] text-emerald-600 font-medium mt-2">
              Correct!
            </p>
          )}
          {feedback === "incorrect" && (
            <p className="text-[12.5px] text-rose-600 font-medium mt-2">
              Not quite — try again.
            </p>
          )}
          {feedback === "submitted" && (
            <p className="text-[12.5px] text-slate-500 font-medium mt-2">
              Answer submitted.
            </p>
          )}
        </div>
      </div>
      {showExplain && (
        <button
          type="button"
          className="text-[12.5px] font-medium text-violet-600 mt-2 hover:underline"
        >
          Explain
        </button>
      )}
    </div>
  );
}

// ---- Top-level view -----------------------------------------------------

export default function LessonContentView({content}: {content: LessonContent}) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white">
      <p className="text-[13.5px] text-slate-500 leading-relaxed pb-5 border-b border-slate-100">
        {content.description}
      </p>

      {content.sections.map((section) => (
        <section
          key={section.heading}
          className="py-6 border-b border-slate-100"
        >
          <h2 className="text-[16px] font-semibold text-slate-900 mb-3">
            {section.heading}
          </h2>
          {section.blocks.map((block, i) => (
            <ContentBlockView key={i} block={block} />
          ))}
        </section>
      ))}

      {content.practiceProblems.length > 0 && (
        <section className="py-6 border-b border-slate-100">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-3">
            Let's practice!
          </h3>
          <ProblemBox problems={content.practiceProblems} label="PROBLEM" />
        </section>
      )}

      {content.challengeProblems.length > 0 && (
        <section className="py-6">
          <h3 className="text-[14px] font-semibold text-slate-900 mb-3">
            Challenge problems
          </h3>
          <ProblemBox
            problems={content.challengeProblems}
            label="CHALLENGE PROBLEM"
            showExplain
          />
        </section>
      )}
    </div>
  );
}
