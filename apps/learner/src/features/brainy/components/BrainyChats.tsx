"use client";
import {Icon, motion} from "@mcc/ui";
import {useState} from "react";

export default function BrainyChats() {
  const [question, setQuestion] = useState("");
  return (
    <div className="relative w-full px-4 flex flex-col items-center justify-center">
      <div className="absolute bottom-12 w-[90%] rounded-full bg-[#F9F9F9] border border-muted/20 shadow-md flex items-center gap-2 pl-9 p-1.5 min-h-[74px]">
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="w-full resize-none border-none text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          rows={1}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              //   handleSubmit();
            }
          }}
        />
        <motion.button
          type="button"
          //   onClick={handleSubmit}
          whileTap={{scale: 0.95}}
          disabled={!question.trim()}
          className="flex items-center gap-1.5 rounded-full bg-primary  p-3 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-30"
        >
          <Icon icon="ph:arrow-up" className="h-3.5 w-3.5" />
        </motion.button>
      </div>
    </div>
  );
}
