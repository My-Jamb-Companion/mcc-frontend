"use client";

import {useState} from "react";
import type {
  ProfileTabKey,
  ProfileUser,
  SidebarSectionKey,
} from "../constants/types";
import type {PersonalInformationFormValues} from "./AccountInfo";
import {CURRENT_USER} from "../constants/constants";
import {ProfileTabs} from "./ProfileTabs";
import {AccountPersonalInformationForm} from "./AccountInfo";
import {ProfileSidebar} from "./ProfileSideBar";
import {UpdatePasswordForm} from "./UpadatePassword";
import {AccountConfigurations} from "./AccountConfiguration";
import ProfileHeader from "./ProfileHeader";
import AvatarPicker from "./AvatarPicker";
import {RankBadge} from "./RankBadge";

export default function AccountSettingsPage() {
  const [tab, setTab] = useState<ProfileTabKey>("account");
  const [section, setSection] = useState<SidebarSectionKey>("profileInfo");
  const [user, setUser] = useState<ProfileUser>(CURRENT_USER);
  const [file, setFile] = useState<File | string>(user.avatar);

  const handleFieldChange = (values: PersonalInformationFormValues) => {
    setUser((prev) => ({...prev, ...values}));
  };

  return (
    <div className="pb-10">
      <div className="">
        <div className="relative h-36 overflow-hidden bg-linear-to-r from-[#ede9fe] via-[#f4f1ff] to-[#fafafa]">
          <div className="absolute left-40 top-0 h-40 w-40 rounded-full bg-purple-300/20 blur-3xl" />
          <div className="absolute right-20 top-0 h-40 w-40 rounded-full bg-blue-200/20 blur-3xl" />

          <div className="md:hidden absolute right-13 bottom-0 ">
            <RankBadge rank={10} />
          </div>
          <div className="max-md:hidden absolute right-10 top-7 mr-10">
            <AvatarPicker setFile={setFile} />
          </div>
        </div>

        <div className="md:ml-30 md:mr-20 max-md:px-4">
          <ProfileHeader user={user} avatar={file} setFile={setFile} />

          <div className="relative md:hidden pt-5">
            <AvatarPicker setFile={setFile} />
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
                  <UpdatePasswordForm />
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
