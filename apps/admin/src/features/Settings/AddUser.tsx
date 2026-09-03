"use client";

import React, {useState} from "react";
import {X, ChevronDown} from "lucide-react";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddUser?: (formData: UserFormData) => void;
}

export interface UserFormData {
  userName: string;
  email: string;
  role: string;
  addedDate: string;
  gender: string;
  grantAccess: boolean;
}

const ROLES = ["Admin", "Teacher", "Super admin"];
const GENDERS = ["Male", "Female", "Other"];

export default function AddUserModal({
  isOpen,
  onClose,
  onAddUser,
}: AddUserModalProps) {
  const [formData, setFormData] = useState<UserFormData>({
    userName: "",
    email: "",
    role: "Admin",
    addedDate: "02, May 2026",
    gender: "",
    grantAccess: false,
  });

  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isGenderOpen, setIsGenderOpen] = useState(false);

  const isFormComplete =
    formData.userName.trim() !== "" &&
    formData.email.trim() !== "" &&
    formData.role !== "" &&
    formData.gender !== "";

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddUser?.(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
      <div className="relative flex h-full w-full max-w-xl flex-col rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Add user &amp; Persmision
          </h2>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          id="add-user-form"
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* User Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                User Name
              </label>
              <input
                type="text"
                placeholder="Enter full name"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({...formData, userName: e.target.value})
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                placeholder="oa@mail.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({...formData, email: e.target.value})
                }
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Role Dropdown */}
            <div className="relative flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Role
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsRoleOpen(!isRoleOpen);
                  setIsGenderOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              >
                <span>{formData.role || "Select role"}</span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Role Select Options */}
              {isRoleOpen && (
                <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                  {ROLES.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, role});
                        setIsRoleOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors hover:bg-slate-100 ${
                        formData.role === role
                          ? "bg-slate-100 font-medium text-slate-900"
                          : "text-slate-700"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Added Date */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Date Created
              </label>
              <input
                type="text"
                value={formData.addedDate}
                disabled
                className="w-full rounded-lg text-muted/70 border border-slate-200 px-3 py-2.5 text-sm cursor-not-allowed outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              />
            </div>

            {/* Your Gender Dropdown */}
            <div className="relative flex flex-col gap-1.5 col-span-2">
              <label className="text-xs font-semibold text-slate-700">
                Your Gender
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsGenderOpen(!isGenderOpen);
                  setIsRoleOpen(false);
                }}
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-400 outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600"
              >
                <span
                  className={
                    formData.gender ? "text-slate-800" : "text-slate-400"
                  }
                >
                  {formData.gender || "Select gender"}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {/* Gender Options */}
              {isGenderOpen && (
                <div className="absolute top-full left-0 z-20 mt-1 w-full rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                  {GENDERS.map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => {
                        setFormData({...formData, gender});
                        setIsGenderOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Grant Access Switch */}
          <div className="mt-6 flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-700">
              Grant Access
            </label>
            <button
              type="button"
              onClick={() =>
                setFormData({...formData, grantAccess: !formData.grantAccess})
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.grantAccess ? "bg-purple-600" : "bg-slate-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  formData.grantAccess ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </form>

        {/* Footer Button */}
        <div className="rounded-b-xl bg-[#F3F4F6]">
          <button
            type="submit"
            form="add-user-form"
            disabled={!isFormComplete}
            className={`w-full text-center text-sm font-semibold transition-colors px-6 py-4 ${
              isFormComplete
                ? "bg-purple-600 text-white border-purple-600 hover:bg-purple-700"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Add User
          </button>
        </div>
      </div>
    </div>
  );
}
