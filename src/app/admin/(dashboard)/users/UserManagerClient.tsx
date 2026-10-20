"use client";

import React, { useState } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { UserProfile, UserRole } from "@/lib/auth";
import { createUserAction, deleteUserAction, updateUserRoleAction } from "../../actions";

interface Props {
  initialUsers: UserProfile[];
  currentUserId: string;
}

export function UserManagerClient({ initialUsers, currentUserId }: Props) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "editor" as UserRole,
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) return;
    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await createUserAction(newUser);
      if (res.user) {
        setUsers([...users, res.user]);
        setIsCreating(false);
        setNewUser({ name: "", email: "", password: "", role: "editor" });
        setStatusMessage({ type: "success", text: `User account for ${res.user.email} created!` });
      }
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to create user." });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    setLoading(true);
    setStatusMessage(null);
    try {
      await updateUserRoleAction(userId, newRole);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: newRole } : u)));
      setStatusMessage({ type: "success", text: "Role permission updated successfully." });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to update role." });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (userId === currentUserId) {
      setStatusMessage({ type: "error", text: "Cannot delete your own active admin account." });
      return;
    }
    if (!confirm(`Permanently revoke access and delete account for ${email}?`)) return;

    setLoading(true);
    try {
      await deleteUserAction(userId);
      setUsers(users.filter((u) => u.id !== userId));
      setStatusMessage({ type: "success", text: `Account ${email} revoked.` });
    } catch (err: any) {
      setStatusMessage({ type: "error", text: err?.message || "Failed to delete user." });
    } finally {
      setLoading(false);
    }
  };

  const roleDescriptions: Record<UserRole, { label: string; desc: string; badge: string }> = {
    admin: {
      label: "Full Admin Access",
      desc: "Unrestricted control: Manage users, arrange menus, delete pages, edit all components.",
      badge: "bg-pink-50 text-bx-pink border-pink-200",
    },
    editor: {
      label: "Update Access Only",
      desc: "Can edit homepage components, page copy, and SEO. CANNOT delete pages or manage menus/users.",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
    },
    moderator: {
      label: "Delete & Update Access",
      desc: "Can update content and delete obsolete pages/drafts. CANNOT alter menus or manage team users.",
      badge: "bg-amber-50 text-amber-700 border-amber-200",
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Creation Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs">
        <div>
          {statusMessage && (
            <div
              className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {statusMessage.type === "success" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600" />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCreating(!isCreating)}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-all flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>{isCreating ? "Close Form" : "Create New User"}</span>
        </button>
      </div>

      {/* Create User Form Drawer */}
      {isCreating && (
        <form onSubmit={handleCreateUser} className="p-6 rounded-2xl bg-white border border-purple-200 shadow-xs space-y-4">
          <div className="pb-3 border-b border-neutral-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900 font-heading">Provision Team Member</h3>
            <span className="text-xs text-neutral-500 font-mono">Bcrypt secured hashing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Full Name</label>
              <input
                type="text"
                required
                placeholder="Sarah Miller"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Work Email</label>
              <input
                type="email"
                required
                placeholder="sarah@beetrix360.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Initial Password</label>
              <input
                type="password"
                required
                placeholder="Min 8 characters"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Access Level (Role)</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:border-purple-500 focus:outline-none font-medium"
              >
                <option value="editor">Update Access (Editor)</option>
                <option value="moderator">Delete Access (Moderator)</option>
                <option value="admin">Full Admin Access</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-600 font-semibold">
            <Shield className="w-4 h-4 text-purple-600" />
            <span>Active Team Credentials & Access Control</span>
          </div>
        </div>

        <div className="divide-y divide-neutral-100">
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            const roleInfo = roleDescriptions[user.role];

            return (
              <div key={user.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-neutral-800 text-sm shrink-0 shadow-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-neutral-900">{user.name}</h4>
                      {isSelf && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-medium">
                          (You)
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-mono text-neutral-500 mt-0.5">{user.email}</p>
                    <p className="text-[11px] text-neutral-500 mt-1 max-w-lg">{roleInfo.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <select
                    value={user.role}
                    disabled={isSelf || loading}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                    className="px-3 py-1.5 bg-neutral-50 border border-neutral-300 rounded-xl text-neutral-900 text-xs font-mono focus:border-purple-500 focus:outline-none disabled:opacity-50 font-medium"
                  >
                    <option value="admin">Role: Full Admin</option>
                    <option value="editor">Role: Update Access</option>
                    <option value="moderator">Role: Delete Access</option>
                  </select>

                  {!isSelf && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.email)}
                      disabled={loading}
                      title="Revoke access"
                      className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
