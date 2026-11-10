"use client";

import React, { useState, useMemo } from "react";
import {
  Inbox,
  Search,
  ExternalLink,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
  Tag,
  MousePointerClick,
  Layers,
  ChevronDown,
} from "lucide-react";
import { WhatsAppIcon } from "@/components/chat/WhatsAppIcon";
import type { LeadInquiry } from "@/lib/types";

interface Props {
  initialInquiries: LeadInquiry[];
}

export function InquiriesAdmin({ initialInquiries }: Props) {
  const [inquiries, setInquiries] = useState<LeadInquiry[]>(initialInquiries);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [goalFilter, setGoalFilter] = useState<string>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/inquiries");
      if (res.ok) {
        const data = await res.json();
        setInquiries(data.inquiries || []);
      }
    } catch (err) {
      console.error("Failed to refresh inquiries:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/inquiries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (res.ok) {
        setInquiries((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status: newStatus as any } : item))
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((item) => {
      if (statusFilter !== "all" && item.status !== statusFilter) return false;
      if (goalFilter !== "all" && item.goal?.toLowerCase() !== goalFilter.toLowerCase()) return false;
      if (!search.trim()) return true;

      const q = search.toLowerCase();
      return (
        item.name?.toLowerCase().includes(q) ||
        item.email?.toLowerCase().includes(q) ||
        item.whatsapp?.toLowerCase().includes(q) ||
        item.website?.toLowerCase().includes(q) ||
        item.sectionName?.toLowerCase().includes(q) ||
        item.buttonName?.toLowerCase().includes(q) ||
        item.notes?.toLowerCase().includes(q)
      );
    });
  }, [inquiries, statusFilter, goalFilter, search]);

  const stats = useMemo(() => {
    const total = inquiries.length;
    const newCount = inquiries.filter((i) => i.status === "new").length;
    const contactedCount = inquiries.filter((i) => i.status === "contacted").length;
    return { total, newCount, contactedCount };
  }, [inquiries]);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Customer Acquisition CRM</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-neutral-900 tracking-tight flex items-center gap-2.5">
            <Inbox className="w-6 h-6 text-emerald-600" />
            <span>Lead Inquiries &amp; Attribution</span>
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Incoming customer inquiries submitted through website forms with complete page origin tracking.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-sm font-medium text-neutral-700 shadow-xs transition-colors self-start sm:self-center"
        >
          <RefreshCw className={`w-4 h-4 text-neutral-500 ${isRefreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-neutral-400 font-semibold">Total Inquiries</p>
            <p className="text-3xl font-heading font-extrabold text-neutral-900 mt-1">{stats.total}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600">
            <Inbox className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-emerald-600 font-semibold">New Leads</p>
            <p className="text-3xl font-heading font-extrabold text-emerald-600 mt-1">{stats.newCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-mono uppercase text-blue-600 font-semibold">Contacted</p>
            <p className="text-3xl font-heading font-extrabold text-blue-600 mt-1">{stats.contactedCount}</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-neutral-200 shadow-xs flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, phone, website or section..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-400 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 text-xs font-medium rounded-xl border border-neutral-200 bg-neutral-50 text-neutral-700 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="new">New Only</option>
            <option value="contacted">Contacted</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Inquiries List */}
      {filteredInquiries.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-dashed border-neutral-300">
          <Inbox className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="font-heading font-bold text-neutral-800 text-lg">No inquiries found</p>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all"
              ? "No inquiries matched your current filter criteria."
              : "Leads submitted via the website contact form or audit modals will appear here in real time."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((item) => {
            const cleanPhone = item.whatsapp ? item.whatsapp.replace(/[^0-9]/g, "") : null;
            const waLink = cleanPhone ? `https://wa.me/${cleanPhone}` : null;
            const siteUrl = item.website
              ? item.website.startsWith("http")
                ? item.website
                : `https://${item.website}`
              : null;

            return (
              <div
                key={item.id}
                className="p-6 rounded-2xl bg-white border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
                      {item.name ? item.name.charAt(0).toUpperCase() : "L"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-bold text-neutral-900 text-base">{item.name}</h3>
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-semibold border ${
                            item.status === "new"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : item.status === "contacted"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-neutral-100 text-neutral-600 border-neutral-200"
                          }`}
                        >
                          {item.status}
                        </span>
                        {item.goal && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 border border-neutral-200">
                            {item.goal}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-1.5 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(item.createdAt).toLocaleString("en-US", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Status switch actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <select
                      value={item.status}
                      disabled={updatingId === item.id}
                      onChange={(e) => handleStatusChange(item.id, e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 focus:outline-none"
                    >
                      <option value="new">Mark New</option>
                      <option value="contacted">Mark Contacted</option>
                      <option value="archived">Archive</option>
                    </select>
                  </div>
                </div>

                {/* Contact information details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-neutral-100 text-xs">
                  {/* Email */}
                  <div className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                    <a
                      href={`mailto:${item.email}`}
                      className="font-medium text-neutral-800 hover:text-emerald-600 truncate underline decoration-neutral-300"
                    >
                      {item.email}
                    </a>
                  </div>

                  {/* WhatsApp */}
                  <div className="flex items-center justify-between gap-2 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                    <div className="flex items-center gap-2 min-w-0">
                      <WhatsAppIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono text-neutral-800 truncate">
                        {item.whatsapp || "No phone provided"}
                      </span>
                    </div>
                    {waLink && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md shrink-0 flex items-center gap-1 transition-colors"
                      >
                        Chat
                      </a>
                    )}
                  </div>

                  {/* Website */}
                  <div className="flex items-center gap-2 bg-neutral-50 p-2.5 rounded-xl border border-neutral-100">
                    <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
                    {siteUrl ? (
                      <a
                        href={siteUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-neutral-800 hover:text-bx-blue truncate underline decoration-neutral-300"
                      >
                        {item.website}
                      </a>
                    ) : (
                      <span className="text-neutral-400">No website provided</span>
                    )}
                  </div>
                </div>

                {/* Origin Attribution Box */}
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono uppercase font-bold text-blue-700 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      Origin:
                    </span>
                    <span className="font-semibold text-neutral-800">{item.sectionName || "Website"}</span>
                    {item.buttonName && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-mono">
                        <MousePointerClick className="w-2.5 h-2.5" />
                        Trigger: {item.buttonName}
                      </span>
                    )}
                    {item.budget && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
                        Budget: {item.budget}
                      </span>
                    )}
                  </div>

                  {item.pageUrl && (
                    <a
                      href={item.pageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-mono text-blue-600 hover:text-blue-800 truncate max-w-xs flex items-center gap-1"
                    >
                      <span className="truncate">{item.pageUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  )}
                </div>

                {/* Notes or message */}
                {item.notes && (
                  <div className="p-3 rounded-xl bg-neutral-50 border border-neutral-200 text-xs text-neutral-700">
                    <p className="font-semibold text-neutral-500 text-[10px] uppercase font-mono mb-1">
                      Message / Notes:
                    </p>
                    <p className="whitespace-pre-line leading-relaxed">{item.notes}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

