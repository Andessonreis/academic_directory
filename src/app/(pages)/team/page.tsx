import Navigation from "@/components/navigation"
import TeamSection from "@/components/team/team-section"
import Footer from "@/components/footer"
import CursorFollower from "@/components/cursor-follower"
import PixelBlast from "@/components/PixelBlast"

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-[#030303] text-white selection:bg-green-500/30 relative">
      <div className="fixed inset-0 z-50 pointer-events-none mix-blend-screen">
        <PixelBlast
          variant="circle"
          pixelSize={4}
          color="#2a1b54"
          patternScale={8}
          patternDensity={0.3}
          pixelSizeJitter={0.2}
          enableRipples={true}
          rippleSpeed={0.2}
          rippleThickness={0.05}
          rippleIntensityScale={0.8}
          liquid={true}
          liquidStrength={0.05}
          liquidRadius={0.8}
          liquidWobbleSpeed={0.5}
          speed={0.2}
          edgeFade={0.6}
          transparent={true}
        />
      </div>

      <div className="relative z-10">
        <CursorFollower />
        <Navigation />

        <div className="h-20" />

        <TeamSection />
        <Footer />
      </div>
    </main>
  )
}
