"use client"

import { useState } from "react"
import {
  Calendar,
  Users,
  Newspaper,
  LogOut,
  MessageCircle,
  LayoutDashboard,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  HelpCircle,
  FileCode,
  GraduationCap,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import EventsManager from "../_components/events-manager"
import TeamManager from "../_components/team-manager"
import CalendarManager from "../_components/calendar-manager"
import CommunityManager from "../_components/community-manager"
import FaqManager from "../_components/faq-manager"
import PageManager from "../_components/page-manager"
import CourseManager from "../_components/course-manager"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  {
    id: "events",
    label: "Eventos",
    icon: Newspaper,
    color: "text-purple-400",
    activeBg: "bg-purple-500/10 border-purple-500/30",
    dot: "bg-purple-400",
  },
  {
    id: "team",
    label: "Time",
    icon: Users,
    color: "text-blue-400",
    activeBg: "bg-blue-500/10 border-blue-500/30",
    dot: "bg-blue-400",
  },
  {
    id: "community",
    label: "Comunidade",
    icon: MessageCircle,
    color: "text-green-400",
    activeBg: "bg-green-500/10 border-green-500/30",
    dot: "bg-green-400",
  },
  {
    id: "calendar",
    label: "Calendário",
    icon: Calendar,
    color: "text-orange-400",
    activeBg: "bg-orange-500/10 border-orange-500/30",
    dot: "bg-orange-400",
  },
  {
    id: "faq",
    label: "FAQ",
    icon: HelpCircle,
    color: "text-amber-400",
    activeBg: "bg-amber-500/10 border-amber-500/30",
    dot: "bg-amber-400",
  },
  {
    id: "pages",
    label: "Páginas",
    icon: FileCode,
    color: "text-cyan-400",
    activeBg: "bg-cyan-500/10 border-cyan-500/30",
    dot: "bg-cyan-400",
  },
  {
    id: "courses",
    label: "Cursos",
    icon: GraduationCap,
    color: "text-rose-400",
    activeBg: "bg-rose-500/10 border-rose-500/30",
    dot: "bg-rose-400",
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("events")
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/sign-in")
  }

  const activeItem = NAV_ITEMS.find((n) => n.id === activeTab) ?? NAV_ITEMS[0]

  return (
    <div className="flex min-h-screen bg-[#030303] text-white">
      {/* ── SIDEBAR OVERLAY (mobile) ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-dvh w-72 flex-col border-r border-white/[0.07] bg-[#080808]/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="relative overflow-hidden border-b border-white/[0.07] px-5 py-5">
          <div className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_0_24px_rgba(168,85,247,0.12)]">
                <LayoutDashboard size={18} className="text-white/80" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.35em] text-white">Admin</p>
                <p className="mt-1 text-[11px] text-white/35">IFBA Irecê • Painel interno</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/5 hover:text-white lg:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-4 rounded-2xl border border-purple-500/15 bg-gradient-to-br from-purple-500/10 via-white/[0.03] to-transparent p-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-purple-500/15 p-2 text-purple-300">
                <Sparkles size={15} />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white/90">Gestão centralizada</p>
                <p className="text-xs leading-relaxed text-white/45">
                  Controle eventos, equipe, comunidade e calendário em um único fluxo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="flex flex-1 flex-col overflow-hidden px-3 py-4">
          <nav className="space-y-1 overflow-y-auto pr-1">
            <p className="mb-3 px-2 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
              Gerenciar
            </p>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-sm font-medium transition-all duration-200",
                    isActive
                      ? cn("border shadow-[0_0_30px_rgba(168,85,247,0.08)]", item.activeBg, item.color)
                      : "border-transparent text-white/50 hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-white/85"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl border transition-colors",
                      isActive
                        ? "border-current/20 bg-white/5"
                        : "border-white/5 bg-white/[0.03] text-white/35 group-hover:text-white/65"
                    )}
                  >
                    <Icon size={16} className={isActive ? item.color : "text-inherit"} />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col items-start">
                    <span className="truncate">{item.label}</span>
                    <span className="text-[11px] text-white/25">
                      {isActive ? "Área em foco" : "Abrir seção"}
                    </span>
                  </div>

                  <div className="ml-auto flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", item.dot, isActive ? "opacity-100" : "opacity-35")} />
                    {isActive && <ChevronRight size={14} className="opacity-60" />}
                  </div>
                </button>
              )
            })}
          </nav>

          <div className="mt-auto pt-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-emerald-500/10 p-2 text-emerald-400">
                  <ShieldCheck size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white/85">Sessão protegida</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/40">
                    Você está gerenciando a área administrativa com acesso autenticado.
                  </p>
                </div>
              </div>

              <div className="mt-4 border-t border-white/[0.06] pt-3">
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl border border-red-500/10 bg-red-500/[0.03] px-3 py-3 text-sm font-medium text-white/55 transition hover:border-red-500/25 hover:bg-red-500/10 hover:text-red-300"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                    <LogOut size={16} />
                  </span>
                  <span className="flex-1 text-left">Sair da conta</span>
                  <ChevronRight size={14} className="opacity-40" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN AREA ── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-white/[0.07] bg-[#030303]/80 px-5 backdrop-blur-md">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-white/50 hover:text-white lg:hidden"
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-white/30">Dashboard</span>
            <ChevronRight size={14} className="text-white/20" />
            <span className={cn("font-semibold", activeItem.color)}>
              {activeItem.label}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <span className={cn("h-2 w-2 rounded-full", activeItem.dot)} />
            <span className="hidden text-xs font-medium text-white/40 sm:block">
              {activeItem.label} ativo
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-7">
          {activeTab === "events" && <EventsManager />}
          {activeTab === "team" && <TeamManager />}
          {activeTab === "community" && <CommunityManager />}
          {activeTab === "calendar" && <CalendarManager />}
          {activeTab === "faq" && <FaqManager />}
          {activeTab === "pages" && <PageManager />}
          {activeTab === "courses" && <CourseManager />}
        </main>
      </div>
    </div>
  )
}
