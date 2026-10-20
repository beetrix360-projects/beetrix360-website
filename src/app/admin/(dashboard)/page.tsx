import Link from "next/link";
import {
  Home,
  FileText,
  Menu,
  Users,
  Search,
  ArrowRight,
  Database,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { getAllPages } from "@/lib/page-manager";
import { getSiteNavigation } from "@/lib/navigation";
import { getAllUsers } from "@/lib/auth";

export default async function AdminOverviewPage() {
  const [user, pages, nav, users] = await Promise.all([
    getSessionUser(),
    getAllPages(),
    getSiteNavigation(),
    getAllUsers(),
  ]);

  const parentPages = pages.filter((p) => p.parentId === null);
  const childPages = pages.filter((p) => p.parentId !== null);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-pink-50/60 via-blue-50/40 to-white border border-neutral-200/80 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-pink-200 text-bx-pink text-xs font-mono font-medium shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            STUDIO CONSOLE ACTIVE
          </div>
          <h1 className="text-3xl font-extrabold text-neutral-900 font-heading tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-2 text-sm text-neutral-600 leading-relaxed">
            From this command center, you can edit each individual homepage component, organize parent and child service pages, rearrange the mega menu hierarchy, manage team roles, and optimize JSON-LD structured data.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-pink-200 transition-colors">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Homepage Modules</span>
            <div className="w-8 h-8 rounded-xl bg-pink-50 text-bx-pink flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900">17</div>
          <p className="text-xs text-neutral-500 mt-1">Live editable components</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Managed Pages</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900">{pages.length}</div>
          <p className="text-xs text-neutral-500 mt-1">
            {parentPages.length} Parent Divisions · {childPages.length} Child Services
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-amber-200 transition-colors">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Navigation Tabs</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Menu className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900">{nav.header.length}</div>
          <p className="text-xs text-neutral-500 mt-1">Mega menu columns arranged</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-purple-200 transition-colors">
          <div className="flex items-center justify-between text-neutral-500 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider font-semibold">Authorized Team</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-bold font-mono text-neutral-900">{users.length}</div>
          <p className="text-xs text-neutral-500 mt-1">Role-Based Access Control</p>
        </div>
      </div>

      {/* Feature Modules Quick Action Grid */}
      <div>
        <h2 className="text-lg font-bold font-heading text-neutral-900 mb-4">Command Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Homepage Editor */}
          <Link
            href="/admin/homepage"
            className="group p-6 rounded-2xl bg-white border border-neutral-200 hover:border-bx-pink/50 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-bx-pink flex items-center justify-center mb-4 border border-pink-100">
                <Home className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-bx-pink transition-colors">
                1. Homepage Components
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Edit Hero headlines, Problem statement, Pain flip cards, Four pillars, ROI calculator multipliers, and Rollout timeline.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-bx-pink group-hover:translate-x-1 transition-transform">
              <span>Open Component Editor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Module 2: Pages & Parents */}
          <Link
            href="/admin/pages"
            className="group p-6 rounded-2xl bg-white border border-neutral-200 hover:border-emerald-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-emerald-700 transition-colors">
                2. Pages & Parent Hierarchies
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Manage parent divisions (like /digital-marketing), child service pages, and grandchild subservices with custom blocks.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
              <span>Explore Page Tree</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Module 3: Menu Arrangement */}
          <Link
            href="/admin/navigation"
            className="group p-6 rounded-2xl bg-white border border-neutral-200 hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                <Menu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-amber-700 transition-colors">
                3. Menu Arrangement
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Reorder header navigation tabs, rearrange mega-menu columns, add custom links, and adjust responsive menu layouts.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-600 group-hover:translate-x-1 transition-transform">
              <span>Reorder Menus</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Module 4: User Access & Roles */}
          <Link
            href="/admin/users"
            className="group p-6 rounded-2xl bg-white border border-neutral-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-purple-700 transition-colors">
                4. Users & Access Control (RBAC)
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Create new team members with segregated roles: Full Admin (everything), Update/Editor (content only), or Delete/Moderator.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-purple-600 group-hover:translate-x-1 transition-transform">
              <span>Manage Roles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Module 5: SEO & JSON-LD */}
          <Link
            href="/admin/seo"
            className="group p-6 rounded-2xl bg-white border border-neutral-200 hover:border-cyan-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-4 border border-cyan-100">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900 group-hover:text-cyan-800 transition-colors">
                5. SEO & JSON-LD Engine
              </h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Inspect structured data schemas (Organization, Service, FAQPage, HowTo) automatically compiled and injected into the &lt;head&gt;.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-700 group-hover:translate-x-1 transition-transform">
              <span>Configure SEO</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Module 6: Storage Engine Status */}
          <div className="p-6 rounded-2xl bg-white border border-neutral-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-neutral-900">AWS Storage Engine</h3>
              <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
                Single-table architecture compatible with Amazon DynamoDB and local JSON persistence during development.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs font-mono text-emerald-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Table: Beetrix_Content Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
