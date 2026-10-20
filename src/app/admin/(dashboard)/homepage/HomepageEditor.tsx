"use client";

import React, { useState } from "react";
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Layers,
  Sparkles,
  TrendingUp,
  Cpu,
  Calculator,
  Calendar,
  PhoneCall,
  Search,
} from "lucide-react";
import type { HomepageContent } from "@/lib/types";
import { saveHomepageAction } from "../../actions";
import { ImageUploadField } from "@/components/admin/ImageUploadField";

interface Props {
  initialContent: HomepageContent;
  userRole: string;
}

export function HomepageEditor({ initialContent, userRole }: Props) {
  const [content, setContent] = useState<HomepageContent>(initialContent);
  const [activeTab, setActiveTab] = useState<string>("hero");
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const canEdit = ["admin", "editor", "moderator"].includes(userRole);

  const handleSave = async () => {
    if (!canEdit) {
      setStatusMessage({ type: "error", text: "You do not have write access to save changes." });
      return;
    }
    setSaving(true);
    setStatusMessage(null);
    try {
      const res = await saveHomepageAction(content);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Homepage successfully updated and live revalidated at ${new Date().toLocaleTimeString()}!`,
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: "error",
        text: err?.message || "Failed to save homepage changes.",
      });
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "hero", label: "Hero Section", icon: Sparkles },
    { id: "statement", label: "Problem Statement", icon: AlertCircle },
    { id: "pain", label: "Pain Cards", icon: Layers },
    { id: "pillars", label: "Four Pillars", icon: Cpu },
    { id: "pipeline", label: "Zero Touch Pipeline", icon: TrendingUp },
    { id: "roi", label: "ROI Calculator", icon: Calculator },
    { id: "process", label: "Rollout Timeline", icon: Calendar },
    { id: "contact", label: "Contact Section", icon: PhoneCall },
    { id: "seo", label: "SEO & JSON-LD", icon: Search },
  ];

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-2xl bg-white border border-neutral-200/90 shadow-xs sticky top-20 z-10">
        <div className="flex items-center gap-2">
          {statusMessage && (
            <div
              className={`text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 font-mono font-medium ${
                statusMessage.type === "success"
                  ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                  : "bg-red-50 border border-red-200 text-red-700"
              }`}
            >
              {statusMessage.type === "success" ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/"
            target="_blank"
            className="px-4 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <Eye className="w-3.5 h-3.5" />
            View Live
          </a>
          <button
            onClick={handleSave}
            disabled={saving || !canEdit}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-bx-pink to-bx-blue text-white text-xs font-semibold hover:opacity-95 active:scale-[0.98] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>Save All Components</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Component Selector Sidebar */}
        <div className="lg:col-span-1 space-y-1">
          <p className="text-[11px] font-mono uppercase text-neutral-400 px-3 mb-2 font-semibold tracking-wider">
            Components List
          </p>
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                  isActive
                    ? "bg-bx-pink text-white shadow-xs font-semibold"
                    : "text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Component Form Editor */}
        <div className="lg:col-span-3 bg-white border border-neutral-200 rounded-2xl p-6 shadow-xs">
          {/* Hero Section Tab */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Hero Component</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure top headline, animated badge text, and call-to-action triggers.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                    Badge Strong Lead
                  </label>
                  <input
                    type="text"
                    value={content.hero.badge.strong}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: {
                          ...content.hero,
                          badge: { ...content.hero.badge, strong: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                    Badge Description
                  </label>
                  <input
                    type="text"
                    value={content.hero.badge.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: {
                          ...content.hero,
                          badge: { ...content.hero.badge, text: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                    Main Headline
                  </label>
                  <textarea
                    rows={2}
                    value={content.hero.headline}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, headline: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                    Sub-Headline Paragraph
                  </label>
                  <textarea
                    rows={3}
                    value={content.hero.subheading}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, subheading: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                      Audit CTA Button Text
                    </label>
                    <input
                      type="text"
                      value={content.hero.auditForm.button}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: {
                            ...content.hero,
                            auditForm: { ...content.hero.auditForm, button: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                      Showreel Video Title
                    </label>
                    <input
                      type="text"
                      value={content.hero.showreel.title}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          hero: {
                            ...content.hero,
                            showreel: { ...content.hero.showreel, title: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-200">
                  <ImageUploadField
                    label="Hero Custom Banner / Showcase Image"
                    value={content.hero.image || ""}
                    onChange={(url) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, image: url },
                      })
                    }
                    helperText="Upload a showcase banner or graphic for the homepage hero. Saves to S3 & CDN."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Problem Statement Tab */}
          {activeTab === "statement" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Problem Statement Component</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Configure the core agency thesis and market pain overview.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                    Eyebrow Label
                  </label>
                  <input
                    type="text"
                    value={content.statement.eyebrow.label}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        statement: {
                          ...content.statement,
                          eyebrow: { ...content.statement.eyebrow, label: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                    Statement Paragraph
                  </label>
                  <textarea
                    rows={4}
                    value={content.statement.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        statement: { ...content.statement, text: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                      Button Label
                    </label>
                    <input
                      type="text"
                      value={content.statement.button.label}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          statement: {
                            ...content.statement,
                            button: { ...content.statement.button, label: e.target.value },
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-600 mb-1.5 font-semibold">
                      Bottom Note
                    </label>
                    <input
                      type="text"
                      value={content.statement.note}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          statement: {
                            ...content.statement,
                            note: e.target.value,
                          },
                        })
                      }
                      className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-bx-pink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pain Flip Cards Tab */}
          {activeTab === "pain" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Pain Flip Cards ({content.pain.cards.length} cards)</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Adjust metrics, front statements, and back solution callouts for each pain card.
                </p>
              </div>

              <div className="space-y-4">
                {content.pain.cards.map((card, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-semibold text-bx-pink">
                      <span>Card #{idx + 1} - Tag: {card.tag}</span>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                        Back Solution Label
                      </label>
                      <input
                        type="text"
                        value={card.back.label}
                        onChange={(e) => {
                          const newCards = [...content.pain.cards];
                          newCards[idx].back.label = e.target.value;
                          setContent({ ...content, pain: { ...content.pain, cards: newCards } });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-bx-pink focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">
                        Back Solution Explanation
                      </label>
                      <textarea
                        rows={2}
                        value={card.back.text}
                        onChange={(e) => {
                          const newCards = [...content.pain.cards];
                          newCards[idx].back.text = e.target.value;
                          setContent({ ...content, pain: { ...content.pain, cards: newCards } });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-bx-pink focus:outline-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Four Pillars Tab */}
          {activeTab === "pillars" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Four Pillars Component</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Edit the 4 core service pillars displayed on the homepage.
                </p>
              </div>

              <div className="space-y-4">
                {content.pillars.cards.map((pillar, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono font-semibold text-emerald-700">
                      <span>Pillar {pillar.number} - {pillar.tag}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">Title</label>
                        <input
                          type="text"
                          value={pillar.title}
                          onChange={(e) => {
                            const newCards = [...content.pillars.cards];
                            newCards[idx].title = e.target.value;
                            setContent({ ...content, pillars: { ...content.pillars, cards: newCards } });
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">Footer Tagline</label>
                        <input
                          type="text"
                          value={pillar.footer}
                          onChange={(e) => {
                            const newCards = [...content.pillars.cards];
                            newCards[idx].footer = e.target.value;
                            setContent({ ...content, pillars: { ...content.pillars, cards: newCards } });
                          }}
                          className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-neutral-600 mb-1 font-medium">Description</label>
                      <textarea
                        rows={2}
                        value={pillar.text}
                        onChange={(e) => {
                          const newCards = [...content.pillars.cards];
                          newCards[idx].text = e.target.value;
                          setContent({ ...content, pillars: { ...content.pillars, cards: newCards } });
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs focus:border-emerald-500 focus:outline-none"
                      />
                    </div>

                    <div className="pt-2 border-t border-neutral-200">
                      <ImageUploadField
                        label={`Pillar ${pillar.number} Card Image`}
                        value={pillar.image || ""}
                        onChange={(url) => {
                          const newCards = [...content.pillars.cards];
                          newCards[idx].image = url;
                          setContent({ ...content, pillars: { ...content.pillars, cards: newCards } });
                        }}
                        helperText="Upload a card mockup or visual to replace the striped placeholder."
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zero Touch Pipeline Tab */}
          {activeTab === "pipeline" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Zero Touch Pipeline</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Adjust the animated automation workflow cards and steps.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Heading</label>
                  <input
                    type="text"
                    value={content.pipeline.heading.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pipeline: {
                          ...content.pipeline,
                          heading: { ...content.pipeline.heading, text: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Heading Accent</label>
                  <input
                    type="text"
                    value={content.pipeline.heading.accent || ""}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pipeline: {
                          ...content.pipeline,
                          heading: { ...content.pipeline.heading, accent: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ROI Calculator Tab */}
          {activeTab === "roi" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">ROI Calculator Multipliers</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Calibrate interactive simulation defaults and formula coefficients.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Default Team Size ({content.roi.inputs.team.label})
                  </label>
                  <input
                    type="number"
                    value={content.roi.inputs.team.default}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roi: {
                          ...content.roi,
                          inputs: {
                            ...content.roi.inputs,
                            team: { ...content.roi.inputs.team, default: Number(e.target.value) },
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Default Blended Cost ($) ({content.roi.inputs.cost.label})
                  </label>
                  <input
                    type="number"
                    value={content.roi.inputs.cost.default}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        roi: {
                          ...content.roi,
                          inputs: {
                            ...content.roi.inputs,
                            cost: { ...content.roi.inputs.cost, default: Number(e.target.value) },
                          },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Rollout Timeline Tab */}
          {activeTab === "process" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Rollout Timeline ({content.process.steps.length} steps)</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Edit delivery phases, duration labels, and deliverables.
                </p>
              </div>

              <div className="space-y-4">
                {content.process.steps.map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-neutral-50 border border-neutral-200 space-y-2">
                    <div className="text-xs font-mono font-semibold text-amber-700">Step #{idx + 1} - {step.range}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={step.range}
                        onChange={(e) => {
                          const newSteps = [...content.process.steps];
                          newSteps[idx].range = e.target.value;
                          setContent({ ...content, process: { ...content.process, steps: newSteps } });
                        }}
                        className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs"
                      />
                      <input
                        type="text"
                        value={step.title}
                        onChange={(e) => {
                          const newSteps = [...content.process.steps];
                          newSteps[idx].title = e.target.value;
                          setContent({ ...content, process: { ...content.process, steps: newSteps } });
                        }}
                        className="px-3 py-1.5 bg-white border border-neutral-300 rounded-lg text-neutral-900 text-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Contact Section Tab */}
          {activeTab === "contact" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Contact & Strategy Call Section</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Adjust form headlines, direct booking triggers, and guarantees.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Section Heading Text</label>
                  <input
                    type="text"
                    value={content.contact.heading.text}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: {
                          ...content.contact,
                          heading: { ...content.contact.heading, text: e.target.value },
                        },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">Intro Description</label>
                  <textarea
                    rows={2}
                    value={content.contact.intro}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        contact: { ...content.contact, intro: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO & JSON-LD Tab */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div className="pb-4 border-b border-neutral-200">
                <h2 className="text-lg font-bold text-neutral-900 font-heading">Homepage SEO & Linked Data (JSON-LD)</h2>
                <p className="text-xs text-neutral-500 mt-1">
                  Update primary meta tags and examine the structured WebPage/Organization schema.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Meta Title (Browser Tab & Search Results)
                  </label>
                  <input
                    type="text"
                    value={content.seo.title}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        seo: { ...content.seo, title: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Meta Description
                  </label>
                  <textarea
                    rows={3}
                    value={content.seo.description}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        seo: { ...content.seo, description: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2 bg-neutral-50/70 border border-neutral-300 rounded-xl text-neutral-900 text-xs focus:bg-white focus:border-cyan-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-neutral-600 mb-1 font-semibold">
                    Live Compiled JSON-LD Preview (Injected into &lt;head&gt;)
                  </label>
                  <pre className="p-4 rounded-xl bg-neutral-900 text-cyan-300 font-mono text-[11px] overflow-x-auto max-h-56 leading-relaxed shadow-inner">
                    {JSON.stringify(
                      {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: content.seo.title,
                        description: content.seo.description,
                        url: "https://www.beetrix360.com/",
                        isPartOf: {
                          "@type": "WebSite",
                          name: "BeeTrix360",
                        },
                      },
                      null,
                      2
                    )}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
