"use client";

import {Button, Modal} from "@mcc/ui";
import {useAcceptGuidelines, useGuidelines} from "@/src/features/learnings/hooks/useCommunity";

/**
 * The rules, as the server serves them (so what someone agrees to is exactly what they saw), shown before a
 * student's first post. "I agree" records it and carries on with the post that was waiting.
 */
export function GuidelinesModal({open, onAgree, onCancel}: {open: boolean; onAgree: () => void; onCancel: () => void}) {
  const {data, isLoading} = useGuidelines(open);
  const accept = useAcceptGuidelines();
  return (
    <Modal open={open} title={data?.title ?? "Community guidelines"} maxWidth="max-w-md">
      <div className="space-y-4">
        {isLoading || !data ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <>
            <ul className="list-disc space-y-2 pl-5 text-sm text-foreground">
              {data.rules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
            <p className="text-xs text-muted">{data.consequences}</p>
          </>
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" width="fit" onClick={onCancel}>
            Not now
          </Button>
          <Button type="button" width="fit" disabled={!data} loading={accept.isPending} onClick={() => accept.mutate(undefined, {onSuccess: onAgree})}>
            I agree
          </Button>
        </div>
      </div>
    </Modal>
  );
}
