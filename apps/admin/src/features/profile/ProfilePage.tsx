"use client";

import {useRef, useState} from "react";
import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {showError, showSuccess} from "@mcc/ui";
import {useMyAccess} from "@/src/features/admin-access/hooks/useAdminAccess";
import {changePassword, getApiErrorMessage, getProfile, updateProfile, uploadProfilePhoto} from "./profile.service";
import type {ApiProfile} from "./profile.service";
import {changedFields, initialsOf, passwordProblem, photoProblem} from "./profileForm";

const field = "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 outline-none focus:border-violet-400 disabled:bg-neutral-50 disabled:text-neutral-500";
const card = "rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm";

function Avatar({profile}: {profile: ApiProfile}) {
  // A photo that fails to load falls back to initials rather than a broken image.
  const [failed, setFailed] = useState<string | null>(null);
  const name = profile.full_name || profile.username || profile.email;
  const src = profile.profile_photo_url;
  return (
    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-violet-100">
      {src && src !== failed ? (
        <img src={src} alt={name} onError={() => setFailed(src)} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-semibold text-white" aria-label={name}>
          {initialsOf(name)}
        </span>
      )}
    </div>
  );
}

function ProfileCard({profile}: {profile: ApiProfile}) {
  const queryClient = useQueryClient();
  const {data: access} = useMyAccess();
  const fileInput = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [username, setUsername] = useState(profile.username ?? "");
  const [phone, setPhone] = useState(profile.phone_number ?? "");

  const refresh = () => queryClient.invalidateQueries({queryKey: ["admin-profile"]});
  const save = useMutation({mutationFn: updateProfile, onSuccess: refresh});
  const photo = useMutation({mutationFn: uploadProfilePhoto, onSuccess: refresh});

  const changes = changedFields(profile, {full_name: fullName, username, phone_number: phone});
  const dirty = Object.keys(changes).length > 0;

  function onPhoto(file: File | undefined) {
    if (!file) return;
    const problem = photoProblem(file);
    if (problem) return showError(problem);
    photo.mutate(file, {
      onSuccess: () => showSuccess("Photo updated."),
      onError: (error) => showError(getApiErrorMessage(error, "Couldn't upload the photo. Please try again.")),
    });
    if (fileInput.current) fileInput.current.value = "";
  }

  return (
    <section className={card}>
      <h2 className="text-lg font-semibold text-neutral-900">Profile</h2>
      <p className="mt-0.5 text-sm text-neutral-500">Your details as other admins see them.</p>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Avatar profile={profile} />
        <div>
          <button type="button" onClick={() => fileInput.current?.click()} disabled={photo.isPending} className="rounded-lg border border-neutral-200 px-3.5 py-2 text-sm font-medium text-neutral-800 hover:bg-neutral-50 disabled:opacity-50">
            {photo.isPending ? "Uploading…" : "Change photo"}
          </button>
          <input ref={fileInput} type="file" accept="image/*" aria-label="Profile photo" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          <p className="mt-1 text-xs text-neutral-400">An image up to 5 MB.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Full name
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Username
          <input value={username} onChange={(e) => setUsername(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Email
          <input value={profile.email} disabled className={field} />
          <span className="text-xs font-normal text-neutral-400">Your email is how you sign in, so it can&apos;t be changed here.</span>
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Phone number
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
        </label>
        <div className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700 sm:col-span-2">
          Your access
          <p className="rounded-lg bg-neutral-50 px-3 py-2 font-normal text-neutral-600">
            {access ? access.preset_label : "Admin"}. Only a super admin can change this.
          </p>
        </div>
      </div>

      <div className="mt-5 flex justify-end">
        <button
          type="button"
          disabled={!dirty || save.isPending}
          onClick={() =>
            save.mutate(changes, {
              onSuccess: () => showSuccess("Profile saved."),
              onError: (error) => showError(getApiErrorMessage(error, "Couldn't save your profile. Please try again.")),
            })
          }
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {save.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </section>
  );
}

function PasswordCard() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [touched, setTouched] = useState(false);
  const change = useMutation({mutationFn: () => changePassword(current, next)});
  const problem = passwordProblem(current, next, confirm);

  function submit() {
    setTouched(true);
    if (problem) return;
    change.mutate(undefined, {
      onSuccess: () => {
        showSuccess("Password changed.");
        setCurrent("");
        setNext("");
        setConfirm("");
        setTouched(false);
      },
      onError: (error) => showError(getApiErrorMessage(error, "Couldn't change your password. Check your current password and try again.")),
    });
  }

  return (
    <section className={card}>
      <h2 className="text-lg font-semibold text-neutral-900">Change password</h2>
      <p className="mt-0.5 text-sm text-neutral-500">Use at least 6 characters you don&apos;t use anywhere else.</p>
      <form
        className="mt-5 grid gap-4 sm:max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Current password
          <input type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          New password
          <input type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={field} />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-neutral-700">
          Confirm new password
          <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={field} />
        </label>
        {touched && problem && <p role="alert" className="text-sm text-red-600">{problem}</p>}
        <div>
          <button type="submit" disabled={change.isPending} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
            {change.isPending ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </section>
  );
}

/** The signed-in admin's own profile: details, photo and password. */
export default function ProfilePage() {
  const profile = useQuery({queryKey: ["admin-profile"], queryFn: getProfile});

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-neutral-900">User profile</h1>
      {profile.isLoading && <p className="text-sm text-neutral-400">Loading your profile…</p>}
      {profile.isError && <p className="text-sm text-red-500">Couldn&apos;t load your profile. Please try again.</p>}
      {profile.data && (
        // Remount when the saved profile changes, so the form starts from what is stored.
        <ProfileCard key={`${profile.data.full_name}|${profile.data.username}|${profile.data.phone_number}`} profile={profile.data} />
      )}
      <PasswordCard />
    </div>
  );
}
