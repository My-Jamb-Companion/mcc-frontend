import {Button} from "@mcc/ui";
import {useState, useRef, useEffect} from "react";
import {ThumbsUp, ThumbsDown, Flag, Clock, ChevronDown} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Question {
  id: string;
  author: string;
  avatarUrl?: string;
  timeAgo: string;
  body: string;
  timestamp?: {label: string; seconds: number};
  answerCount: number;
  commentCount: number;
  votes: number;
  userVote: "up" | "down" | null;
}

interface QAFeedProps {
  questions?: Question[];
  onTimestampClick?: (seconds: number) => void;
}

export default function CommunityTab(
  {
    // currentVideoTime,
    // }: {
    // currentVideoTime?: number;
  },
) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  const handlePost = () => {
    if (!value.trim()) return;
    // onPost?.(value.trim());
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handlePost();
    }
  };
  return (
    <section className="mx-auto w-[75%]">
      <div>
        <div className="w-full rounded-2xl border border-gray-200 bg-white px-4 pt-3 pb-3 shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What do you want to talk about?"
            rows={3}
            className="w-full resize-none bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none leading-relaxed"
          />
          <div className="flex justify-end pt-1">
            <Button
              onClick={handlePost}
              disabled={!value.trim()}
              width="fit"
              className="rounded-full bg-blue-500! px-5 py-2 text-sm font-medium text-white transition-opacity hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Post
            </Button>
          </div>
        </div>
        <p className="text-muted text-xs pt-1">
          Use
          <span className="text-blue-500"> “ @ ” </span>
          to highlight the timeline of the course you want to talk about.
        </p>
      </div>

      <QAFeed
      // onTimestampClick={(seconds) => {
      // seek your video player to `seconds`
      // playerRef.current?.seekTo(seconds);
      // }}
      />
    </section>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function QAFeed({
  questions = DEFAULT_QUESTIONS,
  onTimestampClick,
}: QAFeedProps) {
  const [lecture, setLecture] = useState("All lecture");
  const [sort, setSort] = useState("Sort by recommended");
  const [filter, setFilter] = useState("Filter questions");

  return (
    <div className="w-full max-w-3xl font-sans py-8">
      {/* Filters bar */}
      <div className="flex items-center gap-6 mb-5 flex-wrap">
        <div className="space-y-2">
          <span className="text-sm text-gray-500 font-medium">Filters:</span>
          <Dropdown
            value={lecture}
            options={["All lecture", "This lecture", "Unanswered"]}
            onChange={setLecture}
          />
        </div>

        <div className="space-y-2">
          <span className="text-sm text-gray-500 font-medium">Sort by:</span>
          <div className="flex items-center gap-3">
            <Dropdown
              value={sort}
              options={["Sort by recommended", "Most recent", "Most upvoted"]}
              onChange={setSort}
            />
            <Dropdown
              value={filter}
              options={["Filter questions", "All questions", "My questions"]}
              onChange={setFilter}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div>
        {questions.map((q) => (
          <QuestionCard
            key={q.id}
            question={q}
            onTimestampClick={onTimestampClick}
          />
        ))}
      </div>
    </div>
  );
}

function Avatar({name, src}: {name: string; src?: string}) {
  const initials = name.slice(0, 2).toUpperCase();
  const colors = [
    "bg-violet-200 text-violet-700",
    "bg-sky-200 text-sky-700",
    "bg-emerald-200 text-emerald-700",
    "bg-amber-200 text-amber-700",
    "bg-rose-200 text-rose-700",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
      />
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0 ${color}`}
    >
      {initials}
    </div>
  );
}

function TimestampLink({
  label,
  seconds,
  onClick,
}: {
  label: string;
  seconds: number;
  onClick?: (s: number) => void;
}) {
  return (
    <button
      onClick={() => onClick?.(seconds)}
      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-600 font-medium"
    >
      <Clock className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

function QuestionCard({
  question,
  onTimestampClick,
}: {
  question: Question;
  onTimestampClick?: (s: number) => void;
}) {
  const [votes, setVotes] = useState(question.votes);
  const [userVote, setUserVote] = useState<"up" | "down" | null>(
    question.userVote,
  );

  const handleVote = (dir: "up" | "down") => {
    if (userVote === dir) {
      setVotes(question.votes);
      setUserVote(null);
    } else {
      const delta = dir === "up" ? 1 : -1;
      const prev = userVote ? (userVote === "up" ? 1 : -1) : 0;
      setVotes(question.votes - prev + delta);
      setUserVote(dir);
    }
  };

  // Render body with optional timestamp inline
  const renderBody = () => {
    if (!question.timestamp) return <span>{question.body}</span>;

    const parts = question.body.split(question.timestamp.label);
    return (
      <>
        {parts[0]}
        <TimestampLink
          label={question.timestamp.label}
          seconds={question.timestamp.seconds}
          onClick={onTimestampClick}
        />
        {parts[1]}
      </>
    );
  };

  return (
    <div className="flex gap-3 py-5 border-b border-gray-100 last:border-none">
      <Avatar name={question.author} src={question.avatarUrl} />

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-semibold text-gray-900 text-sm">
            {question.author}
          </span>
          <span className="text-xs text-gray-400">{question.timeAgo}</span>
        </div>

        {/* Body */}
        <p className="text-sm text-gray-700 leading-relaxed mb-3">
          {renderBody()}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 text-sm flex-wrap">
          {/* Left actions */}
          <button className="text-blue-500 hover:text-blue-600 font-medium">
            Answer
          </button>
          <span className="text-gray-300">•</span>
          <button className="text-blue-500 hover:text-blue-600">
            {question.commentCount} comments
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Vote count */}
          <span className="text-gray-400 text-xs">({votes} votes)</span>

          {/* Upvote */}
          <button
            onClick={() => handleVote("up")}
            className={`flex items-center gap-1.5 transition-colors ${
              userVote === "up"
                ? "text-blue-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Upvote</span>
          </button>

          {/* Downvote */}
          <button
            onClick={() => handleVote("down")}
            className={`flex items-center gap-1.5 transition-colors ${
              userVote === "down"
                ? "text-red-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <ThumbsDown className="w-4 h-4" />
            <span>Downvote</span>
          </button>

          {/* Flag */}
          <button className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <Flag className="w-4 h-4" />
            <span>Flag</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Dropdown({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
      >
        {value}
        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
      </button>
      {open && (
        <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-md z-10 min-w-[160px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => {
                onChange(opt);
                setOpen(false);
              }}
              className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                opt === value ? "text-blue-500 font-medium" : "text-gray-700"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const DEFAULT_QUESTIONS: Question[] = [
  {
    id: "1",
    author: "RashidaAhmed",
    timeAgo: "1 year ago",
    body: "At 4:15, how does a person or group of people discover/invent a new type of math like Algebra? How did Newton invent calculus? Are there people doing research today creating new math to understand the universe?",
    timestamp: {label: "4:15", seconds: 255},
    answerCount: 1,
    commentCount: 19,
    votes: 320,
    userVote: null,
  },
  {
    id: "2",
    author: "JosephPacker",
    timeAgo: "9 mon ago",
    body: "Sometimes there is a problem that we cannot answer using the current type of math, so we must discover a way to answer the problem. Every problem has an answer if we discover a way to figure it out.",
    answerCount: 0,
    commentCount: 19,
    votes: 20,
    userVote: null,
  },
];
