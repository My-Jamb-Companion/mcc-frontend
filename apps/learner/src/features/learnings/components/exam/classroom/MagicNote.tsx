import {Icon} from "@mcc/ui";
import React, {useState, useRef, useEffect, useCallback} from "react";
import Image from "next/image";

const LINE_HEIGHT = 36;

type SaveState = "idle" | "saved";
type MagicAction = "generate" | "expand" | "fix";

interface ClaudeContentBlock {
  type: string;
  text?: string;
}

interface ClaudeResponse {
  content?: ClaudeContentBlock[];
}

async function callClaude(prompt: string): Promise<string> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data: ClaudeResponse = await response.json();

  return (
    data.content
      ?.filter((block) => block.type === "text")
      .map((block) => block.text ?? "")
      .join("\n")
      .trim() ?? ""
  );
}

export default function MagicNote({topic}: {topic: string}) {
  const [title, setTitle] = useState<string>(topic);
  const [body, setBody] = useState<string>("");
  const [history, setHistory] = useState<string[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [wandOpen, setWandOpen] = useState<boolean>(false);
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const markDirty = useCallback(() => {
    setSaveState("idle");

    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }

    saveTimer.current = setTimeout(() => {
      setSaveState("saved");
    }, 700);
  }, []);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, []);

  const pushHistory = (prevBody: string) => {
    setHistory((history) => [...history.slice(-19), prevBody]);
  };

  const handleUndo = () => {
    setHistory((history) => {
      if (history.length === 0) return history;

      const previous = history[history.length - 1];

      setBody(previous);
      markDirty();

      return history.slice(0, -1);
    });
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    pushHistory(body);
    setBody(e.target.value);
    markDirty();
  };

  const runMagic = async (kind: MagicAction): Promise<void> => {
    setWandOpen(false);
    setAiError("");
    setAiLoading(true);

    try {
      let prompt = "";

      switch (kind) {
        case "generate":
          prompt = `Write concise, well-structured study notes (use short paragraphs and a few bullet points) on the topic: "${
            title || "this topic"
          }". Keep it under 180 words. Return only the notes, no preamble.`;
          break;

        case "expand":
          prompt = `Expand and add more depth to these study notes on "${title}". Keep the same tone, return only the expanded notes:

${body}`;
          break;

        case "fix":
          prompt = `Fix grammar and tighten the wording of these study notes, without changing the meaning. Return only the corrected text:

${body}`;
          break;
      }

      const result = await callClaude(prompt);

      pushHistory(body);

      setBody(
        kind === "generate" && body.trim() ? `${body}\n\n${result}` : result,
      );

      markDirty();
    } catch {
      setAiError("Couldn't reach the AI assistant. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleImagePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const url = URL.createObjectURL(file);

    setImages((current) => [...current, url]);

    markDirty();

    e.target.value = "";
  };

  return (
    <div className="w-full  min-h-[560px] flex items-center justify-center pt-6">
      <div className="relative w-full  h-full bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-600 disabled:opacity-40 disabled:hover:text-neutral-400 transition-colors"
          >
            <Icon icon="solar:undo-left-outline" className="w-3.5 h-3.5" />
            Undo
          </button>

          <div className="flex items-center gap-1.5 text-xs">
            {saveState === "idle" ? (
              <span className="text-neutral-300">Editing…</span>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500">
                <Icon icon="solar:check-circle-bold" className="w-3.5 h-3.5" />
                Saved
              </span>
            )}
          </div>
        </div>

        {/* ruled page */}
        <div className="relative">
          {/* margin rule */}
          <div className="absolute left-[64px] top-0 bottom-0 w-1 bg-neutral-200" />

          <div
            className="pl-[80px] pr-8"
            style={{
              backgroundImage: "linear-gradient(#d4d4d4 1px, transparent 2px)",
              backgroundSize: `100% ${LINE_HEIGHT}px`,
              backgroundPosition: "0 90px",
            }}
          >
            {/* title row */}
            <div
              style={{height: LINE_HEIGHT * 2, translate: "0px -6px"}}
              className="flex items-end pb-2"
            >
              <input
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  markDirty();
                }}
                placeholder="Untitled note"
                className="w-full bg-transparent font-bold text-[17px] text-neutral-900 placeholder-neutral-300 outline-none"
              />
            </div>

            {/* body */}
            <textarea
              ref={bodyRef}
              value={body}
              onChange={handleBodyChange}
              placeholder="Write on your magic note"
              rows={12}
              style={{
                lineHeight: `${LINE_HEIGHT}px`,
                paddingTop: "0px",
                translate: "0px -6px",
              }}
              className="w-full resize-none bg-transparent outline-none text-[14px] text-neutral-700 placeholder-neutral-400 pb-14"
            />

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 pb-6">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="relative rounded-lg overflow-hidden border border-neutral-200"
                  >
                    <Image
                      src={src}
                      alt={`image-${i}`}
                      fill
                      className="w-full h-24 object-cover"
                    />
                    <button
                      onClick={() =>
                        setImages((imgs) => imgs.filter((_, idx) => idx !== i))
                      }
                      className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 rounded-full p-0.5 text-white"
                    >
                      <Icon icon="solar:close-circle-bold" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* floating toolbar */}
        <div className="absolute w-full bottom-4 flex justify-center pb-4 pt-2">
          <div className="relative flex items-center gap-2 bg-white border border-neutral-200 shadow-md rounded-full px-2 py-1.5">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
              title="Zoom / find"
            >
              <Icon icon="solar:magnifer-outline" className="w-4 h-4" />
            </button>

            <button
              onClick={() => setWandOpen((o) => !o)}
              disabled={aiLoading}
              className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-sm hover:brightness-110 transition-all disabled:opacity-70"
              title="Magic assist"
            >
              {aiLoading ? (
                <Icon icon="line-md:loading-twotone-loop" className="w-4 h-4" />
              ) : (
                <Icon icon="ri:quill-pen-line" className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-8 h-8 flex items-center justify-center rounded-full text-neutral-500 hover:bg-neutral-100 transition-colors"
              title="Insert image"
            >
              <Icon icon="solar:gallery-outline" className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImagePick}
            />

            {/* wand menu */}
            {wandOpen && (
              <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 overflow-hidden">
                <button
                  onClick={() => runMagic("generate")}
                  className="w-full text-left px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50"
                >
                  Write notes on this topic
                </button>
                <button
                  onClick={() => runMagic("expand")}
                  disabled={!body.trim()}
                  className="w-full text-left px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  Expand my notes
                </button>
                <button
                  onClick={() => runMagic("fix")}
                  disabled={!body.trim()}
                  className="w-full text-left px-3 py-2 text-[13px] text-neutral-700 hover:bg-neutral-50 disabled:opacity-40"
                >
                  Fix grammar
                </button>
              </div>
            )}
          </div>
        </div>

        {aiError && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-[12px] text-red-500 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
            {aiError}
          </div>
        )}
      </div>
    </div>
  );
}
