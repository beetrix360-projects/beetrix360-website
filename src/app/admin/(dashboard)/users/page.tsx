import { redirect } from "next/navigation";
import { getAllUsers, getSessionUser } from "@/lib/auth";
import { UserManagerClient } from "./UserManagerClient";

export const metadata = {
  title: "User Management & RBAC | BeeTrix360 Admin",
};

export default async function AdminUsersPage() {
  const [currentUser, allUsers] = await Promise.all([
    getSessionUser(),
    getAllUsers(),
  ]);

  if (!currentUser || currentUser.role !== "admin") {
    redirect("/admin");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900">
            User Access & Role Management (RBAC)
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Provision team accounts and delegate fine-grained Update Access, Delete Access, or Full Admin privileges.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200 text-xs font-mono font-medium">
            {allUsers.length} Active Accounts
          </span>
        </div>
      </div>

      <UserManagerClient initialUsers={allUsers} currentUserId={currentUser.id} />
    </div>
  );
}
