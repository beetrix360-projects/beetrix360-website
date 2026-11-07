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
import { MediaStructuredData } from "@/components/site/MediaStructuredData";
import { getHomepageContent, getSiteSettings } from "@/lib/content";
import { getPageMediaMetadata, getPageMediaPlacementsMap } from "@/lib/media-placements";
import { webPageSchema } from "@/lib/schema";

export async function generateMetadata(): Promise<Metadata> {
  const [c, mediaSeo] = await Promise.all([
    getHomepageContent(),
    getPageMediaMetadata("home"),
  ]);
  return {
    title: { absolute: c.seo.title },
    description: c.seo.description,
    alternates: { canonical: "/" },
    openGraph: {
      title: c.seo.title,
      description: c.seo.description,
      url: "/",
      ...(mediaSeo.openGraphImages.length > 0
        ? { images: mediaSeo.openGraphImages }
        : {}),
      ...(mediaSeo.openGraphVideos.length > 0
        ? { videos: mediaSeo.openGraphVideos }
        : {}),
    },
    twitter: {
      title: c.seo.title,
      description: c.seo.description,
      ...(mediaSeo.twitterImages.length > 0
        ? { images: mediaSeo.twitterImages }
        : {}),
    },
  };
}

export default async function HomePage() {
  const [c, site, homeMediaMap] = await Promise.all([
    getHomepageContent(),
    getSiteSettings(),
    getPageMediaPlacementsMap("home"),
  ]);
  const showreelPlacement = homeMediaMap.get("hero_showreel_video");
  const heroWithMedia = showreelPlacement?.mediaUrl
    ? {
        ...c.hero,
        showreel: {
          ...c.hero.showreel,
          video: showreelPlacement.mediaUrl,
        },
      }
    : c.hero;

  return (
    <>
      <JsonLd data={webPageSchema({ path: "/", name: c.seo.title, description: c.seo.description })} />
      <MediaStructuredData pageSlug="home" />
      <Loader />
      <Hero hero={heroWithMedia} />
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
