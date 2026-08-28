"use client";

import React, {useState} from "react";
import {Plus} from "lucide-react";

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "organization" | "user" | "compliance"
  >("organization");

  return (
    <div className="w-full">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Settings
        </h1>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-xs hover:bg-violet-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add user</span>
        </button>
      </div>

      <div className="mb-6 inline-flex rounded-xl bg-gray-200/60 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("organization")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "organization"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Organization
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("user")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "user"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          User & Permission
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("compliance")}
          className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
            activeTab === "compliance"
              ? "bg-white text-gray-900 shadow-xs"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Compliance
        </button>
      </div>

      <div className="min-h-[600px] w-full rounded-2xl border border-gray-200/80 bg-white p-8 shadow-2xs">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-6 text-sm font-bold text-gray-900">
              Organization details
            </h2>

            <div className="rounded-2xl bg-gray-50/70 p-6">
              <span className="text-[11px] font-bold tracking-wider text-gray-800 uppercase">
                ACTIVITY
              </span>

              <div className="mt-6 grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Last activity/Log in
                  </p>
                  <p className="mt-1 text-xs text-gray-500">2 hour ago</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Update billing information
                  </p>
                  <p className="mt-1 text-xs text-gray-500">1 week ago</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    View Patient record
                  </p>
                  <p className="mt-1 text-xs text-gray-500">1 day ago</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-900">
                    Office Name
                  </p>
                  <p className="mt-1 text-xs text-gray-500">Building A</p>
                </div>
              </div>
            </div>
          </div>

          {/* <div>
            <h2 className="mb-6 text-sm font-bold text-gray-900">
              Organization details
            </h2>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Settings;
