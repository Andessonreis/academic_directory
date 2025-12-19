"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Users, Newspaper, LogOut, MessageCircle } from "lucide-react"

import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import EventsManager from "../_components/events-manager"
import TeamManager from "../_components/team-manager"
import CalendarManager from "../_components/calendar-manager"
import CommunityManager from "../_components/community-manager"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("events")

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
            <p className="text-sm text-white/60">Diretório Acadêmico IFBA</p>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors"
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-4 bg-white/5 border border-white/10 p-1">
            <TabsTrigger
              value="events"
              className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 text-white/60"
            >
              <Newspaper className="mr-2" size={18} />
              Eventos
            </TabsTrigger>
            <TabsTrigger
              value="team"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-white/60"
            >
              <Users className="mr-2" size={18} />
              Time
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-white/60"
            >
              <MessageCircle className="mr-2" size={18} />
              Comunidade
            </TabsTrigger>
            <TabsTrigger
              value="calendar"
              className="data-[state=active]:bg-orange-500/20 data-[state=active]:text-orange-400 text-white/60"
            >
              <Calendar className="mr-2" size={18} />
              Calendário
            </TabsTrigger>
          </TabsList>

          <div className="mt-8">
            <TabsContent value="events" className="m-0">
              <EventsManager />
            </TabsContent>

            <TabsContent value="team" className="m-0">
              <TeamManager />
            </TabsContent>

            <TabsContent value="community" className="m-0">
              <CommunityManager />
            </TabsContent>

            <TabsContent value="calendar" className="m-0">
              <CalendarManager />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
