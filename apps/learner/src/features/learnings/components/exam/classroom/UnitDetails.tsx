import {Play, HelpCircle, Award} from "lucide-react";
import {ExamLesson} from "@/src/features/constants/demoExams";
import {redirect, usePathname} from "next/navigation";

interface Practice {
  title: string;
  subtitle: string;
  upNext?: boolean;
}

interface CheckpointNode {
  id: string;
  type: "quiz" | "test";
  title: string;
  description: string;
}

function LearnRow({
  text,
  active,
  onClick,
}: {
  text: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-2 w-fit cursor-pointer"
    >
      <div
        className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 ${
          active
            ? "border-b-violet-600 border-b-4 border-muted/30"
            : "border-muted/30"
        }`}
      >
        <Play className="w-3 h-3 text-slate-500" fill="currentColor" />
      </div>
      <span className="text-[13.5px] text-slate-700">{text}</span>
    </div>
  );
}

function PracticeCard({practice}: {practice: Practice}) {
  return (
    <div
      className={`rounded-lg border border-l-4 p-4 w-full  border-primary/30 shadow-md`}
    >
      {practice.upNext && (
        <p className="text-[11px] font-semibold text-primary mb-1">
          Up next for you:
        </p>
      )}
      <p className="text-[13.5px] font-semibold text-subtle leading-snug">
        {practice.title}
      </p>
      <p className="text-[12px] text-slate-500 mt-1">{practice.subtitle}</p>
      <button
        type="button"
        className="mt-3 flex items-center gap-1 px-4 py-1.5 rounded-md bg-blue-600 text-white text-[13px] font-medium hover:bg-blue-700 transition-colors"
      >
        Start
        <Play className="w-3 h-3" fill="currentColor" />
      </button>
    </div>
  );
}

function CheckpointCard({node}: {node: CheckpointNode}) {
  const isTest = node.type === "test";
  const Icon = isTest ? Award : HelpCircle;

  return (
    <div className="flex items-center justify-between gap-6 py-6">
      <div>
        <p className="text-[15px] font-semibold text-slate-900">{node.title}</p>
        <p className="text-[13px] text-slate-500 mt-1 max-w-md">
          {node.description}
        </p>
        <button
          type="button"
          className="mt-4 flex items-center gap-1 px-4 py-1.5 rounded-md border border-slate-300 text-slate-800 text-[13px] font-medium hover:bg-slate-50 transition-colors"
        >
          {isTest ? "Start unit test" : "Start quiz"}
          <Play className="w-3 h-3" fill="currentColor" />
        </button>
      </div>
      <div
        className={`hidden sm:flex items-center justify-center w-16 h-16 rounded-full shrink-0 ${
          isTest ? "bg-amber-50" : "bg-violet-50"
        }`}
      >
        <Icon
          className={`w-7 h-7 ${isTest ? "text-amber-500" : "text-violet-500"}`}
        />
      </div>
    </div>
  );
}

export default function UnitDetailView({lesson}: {lesson: ExamLesson}) {
  const pathname = usePathname();

  return (
    <div className="w-full p-6">
      <section className="pb-6 border-b border-slate-100">
        <div className="max-w-[70%]">
          <h2 className="text-[14px] font-semibold text-slate-900 mb-3">
            About this unit
          </h2>
          <p className="text-[13.5px] text-slate-600 leading-relaxed">
            {lesson.about.intro}
          </p>
          <p className="text-[13.5px] text-slate-600 leading-relaxed mt-3">
            <span className="font-semibold text-slate-800">
              Unit guides are here!{" "}
            </span>
            {lesson.about.note.replace("Unit guides are here! ", "")}
          </p>
        </div>
      </section>

      {lesson.subLessons.map((node, index) => {
        if (node.type === "topic") {
          return (
            <section
              key={node.id}
              className="py-6 border-b border-slate-100 last:border-b-0"
            >
              <h3 className="text-[14px] font-semibold text-slate-900 mb-3">
                {node.title}
              </h3>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium text-slate-400 mb-1">
                    Learn
                  </p>
                  {node.learnItems.map((item, idx) => (
                    <LearnRow
                      key={item.id}
                      text={item.title}
                      active={idx === 0}
                      onClick={() =>
                        redirect(`${pathname}/player?lesson=${lesson?.id}`)
                      }
                    />
                  ))}
                </div>
                {node.practice && (
                  <div>
                    <p className="text-[11px] font-medium text-slate-400 mb-1">
                      Practice
                    </p>
                    <PracticeCard practice={node.practice} />
                  </div>
                )}
              </div>
            </section>
          );
        }

        const checkpoint: CheckpointNode =
          node.type === "quiz"
            ? {
                ...node,
                title: `Quiz ${
                  lesson.subLessons
                    .slice(0, index + 1)
                    .filter((n) => n.type === "quiz").length
                }`,
              }
            : node;
        return (
          <div key={node.id} className="border-b border-slate-100">
            <CheckpointCard node={checkpoint} />
          </div>
        );
      })}
    </div>
  );
}
