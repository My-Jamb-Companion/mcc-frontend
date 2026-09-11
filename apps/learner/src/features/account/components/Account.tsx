"use client";

import {useState} from "react";
import type {ProfileTabKey, SidebarSectionKey} from "../constants/types";
import type {PersonalInformationFormValues} from "./AccountInfo";
import {ProfileTabs} from "./ProfileTabs";
import {AccountPersonalInformationForm} from "./AccountInfo";
import {ProfileSidebar} from "./ProfileSideBar";
import {UpdatePasswordForm} from "./UpadatePassword";
import {AccountConfigurations} from "./AccountConfiguration";
import ProfileHeader from "./ProfileHeader";
import AvatarPicker from "./AvatarPicker";
import {RankBadge} from "./RankBadge";
import {useProfile, useUpdatePassword, useUpdateProfile, useUploadProfilePhoto} from "../hooks/useProfile";
import {fromApiProfile} from "../helper/profile.mapper";
import {useMyLeaderboardStanding, useRewardsBalance} from "@/src/features/rewards/hooks/useRewards";
import {useDashboardStats} from "@/src/features/dashboard/hooks/useDashboard";

export default function AccountSettingsPage() {
  const [tab, setTab] = useState<ProfileTabKey>("account");
  const [section, setSection] = useState<SidebarSectionKey>("profileInfo");

  const {data: apiProfile, isLoading: profileLoading} = useProfile();
  const {data: standing} = useMyLeaderboardStanding();
  const {data: balance} = useRewardsBalance();
  const {data: dashboardStats} = useDashboardStats();

  const updateProfile = useUpdateProfile();
  const uploadPhoto = useUploadProfilePhoto();
  const updatePassword = useUpdatePassword();

  const user = apiProfile
    ? fromApiProfile(apiProfile, {
        rank: standing?.rank,
        points: standing?.total_score ?? balance?.total_points,
        diamonds: balance?.total_gems,
        coins: balance?.total_silver,
        lessons: dashboardStats?.courses_completed,
      })
    : null;

  const handleFieldChange = (values: PersonalInformationFormValues) => {
    updateProfile.mutate({
      full_name: values.fullName,
      username: values.username,
      parent_name: values.parentName,
      phone_number: values.phoneNumber,
      gender: values.gender,
      address: {
        country: values.country,
        state: values.state,
        city: values.city,
        street: values.street,
      },
    });
  };

  const handleAvatarFile = (file: File | string) => {
    if (file instanceof File) {
      uploadPhoto.mutate(file);
    } else if (file) {
      updateProfile.mutate({profile_photo_url: file});
    }
  };

  if (profileLoading || !user) {
    return <div className="pb-10 pt-20 text-center text-sm text-muted">Loading account…</div>;
  }

  return (
    <div className="pb-10">
      <div className="">
        <div className="relative h-36 overflow-hidden bg-linear-to-r from-[#ede9fe] via-[#f4f1ff] to-[#fafafa]">
          <div className="absolute left-40 top-0 h-40 w-40 rounded-full bg-purple-300/20 blur-3xl" />
          <div className="absolute right-20 top-0 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="md:hidden absolute right-13 bottom-0 ">
            <RankBadge rank={user.rank} />
          </div>
          <div className="max-md:hidden absolute right-10 top-7 mr-10">
            <AvatarPicker setFile={handleAvatarFile} />
          </div>
        </div>

        <div className="md:ml-30 md:mr-20 max-md:px-4">
          <ProfileHeader user={user} avatar={user.avatar} setFile={handleAvatarFile} />

          <div className="relative md:hidden pt-5">
            <AvatarPicker setFile={handleAvatarFile} />
          </div>

          <ProfileTabs active={tab} onChange={setTab} />

          {tab === "account" ? (
            <div className="mt-6 flex flex-col gap-8 sm:flex-row">
              <ProfileSidebar active={section} onChange={setSection} />

              {section === "profileInfo" ? (
                <AccountPersonalInformationForm
                  user={user}
                  onSave={handleFieldChange}
                />
              ) : (
                <div className="flex-1 text-sm text-gray-400">
                  <UpdatePasswordForm
                    onSave={(values) =>
                      updatePassword.mutate({
                        currentPassword: values.currentPassword,
                        newPassword: values.newPassword,
                      })
                    }
                  />
                  {updatePassword.isError && (
                    <p className="mt-3 text-sm text-red-500">
                      Failed to update password. Check your current password and try again.
                    </p>
                  )}
                  {updatePassword.isSuccess && (
                    <p className="mt-3 text-sm text-emerald-600">Password updated.</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 text-sm text-gray-400 md:max-w-[80%]">
              <AccountConfigurations />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
