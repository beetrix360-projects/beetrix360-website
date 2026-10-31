import React from "react";
import type { SectionBlockV2 } from "@/lib/types";
import { RichTextSection } from "./RichTextSection";
import { BulletListSection } from "./BulletListSection";
import { ChildCardsSection } from "./ChildCardsSection";
import { ProcessSection } from "./ProcessSection";
import { FaqSection } from "./FaqSection";
import { ProofPlaceholderSection } from "./ProofPlaceholderSection";
import { RelatedLinksSection } from "./RelatedLinksSection";
import { CtaSection } from "./CtaSection";

interface SectionRendererProps {
  sections: SectionBlockV2[];
  isAdmin?: boolean;
}

export function SectionRenderer({ sections, isAdmin = false }: SectionRendererProps) {
  // Exclude hero which is rendered at the top of the catch-all page
  const nonHeroSections = sections.filter((s) => s.type !== "hero");

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 2xl:px-20 py-8">
      {nonHeroSections.map((sec) => {
        switch (sec.type) {
          case "intro":
          case "richText":
            return (
              <RichTextSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                paragraphs={sec.content?.paragraphs || (sec.content?.body ? [sec.content.body] : [])}
                placeholder={sec.placeholder}
              />
            );

          case "bulletList":
            return (
              <BulletListSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                items={sec.content?.items || []}
                placeholder={sec.placeholder}
              />
            );

          case "childCards":
            return (
              <ChildCardsSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                subtitle={sec.content?.subtitle}
                cards={sec.content?.cards || []}
                placeholder={sec.placeholder}
              />
            );

          case "process":
            return (
              <ProcessSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                steps={sec.content?.steps || []}
                placeholder={sec.placeholder}
              />
            );

          case "faq":
            return (
              <FaqSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                items={sec.content?.items || []}
                placeholder={sec.placeholder}
              />
            );

          case "proofPlaceholder":
            return (
              <ProofPlaceholderSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                notice={sec.content?.notice}
                placeholder={sec.placeholder}
                isAdmin={isAdmin}
              />
            );

          case "relatedLinks":
            return (
              <RelatedLinksSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                links={sec.content?.links || []}
                placeholder={sec.placeholder}
              />
            );

          case "cta":
            return (
              <CtaSection
                key={sec.id}
                title={sec.title}
                headingLevel={sec.headingLevel === "h3" ? "h3" : "h2"}
                text={sec.content?.text}
                buttonLabel={sec.content?.buttonLabel}
                buttonPath={sec.content?.buttonPath}
                placeholder={sec.placeholder}
              />
            );

          default:
            return null;
        }
      })}
    </div>
  );
}

