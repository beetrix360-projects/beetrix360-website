import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Admin Login | BeeTrix360 Studio",
};

export default async function AdminLoginPage() {
  const user = await getSessionUser();
  if (user) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-neutral-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background pastel glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bx-pink/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-bx-blue/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200 text-xs font-mono tracking-wider text-neutral-700 shadow-xs mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            STUDIO ENGINE v2.6
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight font-heading text-neutral-900">
            BeeTrix<span className="text-bx-pink">360</span> Studio
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Sign in to manage homepage components, page hierarchies, navigation menus, and SEO schemas.
          </p>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-3xl p-8 shadow-sm">
          <LoginForm />
        </div>

        <div className="mt-6 text-center text-xs text-neutral-500">
          <p className="font-mono">Initial Master Admin: admin@beetrix360.com / admin123456</p>
        </div>
      </div>
    </div>
  );
}
