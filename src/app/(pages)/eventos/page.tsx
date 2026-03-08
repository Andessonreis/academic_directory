import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import EventsSection from "@/components/events/event-section"

export default function EventosPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <Navigation />
      <div className="pt-20">
        <EventsSection />
      </div>
      <Footer />
    </main>
  )
}
