import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import StudentIdSection from "@/components/student-id-section"

export const metadata = {
  title: "Carteirinha do Estudante",
  description: "Compare ID Jovem gratuita e a carteira estudantil oficial em um único lugar."
}

export default function CarteirinhaPage() {
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
