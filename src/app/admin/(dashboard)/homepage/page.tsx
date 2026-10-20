import { getHomepageContent } from "@/lib/content";
import { getSessionUser } from "@/lib/auth";
import { HomepageEditor } from "./HomepageEditor";

export const metadata = {
  title: "Homepage Component Editor | BeeTrix360 Admin",
};

export default async function AdminHomepagePage() {
  const [content, user] = await Promise.all([
    getHomepageContent(),
    getSessionUser(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900">
            Homepage Component Studio
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Edit and customize each individual component rendered on the homepage. Changes immediately revalidate on the live site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-pink-50 text-bx-pink border border-pink-200 text-xs font-mono font-medium">
            Role: {user?.role.toUpperCase()}
          </span>
        </div>
      </div>

      <HomepageEditor initialContent={content} userRole={user?.role || "editor"} />
    </div>
  );
}
