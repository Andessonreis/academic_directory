import Navigation from "@/components/navigation"
import CalendarSection from "@/components/calendar"
import Footer from "@/components/footer"

export const metadata = {
  title: "Calendário Acadêmico | Diretório Acadêmico IFBA Irecê",
  description: "Eventos, feriados e prazos oficiais do IFBA Irecê organizados por curso.",
}

export default function CalendarioPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <Navigation />
      <div className="pt-20">
        <CalendarSection />
      </div>
      <Footer />
    </main>
  )
}
