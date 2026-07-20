"use client";

import {Icon} from "@mcc/ui";
import {useState} from "react";

type Tab = "course-content" | "about" | "transcript" | "conversation";

interface VideoTabsProps {
  description: string;
  transcript: {
    time: string;
    text: string;
  }[];
  magicOpen: boolean;
  setMagicOpen: (open: boolean) => void;
  mobileContent?: React.ReactNode;
}

export default function ClassroomPlayerTabs({
  description,
  transcript,
  magicOpen,
  setMagicOpen,
  mobileContent,
}: VideoTabsProps) {
  const isMobile = window.innerWidth < 768;

  const [activeTab, setActiveTab] = useState<Tab>(
    isMobile ? "course-content" : "about",
  );

  return (
    <div className="flex flex-col pt-6 bg-white">
      {/* Top Actions */}
      <div className="rounded-full p-5 border border-muted/30 max-sm:p-2 ">
        <div className="flex items-center justify-between ">
          <button
            onClick={() => setMagicOpen(!magicOpen)}
            className={`flex items-center gap-2 rounded-full md:px-5 md:py-3 max-md:p-3 text-sm font-medium  cursor-pointer ${!magicOpen ? "bg-primary-gradient text-white" : "border border-muted/30"}`}
          >
            <Icon
              icon={magicOpen ? "line-md:close" : "ri:quill-pen-line"}
              size={20}
            />
            <span className="max-md:hidden">
              {magicOpen ? "Close MagicNote" : " Use your magic note"}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 rounded-full border border-muted/30 text-muted md:px-4 md:py-2 max-md:p-2 text-sm hover:bg-gray-50">
              <Icon icon="ri:voiceprint-fill" size={18} />
              <span className="max-md:hidden">Ask me a question</span>
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-muted/30 text-muted hover:bg-gray-50">
              <Icon icon="mdi:fullscreen" size={18} />
            </button>

            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-muted/30 text-muted hover:bg-gray-50">
              <Icon icon="mdi:dots-horizontal" size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-5 pt-4">
        <div className="inline-flex rounded-full bg-gray-100 p-1">
          {[
            ...(isMobile
              ? [{id: "course-content", label: "Course Content"}]
              : []),
            {id: "about", label: "About"},
            {id: "transcript", label: "Transcript"},
            {id: "conversation", label: "Conversations"},
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                activeTab === tab.id
                  ? "bg-white shadow font-medium text-gray-900"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto px-5 py-5">
        {activeTab === "course-content" && mobileContent}

        {activeTab === "about" && (
          <p className="text-sm leading-7 text-gray-600 whitespace-pre-line">
            {description}
          </p>
        )}

        {activeTab === "transcript" && (
          <div className="space-y-5">
            {transcript.map((item) => (
              <button
                key={item.time}
                className="flex w-full items-start gap-4 text-left group"
              >
                <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-500">
                  {item.time}
                </span>

                <p className="flex-1 text-sm text-gray-700 group-hover:text-violet-600">
                  {item.text}
                </p>
              </button>
            ))}
          </div>
        )}

        {activeTab === "conversation" && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm text-center">
              <h3 className="text-xl font-semibold">
                Want to join the conversation?
              </h3>

              <p className="mt-3 text-sm text-gray-500">
                To get started, your account must be at least 3 days old, have a
                verified email address, and have at least 5,000 energy points.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
