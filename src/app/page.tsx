import type { Metadata } from "next";
import {
  ChapterNav,
  ClientMarquee,
  CompareSlider,
  ContactSection,
  FloatingCta,
  FourPillars,
  GeoSection,
  Hero,
  HomeAnimations,
  KineticBand,
  Loader,
  PainFlipCards,
  ProblemStatement,
  ProofSection,
  RoiCalculator,
  RolloutTimeline,
  ZeroTouchPipeline,
} from "@/components/home";
import { JsonLd } from "@/components/site/JsonLd";
import { getHomepageContent, getSiteSettings } from "@/lib/content";
import { webPageSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getHomepageContent();
  return {
    title: { absolute: c.seo.title },
    description: c.seo.description,
    alternates: { canonical: "/" },
    openGraph: { title: c.seo.title, description: c.seo.description, url: "/" },
    twitter: { title: c.seo.title, description: c.seo.description },
  };
}

export default async function HomePage() {
  const [c, site] = await Promise.all([getHomepageContent(), getSiteSettings()]);
  return (
    <>
      <JsonLd data={webPageSchema({ path: "/", name: c.seo.title, description: c.seo.description })} />
      <Loader />
      <Hero hero={c.hero} />
      <ClientMarquee clients={c.clients} />
      <ProblemStatement s={c.statement} />
      <PainFlipCards pain={c.pain} />
      <FourPillars p={c.pillars} />
      <KineticBand k={c.kineticPillars} />
      <ZeroTouchPipeline p={c.pipeline} />
      <GeoSection g={c.geo} />
      <CompareSlider c={c.compare} />
      <KineticBand k={c.kineticProof} />
      <ProofSection w={c.work} />
      <RoiCalculator r={c.roi} />
      <RolloutTimeline p={c.process} />
      <ContactSection c={c.contact} phone={site.phone} />
      <FloatingCta f={c.floatingCta} />
      <ChapterNav chapters={c.chapters} />
      <HomeAnimations />
    </>
  );
}
