"use client";

import {useState} from "react";
import {Modal, showError, showSuccess} from "@mcc/ui";
import {useCreateQaTester} from "../hooks/useQaTesters";
import {getApiErrorMessage} from "../services/qaTesters.service";

export default function CreateQaTesterModal({open, onClose}: {open: boolean; onClose: () => void}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const create = useCreateQaTester();
  const valid = name.trim().length >= 2 && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  function close() {
    setName("");
    setEmail("");
    onClose();
  }

  function submit() {
    if (!valid) return;
    create.mutate(
      {full_name: name.trim(), email: email.trim()},
      {
        onSuccess: (t) => {
          showSuccess(`${t.full_name ?? t.email} is a QA tester. Send them a sign-in code so they can set a password.`);
          close();
        },
        onError: (e) => showError(getApiErrorMessage(e, "Couldn't create the QA tester. Please try again.")),
      },
    );
  }

  return (
    <Modal open={open} title="Add a QA tester" maxWidth="max-w-md">
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          A QA tester is a real student account that enrols in anything for free, earns no points or gems, and is left
          out of every company number. Use it to test courses and exams the way a learner sees them.
        </p>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ada QA"
            className="w-full rounded-lg border border-muted/30 bg-transparent px-3 py-2 text-sm font-normal outline-none focus:border-violet-400"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-foreground">
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tester@example.com"
            className="w-full rounded-lg border border-muted/30 bg-transparent px-3 py-2 text-sm font-normal outline-none focus:border-violet-400"
          />
        </label>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={close} className="rounded-lg px-4 py-2 text-sm font-medium text-muted hover:text-foreground">
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={create.isPending || !valid}
            className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {create.isPending ? "Adding..." : "Add tester"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
