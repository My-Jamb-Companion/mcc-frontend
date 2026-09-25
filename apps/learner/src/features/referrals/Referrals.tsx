"use client";

import {useState} from "react";
import {Icon, showError, showSuccess} from "@mcc/ui";
import {extractApiError} from "@mcc/api";
import {useReferralStatus, useSendReferralInvite} from "./hooks/useReferrals";
import {ApiReferralInvite} from "./services/referrals.service";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function InviteRow({invite}: {invite: ApiReferralInvite}) {
  const signedUp = invite.status === "signed_up";
  return (
    <div className="flex items-center justify-between rounded-2xl bg-gray-50 p-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{invite.email}</p>
        <p className="text-xs text-gray-400">
          Invited{" "}
          {invite.invited_at
            ? new Date(invite.invited_at).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            : ""}
        </p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${
          signedUp ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
        }`}
      >
        {signedUp ? "Joined" : "Pending"}
      </span>
    </div>
  );
}

export default function Referrals() {
  const [email, setEmail] = useState("");
  const {status, isLoading} = useReferralStatus();
  const inviteMutation = useSendReferralInvite();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      showError("Enter a valid email address");
      return;
    }
    inviteMutation.mutate(email, {
      onSuccess: (result) => {
        showSuccess(`Invite sent to ${result.sent_to}`);
        setEmail("");
      },
      onError: (error) => {
        showError(extractApiError(error, "Couldn't send that invite"));
      },
    });
  };

  return (
    <div>
      <div className="rounded-3xl bg-gradient-to-br from-violet-500 to-indigo-600 p-6 text-white">
        <p className="text-sm font-medium uppercase text-white/70">Invite friends</p>
        <h2 className="mt-1 text-xl font-bold">Earn 50 gems for every friend who joins</h2>
        <p className="mt-1 text-sm text-white/80">
          Send an invite by email. Once they sign up with that same email, your reward is ready
          to claim from the Rewards tab.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 flex gap-2 max-sm:flex-col">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="friend@example.com"
            className="w-full flex-1 rounded-full border-none bg-white/95 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            disabled={inviteMutation.isPending || !email}
            className="rounded-full bg-[#121B22] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            {inviteMutation.isPending ? "Sending…" : "Send invite"}
          </button>
        </form>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center max-sm:grid-cols-1">
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-900">{status?.total_invited ?? 0}</p>
          <p className="text-xs text-gray-400">Invited</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="text-2xl font-bold text-gray-900">{status?.successful ?? 0}</p>
          <p className="text-xs text-gray-400">Joined</p>
        </div>
        <div className="rounded-2xl bg-gray-50 p-4">
          <p className="flex items-center justify-center gap-1 text-2xl font-bold text-gray-900">
            <Icon icon="solar:cup-star-bold" size={20} />
            {status?.rewards_earned.gems ?? 0}
          </p>
          <p className="text-xs text-gray-400">Gems earned</p>
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-3 text-sm font-bold text-gray-900">Your invites</p>
        <div className="flex flex-col gap-2">
          {isLoading && <p className="py-8 text-center text-sm text-gray-400">Loading…</p>}
          {!isLoading && (status?.invites.length ?? 0) === 0 && (
            <p className="py-8 text-center text-sm text-gray-400">
              No invites sent yet. Invite a friend above to get started.
            </p>
          )}
          {status?.invites.map((invite) => (
            <InviteRow key={invite.email} invite={invite} />
          ))}
        </div>
      </div>
    </div>
  );
}
