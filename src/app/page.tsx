import HeroGeometric from "@/components/kokonutui/hero-geometric"
import Navigation from "@/components/navigation"
import CursorFollower from "@/components/cursor-follower"
import ContactSection from "@/components/contact-section"
import EventsSection from "@/components/events/event-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-green-500/30">
      <CursorFollower />
      <Navigation />

      <div className="relative z-10">
        <HeroGeometric
          badge="Gestão 2025 - 2026"
          title1="Diretório Acadêmico IFBA"
        />
      </div>

      <EventsSection />
{/*       <Features />
      <About />
      <CTA />
      <TeamSection />
      <PreFooterCTA />
      <ContactSection />
      <Footer /> */}
    </main>
  )
}
