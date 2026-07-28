import { CapabilityGrid } from "@/components/landing/CapabilityGrid";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { Hero } from "@/components/landing/Hero";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingNav } from "@/components/landing/LandingNav";
import { PreviewMock } from "@/components/landing/PreviewMock";
import { Section } from "@/components/landing/Section";
import { TypeGrid } from "@/components/landing/TypeGrid";

export default function Home() {
  return (
    <>
      <LandingNav />
      <main className="flex-1">
        <Hero />

        <Section
          eyebrow="What goes in"
          title="Seven kinds of thing, one hub"
          lead="Every item has a type, so a mixed list still reads at a glance. Colors and icons stay consistent everywhere in the app."
        >
          <TypeGrid />
        </Section>

        <Section
          eyebrow="Inside"
          title="Built to get you back to it"
          lead="Pinned items rise to the top, collections group what belongs together, and tags make everything findable later."
        >
          <PreviewMock />
        </Section>

        <Section eyebrow="Capabilities" title="What you can do">
          <CapabilityGrid />
        </Section>

        <ClosingCta />
      </main>
      <LandingFooter />
    </>
  );
}
