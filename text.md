import HeroGeometric from "@/components/kokonutui/hero-geometric"
import Navigation from "@/components/navigation"
import About from "@/components/about"
import TeamSection from "@/components/team-section"
import Footer from "@/components/footer"
import CursorFollower from "@/components/cursor-follower"
import ContactSection from "@/components/contact-section"

// Removi: AIAutomationSection, ProcessSection, CTA, PreFooterCTA, Features
// Motivo: Eram específicos para venda de software/IA, desnecessários para um DA.

export default function Home() {
  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-green-500/30">
      <CursorFollower />
      <Navigation />

      {/* Hero Section
        Nota: Se o componente HeroGeometric aceitar apenas 'title1',
        você pode precisar editar o arquivo dele para aceitar um subtítulo
        ou colocar todo o texto em uma string só.
      */}
      <div className="relative z-10">
        <HeroGeometric
          badge="Gestão 2024 - 2025"
          title1="Diretório Acadêmico IFBA"
        />
      </div>

      {/* Seção Sobre / Eventos
        (Usei o About aqui, mas futuramente você pode criar um componente <Events />)
      */}
      <section id="eventos" className="relative z-10 bg-[#030303] py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-white/90">
            Nossa Atuação
          </h2>
          <About />
        </div>
      </section>

      {/* Seção Calendário (Placeholder)
        Ideal para colocar datas de provas, assembleias, festas.
      */}
      <section id="calendario" className="relative z-10 bg-[#030303]/50 py-20 border-y border-white/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white/90">
            Calendário Acadêmico
          </h2>
          <p className="text-white/50 max-w-2xl mx-auto">
            Fique por dentro das datas importantes, reuniões do colegiado e eventos do campus.
            (Em breve: integração com Google Calendar ou lista de eventos)
          </p>
        </div>
      </section>

      {/* Seção do Time / Gestão */}
      <section id="time" className="relative z-10 bg-[#030303] py-20">
        <TeamSection />
      </section>

      {/* Seção de Contato */}
      <section id="contato" className="relative z-10 bg-[#030303] py-20">
        <ContactSection />
      </section>

      <Footer />
    </main>
  )
}
