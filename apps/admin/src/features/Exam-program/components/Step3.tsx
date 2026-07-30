import {Copy, GripVertical, Plus, ChevronDown} from "lucide-react";

function QuestionCard() {
  return (
    <div className="mx-auto max-w-5xl rounded-3xl border border-gray-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      {/* Header */}

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Question 1</h2>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-full border px-5 py-2 hover:bg-gray-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
            Single Choice
            <ChevronDown size={18} />
          </button>

          <button className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-zinc-800">
            <Copy size={20} />
          </button>
        </div>
      </div>

      {/* Question */}

      <input
        placeholder="Write your question here..."
        className="mb-5 h-14 w-full rounded-2xl border bg-transparent px-5 outline-none transition focus:border-violet-500 dark:border-zinc-700"
      />

      {/* Description */}

      <textarea
        rows={3}
        placeholder="Description (Optional)"
        className="mb-8 w-full rounded-2xl border bg-transparent p-5 outline-none transition focus:border-violet-500 dark:border-zinc-700"
      />

      {/* Options */}

      <div className="space-y-4">
        {["A", "B"].map((letter) => (
          <div key={letter} className="flex items-center gap-4">
            <GripVertical size={18} className="text-gray-400" />

            <input type="radio" name="answer" />

            <div className="flex h-14 flex-1 items-center rounded-2xl border px-5 dark:border-zinc-700">
              <span className="mr-4 text-gray-500">{letter}.</span>

              <input
                placeholder="Enter your option here..."
                className="flex-1 bg-transparent outline-none"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Add Option */}

      <button className="mt-5 flex items-center gap-2 text-violet-600 hover:text-violet-700">
        <Plus size={18} />
        Add option
      </button>

      {/* Explanation */}

      <textarea
        rows={4}
        placeholder="Answer explanation (Optional)"
        className="mt-8 w-full rounded-2xl border p-5 outline-none focus:border-violet-500 dark:border-zinc-700"
      />
    </div>
  );
}

export default function PracticeQuestions() {
  return (
    <main className="min-h-screen bg-gray-50 p-10 dark:bg-zinc-950">
      <QuestionCard />

      <div className="mt-10 flex justify-center">
        <button className="rounded-full bg-violet-600 px-8 py-3 font-medium text-white transition hover:bg-violet-700">
          Add Question
        </button>
      </div>
    </main>
  );
}
