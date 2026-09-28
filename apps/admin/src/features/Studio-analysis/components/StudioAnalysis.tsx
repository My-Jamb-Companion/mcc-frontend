"use client";

import {Button, Icon} from "@mcc/ui";
import {useState} from "react";
import StudioTable from "./StudioTable";
import ConversationDetailModal from "./ConversationDetailModal";
import {FormInputs} from "@mcc/features";
import Copilot from "./Copilot";
import {useConversations} from "../hooks/useAiStudio";
import {useDebouncedValue} from "@/src/features/students/hooks/useDebouncedValue";
import {ApiConversationItem} from "../services/ai-studio.service";

export default function StudioAnalysis() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search);
  const [selected, setSelected] = useState<ApiConversationItem | null>(null);

  const {data, isLoading} = useConversations(debouncedSearch);

  return (
    <section className="flex flex-col gap-6  h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AI studio analysis</h1>
        <Button variant="outline" width="fit" className="p-2!">
          <Icon icon="ri:export-line" />
        </Button>
      </div>

      <Copilot />

      <div className="flex flex-col h-full border border-muted/20 rounded-2xl px-6 py-8 ">
        <div className="flex items-center gap-3 justify-between">
          <h2 className="text-sm font-semibold text-subtle">
            Brainy conversations
          </h2>

          <div className="w-full max-w-[20%]">
            <FormInputs
              placeholder="Search for student or conversation"
              type="text"
              icon={<Icon icon="ri:search-line" size={18} />}
              value={search}
              onChange={setSearch}
              inputClassName=" rounded-full! shadow-sm border-muted/30"
            />
          </div>
        </div>

        <div className="flex-1 min-h-0 mt-3">
          <StudioTable
            data={data?.items ?? []}
            isLoading={isLoading}
            onRowClick={setSelected}
          />
        </div>
      </div>

      <ConversationDetailModal
        conversation={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
