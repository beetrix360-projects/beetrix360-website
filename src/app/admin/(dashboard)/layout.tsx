import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Home,
  FileText,
  Menu as MenuIcon,
  Users,
  Search,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { logoutAction } from "../actions";

export const metadata = {
  title: "BeeTrix360 Admin Studio",
};

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  if (!user) {
    redirect("/admin/login");
  }

  const roleBadgeColors = {
    admin: "bg-pink-50 text-bx-pink border-pink-200",
    editor: "bg-blue-50 text-blue-600 border-blue-200",
    moderator: "bg-amber-50 text-amber-700 border-amber-200",
  }[user.role];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-800 flex antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-neutral-200 bg-white flex flex-col shrink-0 shadow-xs">
        <div className="h-16 px-6 flex items-center justify-between border-b border-neutral-200">
          <Link href="/admin" className="flex items-center gap-2 font-heading font-extrabold text-lg tracking-tight text-neutral-900">
            <span>BeeTrix<span className="text-bx-pink">360</span></span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 font-semibold border border-neutral-200">
              STUDIO
            </span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="p-3.5 mx-3 my-3 rounded-xl bg-neutral-50/80 border border-neutral-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-bx-pink to-bx-blue flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-xs">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-neutral-900 truncate">{user.name}</p>
            <span className={`inline-block text-[10px] uppercase font-mono px-2 py-0.2 rounded-full border ${roleBadgeColors} font-medium`}>
              {user.role}
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-bx-blue" />
            <span>Console Overview</span>
          </Link>

          <Link
            href="/admin/homepage"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <Home className="w-4 h-4 text-bx-pink" />
            <span>Homepage Editor</span>
          </Link>

          <Link
            href="/admin/pages"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <FileText className="w-4 h-4 text-bx-green" />
            <span>Pages & Parents</span>
          </Link>

          <Link
            href="/admin/navigation"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <MenuIcon className="w-4 h-4 text-amber-500" />
            <span>Menu Arrangement</span>
          </Link>

          {user.role === "admin" && (
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
            >
              <Users className="w-4 h-4 text-purple-600" />
              <span>Users & Roles (RBAC)</span>
            </Link>
          )}

          <Link
            href="/admin/seo"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          >
            <Search className="w-4 h-4 text-cyan-600" />
            <span>SEO & JSON-LD</span>
          </Link>
        </nav>

        {/* Quick Links & Sign Out */}
        <div className="p-3 border-t border-neutral-200 space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-mono text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Live Website
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold">● Online</span>
          </Link>

          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out Session
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-neutral-200 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-xs font-mono text-neutral-500 uppercase tracking-wider font-medium">
              AWS Amplify + DynamoDB Storage Engine
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-all flex items-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Preview Live Site
            </Link>
          </div>
        </header>

        <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
