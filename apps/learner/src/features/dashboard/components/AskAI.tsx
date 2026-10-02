"use client";

import {useRef, useState} from "react";
import {Icon} from "@mcc/ui";
import {mergeTranscript} from "@/src/features/brainy/helper/voice";
import {useSpeechInput} from "@/src/features/brainy/hooks/useSpeechInput";

interface AskAICardProps {
  onSubmit?: (query: string) => void;
  onSurprise?: () => void;
}

export default function AskAICard({onSubmit, onSurprise}: AskAICardProps) {
  const [query, setQuery] = useState("");
  // What was typed before the mic was tapped, so speech is appended to it
  // rather than overwriting it, and interim guesses replace each other
  // instead of piling up.
  const typedBeforeSpeech = useRef("");

  const speech = useSpeechInput({
    onTranscript: (spoken) => setQuery(mergeTranscript(typedBeforeSpeech.current, spoken)),
  });

  const trimmed = query.trim();

  const submit = () => {
    if (!trimmed) return;
    speech.stop();
    onSubmit?.(trimmed);
  };

  const toggleMic = () => {
    if (!speech.listening) typedBeforeSpeech.current = query;
    speech.toggle();
  };

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") submit();
  };

  return (
    <div className="w-full rounded-xl bg-[#F0F0F8] p-8 max-sm:p-5 max-sm:gap-8 flex flex-col gap-25 overflow-hidden">
      <div className="flex flex-col gap-5">
        <button
          type="button"
          onClick={onSurprise}
          className="flex items-center gap-1.5 w-fit cursor-pointer hover:opacity-80 transition-opacity"
        >
          <Icon icon="solar:stars-bold" size={18} color="#7C3AED" />
          <span className="text-sm font-medium text-[#1a2332]">
            Surprise me!
          </span>
        </button>

        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium leading-snug max-w-[75%] max-sm:text-lg">
            Hey, not sure about what you want to learn?
          </h2>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            aria-label="Ask Brainy anything"
            placeholder={speech.listening ? "Listening…" : "Just ask me anything about it"}
            className=" min-w-0 bg-transparent text-3xl text-hint max-sm:text-xl placeholder:text-hint outline-none caret-muted"
          />
          {speech.error && (
            <p role="alert" className="text-sm text-red-600">
              {speech.error}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggleMic}
          disabled={!speech.supported}
          aria-label={speech.listening ? "Stop voice input" : "Speak your question"}
          aria-pressed={speech.listening}
          title={speech.supported ? undefined : "Voice input isn't supported in this browser"}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-sm transition-transform ${
            speech.listening
              ? "bg-red-500 text-white animate-pulse"
              : "bg-white text-[#1a2332] hover:scale-105"
          } ${speech.supported ? "cursor-pointer" : "cursor-not-allowed opacity-40"}`}
        >
          <Icon icon={speech.listening ? "ph:stop-fill" : "ph:microphone"} size={22} />
        </button>

        <button
          type="button"
          onClick={submit}
          disabled={!trimmed}
          aria-label="Send to Brainy"
          className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-sm transition-all enabled:hover:scale-105 enabled:cursor-pointer disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Icon icon="ph:arrow-up" size={22} />
        </button>
      </div>
    </div>
  );
}
