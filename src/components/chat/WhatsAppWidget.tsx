"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { usePathname } from "next/navigation";
import { WhatsAppIcon } from "./WhatsAppIcon";
import type { ChatWidgetConfig } from "@/lib/chat-widget";
import { DEFAULT_CHAT_WIDGET_CONFIG } from "@/lib/chat-widget";

interface WhatsAppWidgetProps {
  initialConfig?: ChatWidgetConfig;
}

export function WhatsAppWidget({ initialConfig }: WhatsAppWidgetProps) {
  const pathname = usePathname();
  const [config, setConfig] = useState<ChatWidgetConfig>(initialConfig || DEFAULT_CHAT_WIDGET_CONFIG);
  const [isPastThreshold, setIsPastThreshold] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [userMessage, setUserMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Do not render inside admin studio
  const isAdmin = pathname?.startsWith("/admin");

  // Fetch live config if not provided
  useEffect(() => {
    if (initialConfig) return;
    fetch("/api/chat-widget")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setConfig(data);
        }
      })
      .catch((err) => {
        console.warn("[WhatsAppWidget] Could not fetch widget config:", err);
      });
  }, [initialConfig]);

  // Build dynamic default message with current page title and URL
  useEffect(() => {
    if (typeof window === "undefined") return;
    const pageTitle = document.title || "Beetrix360";
    const pageUrl = window.location.href;

    const template = config.defaultMessageTemplate || DEFAULT_CHAT_WIDGET_CONFIG.defaultMessageTemplate;
    const populated = template
      .replace(/{pageTitle}/g, pageTitle)
      .replace(/{pageUrl}/g, pageUrl);

    setUserMessage(populated);
  }, [config.defaultMessageTemplate, pathname]);

  // Scroll listener: display widget on 60% scroll depth
  useEffect(() => {
    if (typeof window === "undefined" || isAdmin || !config.enabled) return;

    const threshold = config.scrollThreshold ?? 60;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) {
        setIsPastThreshold(true);
        return;
      }
      const scrollPercent = (window.scrollY / scrollHeight) * 100;
      if (scrollPercent >= threshold) {
        setIsPastThreshold(true);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Check initial scroll in case user reloaded midway down
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [config.enabled, config.scrollThreshold, isAdmin]);

  // Focus textarea when popup opens
  useEffect(() => {
    if (isOpen && textareaRef.current) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  if (isAdmin || !config.enabled || isDismissed) {
    return null;
  }

  const cleanPhone = (config.whatsappNumber || "+14244416042").replace(/[^0-9]/g, "");

  const handleStartChat = () => {
    const text = encodeURIComponent(userMessage.trim());
    const waUrl = `https://wa.me/${cleanPhone}?text=${text}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
    setIsOpen(false);
  };

  const isRight = config.position !== "bottom-left";
  const posClasses = isRight ? "right-5 sm:right-7" : "left-5 sm:left-7";

  return (
    <>
      {/* Floating Launcher Button */}
      <div
        className={`fixed bottom-5 sm:bottom-20 z-[70] transition-all duration-500 ease-out ${posClasses} ${
          isPastThreshold ? "translate-y-0 opacity-100 scale-100" : "translate-y-16 opacity-0 scale-90 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="group relative flex items-center gap-3 px-4 py-3.5 rounded-full text-white shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-400"
          style={{ backgroundColor: config.primaryColor || "#25D366" }}
          aria-label={config.buttonLabel || "Chat with us on WhatsApp"}
          aria-expanded={isOpen}
        >
          {/* Subtle pulse ring */}
          <span
            className="absolute inset-0 rounded-full animate-ping opacity-25 pointer-events-none"
            style={{ backgroundColor: config.primaryColor || "#25D366" }}
          />

          <WhatsAppIcon className="w-7 h-7 shrink-0 text-white drop-shadow-sm" />

          {config.showLabel && (
            <span className="font-heading font-semibold text-sm tracking-tight pr-1 hidden xs:inline-block">
              {config.buttonLabel || "Chat on WhatsApp"}
            </span>
          )}

          {/* Unread badge indicator */}
          <span className="w-3 h-3 rounded-full bg-amber-300 border-2 border-white absolute -top-0.5 -right-0.5" />
        </button>
      </div>

      {/* WhatsApp Popup Card */}
      {isOpen && (
        <div
          className={`fixed bottom-24 z-[75] transition-all duration-300 ${posClasses} w-[calc(100vw-2.5rem)] max-w-[370px]`}
        >
          <div className="bg-white rounded-3xl shadow-2xl border border-neutral-100 overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
            {/* Header */}
            <div
              className="px-5 py-4 text-white relative flex items-center justify-between"
              style={{ backgroundColor: config.primaryColor || "#25D366" }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
                  <WhatsAppIcon className="w-6 h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-heading font-bold text-base leading-tight truncate">
                    {config.headerTitle || "Chat with Beetrix360"}
                  </h3>
                  <p className="text-[11px] text-white/90 font-medium truncate flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-200 animate-pulse" />
                    {config.headerSubtitle || "Typically replies in 15 mins"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 text-white flex items-center justify-center transition-colors shrink-0"
                aria-label="Close chat popup"
              >
                <i className="fa-solid fa-xmark text-sm" aria-hidden="true" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 bg-neutral-50/50">
              {/* Message Bubble */}
              <div className="bg-white border border-neutral-200/80 rounded-2xl p-3.5 shadow-xs relative">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[11px] font-mono font-semibold uppercase text-neutral-500">
                    {config.agentName || "Beetrix360 Growth Team"}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                  {config.popupWelcome || "Hi there! 👋 How can we help you accelerate your digital revenue today?"}
                </p>
              </div>

              {/* User Edit Message */}
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
                  Your message to send:
                </label>
                <textarea
                  ref={textareaRef}
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  rows={3}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-none transition shadow-2xs"
                  placeholder="Type your message..."
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleStartChat}
                  className="w-full py-3.5 rounded-xl font-heading font-semibold text-sm text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: config.primaryColor || "#25D366" }}
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                  <span>Start WhatsApp Chat</span>
                  <i className="fa-solid fa-arrow-right text-xs" aria-hidden="true" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-neutral-400 px-1 pt-1 font-mono">
                  <span>Direct WhatsApp Line</span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDismissed(true);
                      setIsOpen(false);
                    }}
                    className="hover:text-neutral-600 underline"
                  >
                    Hide widget
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

