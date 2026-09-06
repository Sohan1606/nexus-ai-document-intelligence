import { Navigation } from '@/components/layout/Navigation'
import { Footer } from '@/components/layout/Footer'
import { ScrollProgress } from '@/components/layout/ScrollProgress'
import { Hero } from '@/components/sections/Hero'
import { Problem } from '@/components/sections/Problem'
import { SemanticSearch } from '@/components/sections/SemanticSearch'
import { RagPipeline } from '@/components/sections/RagPipeline'
import { AnswerExperience } from '@/components/sections/AnswerExperience'
import { TrustTrail } from '@/components/sections/TrustTrail'
import { MultiDocument } from '@/components/sections/MultiDocument'
import { Timeline } from '@/components/sections/Timeline'
import { KnowledgeGraph } from '@/components/sections/KnowledgeGraph'
import { WorkspacePreview } from '@/components/sections/WorkspacePreview'
import { UploadExperience } from '@/components/sections/UploadExperience'
import { ChatDemo } from '@/components/sections/ChatDemo'
import { Architecture } from '@/components/sections/Architecture'
import { OpenSource } from '@/components/sections/OpenSource'
import { Security } from '@/components/sections/Security'
import { Engineering } from '@/components/sections/Engineering'
import { FeatureGrid } from '@/components/sections/FeatureGrid'
import { Gallery } from '@/components/sections/Gallery'
import { Craftsmanship } from '@/components/sections/Craftsmanship'
import { FinalCta } from '@/components/sections/FinalCta'
import { useLenis } from '@/hooks/useLenis'

export default function Home() {
  useLenis(true)

  return (
    <>
      <a
        href="#product"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-void"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <Navigation />
      <main>
        <Hero />
        <Problem />
        <SemanticSearch />
        <RagPipeline />
        <AnswerExperience />
        <TrustTrail />
        <MultiDocument />
        <Timeline />
        <KnowledgeGraph />
        <WorkspacePreview />
        <UploadExperience />
        <ChatDemo />
        <Architecture />
        <OpenSource />
        <Security />
        <Engineering />
        <FeatureGrid />
        <Gallery />
        <Craftsmanship />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
