"use client";

import React, { useState } from "react";
import { Lock, Mail, ArrowRight, AlertCircle, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || "Authentication failed. Please verify credentials.");
        setLoading(false);
      } else if (data.success) {
        window.location.href = "/admin";
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} method="POST" className="space-y-5">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2 font-semibold">
          Email Address
        </label>
        <div className="relative">
          <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            name="email"
            type="email"
            required
            defaultValue="admin@beetrix360.com"
            placeholder="admin@beetrix360.com"
            className="w-full pl-10 pr-4 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-bx-pink focus:ring-1 focus:ring-bx-pink transition-all text-xs"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-700 mb-2 font-semibold">
          Security Key / Password
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            required
            defaultValue="admin123456"
            placeholder="••••••••"
            className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 placeholder-neutral-400 focus:bg-white focus:outline-none focus:border-bx-pink focus:ring-1 focus:ring-bx-pink transition-all text-xs"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-bx-pink to-bx-blue text-white font-semibold rounded-xl hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <span>Authenticate Session</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
