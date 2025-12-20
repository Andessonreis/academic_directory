import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import StudentIdSection from "@/components/student-id-section"

export const metadata = {
  title: "Identificação Estudantil",
  description: "Compare o ID Jovem e a Carteira de Estudante oficial em um único espaço."
}


export default function StudentIdPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-green-500/30">
      <Navigation />
      <div className="pt-16">{/* spacing below nav */}
        <StudentIdSection />
      </div>
      <Footer />
    </main>
  )
}
