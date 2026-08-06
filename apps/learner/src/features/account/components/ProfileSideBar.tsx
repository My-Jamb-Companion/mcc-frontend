import {Icon} from "@mcc/ui";
import type {SidebarSectionKey} from "../constants/types";

interface ProfileSidebarProps {
  active: SidebarSectionKey;
  onChange: (key: SidebarSectionKey) => void;
}

export function ProfileSidebar({active, onChange}: ProfileSidebarProps) {
  return (
    <div className="w-full max-w-xs space-y-3">
      <button
        type="button"
        onClick={() => onChange("profileInfo")}
        className={`flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-colors ${
          active === "profileInfo"
            ? "bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Icon icon="mdi:account-outline" size={18} className="mt-0.5" />
        <span>
          <p className="text-sm font-semibold">Profile Information</p>
          <p
            className={`text-xs ${active === "profileInfo" ? "text-white/80" : "text-gray-400"}`}
          >
            Change your profile information
          </p>
        </span>
      </button>

      <button
        type="button"
        onClick={() => onChange("password")}
        className={`flex w-full items-start gap-3 rounded-xl px-4 py-3.5 text-left transition-colors ${
          active === "password"
            ? "bg-linear-to-r from-violet-600 to-fuchsia-500 text-white shadow-md"
            : "text-gray-700 hover:bg-gray-50"
        }`}
      >
        <Icon icon="mdi:lock-reset" size={18} className="mt-0.5" />
        <span>
          <p className="text-sm font-semibold">Update password</p>
          <p
            className={`text-xs ${active === "password" ? "text-white/80" : "text-gray-400"}`}
          >
            Change your password
          </p>
        </span>
      </button>
    </div>
  );
}
