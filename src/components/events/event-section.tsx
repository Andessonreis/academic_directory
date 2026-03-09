"use client"

import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import {
  Calendar, MapPin, ArrowRight, Clock, AlertCircle,
  Loader2, X, Info, ExternalLink, Mail, Search, CheckCircle,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventItem } from "@/types/event"
import { getEvents } from "@/services/event-service"

/* ─── Color helpers ─── */
const COLOR_MAP = {
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", gradient: "from-purple-600 to-indigo-600", dot: "bg-purple-400" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", gradient: "from-pink-600 to-rose-600", dot: "bg-pink-400" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", gradient: "from-blue-600 to-cyan-600", dot: "bg-blue-400" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", gradient: "from-emerald-600 to-green-600", dot: "bg-emerald-400" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", gradient: "from-orange-600 to-amber-600", dot: "bg-orange-400" },
} as const

type CategoryOption = { id: string; label: string }

const normalizeCategory = (category?: string) =>
  category?.trim()?.length ? category.trim() : "Outros"

function getColors(color?: string) {
  if (!color) return COLOR_MAP.purple
  const key = color.toLowerCase() as keyof typeof COLOR_MAP
  return COLOR_MAP[key] || COLOR_MAP.purple
}

const BATCH_SIZE = 15

/* ─── Date grouping helpers ─── */
function getDateGroup(dateStr: string | undefined): string {
  if (!dateStr) return "Sem data"
  const d = new Date(dateStr + "T12:00:00")
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diff = Math.floor((d.getTime() - now.getTime()) / 86400000)
  if (diff < 0) return "Passados"
  if (diff === 0) return "Hoje"
  if (diff <= 7) return "Esta Semana"
  if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) return "Este Mês"
  const monthName = d.toLocaleString("pt-BR", { month: "long" })
  return `${monthName.charAt(0).toUpperCase()}${monthName.slice(1)} ${d.getFullYear()}`
}

function formatShortDate(dateStr: string | undefined): string {
  if (!dateStr) return ""
  const d = new Date(dateStr + "T12:00:00")
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "")
}

function formatShortTime(timeStr: string | undefined): string {
  if (!timeStr) return ""
  return timeStr.split(":").slice(0, 2).join("h")
}

/* ─── Mobile compact row ─── */
function EventRow({ event, onSelect }: { event: EventItem; onSelect: (e: EventItem) => void }) {
  const colors = getColors(event.categoryColor)
  return (
    <button
      onClick={() => onSelect(event)}
      className="group flex w-full items-center gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] p-2.5 text-left transition hover:bg-white/[0.05] active:scale-[0.99]"
    >
      {/* Thumbnail */}
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        {event.image_url ? (
          <img src={event.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br opacity-40", colors.gradient)}>
            <Calendar size={18} className="text-white/30" />
          </div>
        )}
        <span className={cn("absolute bottom-0.5 left-0.5 h-2 w-2 rounded-full", colors.dot)} />
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="truncate text-sm font-semibold text-white/90 group-hover:text-white">{event.title}</h4>
        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-white/40">
          <span>{formatShortDate(event.event_date)}</span>
          {event.event_time && (
            <>
              <span className="text-white/15">·</span>
              <span>{formatShortTime(event.event_time)}</span>
            </>
          )}
          {event.location && (
            <>
              <span className="text-white/15">·</span>
              <span className="truncate">{event.location}</span>
            </>
          )}
        </div>
        {(event.tags ?? []).length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {event.tags!.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[8px] px-1 py-0.5 rounded-full bg-white/[0.04] text-white/30">{tag}</span>
            ))}
          </div>
        )}
      </div>

      {/* Arrow */}
      <ChevronRight size={14} className="shrink-0 text-white/15 group-hover:text-white/40 transition" />
    </button>
  )
}

/* ─── Desktop card (kept for sm+) ─── */
function EventCard({ event, onSelect }: { event: EventItem; onSelect: (e: EventItem) => void }) {
  const colors = getColors(event.categoryColor)
  const categoryLabel = normalizeCategory(event.category)

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group h-full cursor-pointer"
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes do evento ${event.title}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(event) }
      }}
    >
      <Card className="flex h-full flex-col overflow-hidden border-white/5 bg-[#0F0F0F] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          {event.image_url ? (
            <>
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
              <img src={event.image_url} alt={event.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
            </>
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br opacity-20", colors.gradient)}>
              <Calendar size={48} className="text-white/20" />
            </div>
          )}
          <span className={cn(
            "absolute top-3 left-3 z-20 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md",
            colors.bg, colors.text, colors.border,
          )}>
            {categoryLabel}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 text-base font-semibold leading-tight text-white group-hover:text-purple-200 line-clamp-2">
            {event.title}
          </h3>
          <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-white/50">
            <span className="flex items-center gap-1"><Calendar size={11} /> {formatShortDate(event.event_date)}</span>
            {event.event_time && (
              <>
                <span className="text-white/20">·</span>
                <span className="flex items-center gap-1"><Clock size={11} /> {formatShortTime(event.event_time)}</span>
              </>
            )}
          </div>
          {event.location && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-white/40">
              <MapPin size={11} />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          {(event.tags ?? []).length > 0 && (
            <div className="mb-3 flex flex-wrap gap-1">
              {event.tags!.map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/35 border border-white/[0.06]">{tag}</span>
              ))}
            </div>
          )}
          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-3">
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/35 group-hover:text-white/70 transition">
              {event.hasCustomPage ? "Ver página" : "Saiba mais"}
            </span>
            <div className="rounded-full bg-white/10 p-1.5 text-white transition-all group-hover:bg-white group-hover:text-black">
              <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </Card>
    </motion.article>
  )
}

/* ─── Event Modal (simple events — body scroll locked) ─── */
function EventModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const colors = getColors(event.categoryColor)
  const [showRegForm, setShowRegForm] = useState(false)
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [emailError, setEmailError] = useState("")
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  const validateEmail = (email: string) => {
    if (!email.trim()) { setEmailError(""); return false }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
    if (!re.test(email)) { setEmailError("Email inválido. Ex: nome@email.com"); return false }
    setEmailError("")
    return true
  }

  // Lock body scroll
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  const handleRegister = async () => {
    if (!regName.trim() || !regEmail.trim()) return
    if (!validateEmail(regEmail)) return
    setRegSubmitting(true)
    try {
      const { supabase } = await import("@/lib/supabase/client")
      await supabase.from("event_registrations").insert({
        event_id: event.id,
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
      })
      setRegSuccess(true)
    } catch {
      alert("Erro ao registrar. Tente novamente.")
    } finally {
      setRegSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overscroll-none"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2 text-white/50 hover:text-white transition"
        >
          <X size={16} />
        </button>

        {/* Image */}
        {event.image_url ? (
          <div className="relative w-full aspect-[16/9] shrink-0 overflow-hidden rounded-t-2xl">
            <img src={event.image_url} alt={event.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent" />
          </div>
        ) : (
          <div className={cn("w-full h-24 shrink-0 bg-gradient-to-br opacity-30 rounded-t-2xl", colors.gradient)} />
        )}

        <div className="overflow-hidden p-5">
          {event.category && (
            <span className={cn("inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2", colors.bg, colors.text, colors.border)}>
              {event.category}
            </span>
          )}
          {(event.tags ?? []).length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {event.tags!.map((tag) => (
                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/40 border border-white/[0.08]">{tag}</span>
              ))}
            </div>
          )}

          <h2 className="text-lg font-bold text-white mb-1">{event.title}</h2>
          {event.description && (
            <p className="text-sm text-white/45 mb-3">{event.description}</p>
          )}

          {/* Info box */}
          <div className="rounded-lg border border-white/[0.07] bg-white/[0.03] p-3 space-y-2 mb-3">
            {event.event_date && (
              <div className="flex items-center gap-2.5 text-white/60 text-xs">
                <Calendar className="text-purple-400 shrink-0" size={13} />
                <span>{formatShortDate(event.event_date)}</span>
              </div>
            )}
            {event.event_time && (
              <div className="flex items-center gap-2.5 text-white/60 text-xs">
                <Clock className="text-pink-400 shrink-0" size={13} />
                <span>{event.event_time}</span>
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2.5 text-white/60 text-xs">
                <MapPin className="text-blue-400 shrink-0" size={13} />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {/* Long description */}
          {event.longDescription && event.longDescription !== event.description && (
            <div className="mb-3">
              <h3 className="flex items-center gap-1.5 text-white font-semibold mb-1 text-xs">
                <Info size={12} className="text-white/30" /> Sobre o evento
              </h3>
              <div className="max-h-28 overflow-y-auto pr-1 sm:max-h-36 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.25)_transparent] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/25">
                <p className="text-white/40 text-xs leading-relaxed whitespace-pre-line">
                  {event.longDescription}
                </p>
              </div>
            </div>
          )}

          {/* Registration: external */}
          {event.registration_type === "external" && event.registration_url && (
            <a
              href={event.registration_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-500"
            >
              <ExternalLink size={14} /> Inscrever-se ↗
            </a>
          )}

          {/* Registration: internal — inline form */}
          {event.registration_type === "internal" && !regSuccess && !showRegForm && (
            <button
              onClick={() => setShowRegForm(true)}
              className="flex items-center justify-center gap-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500"
            >
              <Mail size={14} /> Registrar Participação
            </button>
          )}

          <AnimatePresence>
            {event.registration_type === "internal" && showRegForm && !regSuccess && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-3 space-y-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <input
                    type="text"
                    placeholder="Nome completo"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none focus:border-emerald-500/40"
                  />
                  <div>
                    <input
                      type="email"
                      placeholder="Seu email (ex: nome@email.com)"
                      value={regEmail}
                      onChange={(e) => { setRegEmail(e.target.value); if (emailError) validateEmail(e.target.value) }}
                      onBlur={() => regEmail && validateEmail(regEmail)}
                      className={cn(
                        "w-full rounded-md border bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/25 outline-none",
                        emailError ? "border-red-500/50 focus:border-red-500/70" : "border-white/10 focus:border-emerald-500/40"
                      )}
                    />
                    {emailError && <p className="mt-1 text-[10px] text-red-400">{emailError}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowRegForm(false)}
                      className="flex-1 rounded-md border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:bg-white/5"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleRegister}
                      disabled={regSubmitting || !regName.trim() || !regEmail.trim() || !!emailError || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(regEmail)}
                      className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-40"
                    >
                      {regSubmitting ? "Enviando..." : "Confirmar"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {event.registration_type === "internal" && regSuccess && (
            <div className="mt-3 flex flex-col items-center rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
              <CheckCircle size={24} className="text-emerald-400 mb-2" />
              <p className="text-sm font-semibold text-white">Inscrito!</p>
              <p className="text-[11px] text-white/40">Você receberá um email de confirmação.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Events Section ─── */
interface EventsSectionProps {
  /** When set, limits display and hides search/filters (homepage mode) */
  maxItems?: number
}

export default function EventsSection({ maxItems }: EventsSectionProps = {}) {
  const isHomepage = typeof maxItems === "number"
  const router = useRouter()
  const [events, setEvents] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("all")
  const [search, setSearch] = useState("")
  const [modalEvent, setModalEvent] = useState<EventItem | null>(null)
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch((err) => console.error("Erro ao carregar eventos:", err))
      .finally(() => setIsLoading(false))
  }, [])

  /* Infinite scroll observer */
  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisibleCount((c) => c + BATCH_SIZE) },
      { rootMargin: "200px" },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const unique = new Set<string>()
    for (const e of events) unique.add(normalizeCategory(e.category))
    return [{ id: "all", label: "Todos" }, ...Array.from(unique).map((l) => ({ id: l, label: l }))]
  }, [events])

  useEffect(() => {
    if (activeCategory !== "all" && !events.some((e) => normalizeCategory(e.category) === activeCategory))
      setActiveCategory("all")
  }, [events, activeCategory])

  /* Filter + search */
  const filtered = useMemo(() => {
    let list = events
    if (activeCategory !== "all") list = list.filter((e) => normalizeCategory(e.category) === activeCategory)
    const q = search.trim().toLowerCase()
    if (q) list = list.filter((e) => e.title.toLowerCase().includes(q) || (e.description ?? "").toLowerCase().includes(q))
    return list
  }, [events, activeCategory, search])

  /* Date-grouped (for mobile) */
  const grouped = useMemo(() => {
    const map = new Map<string, EventItem[]>()
    for (const e of filtered) {
      const key = getDateGroup(e.event_date)
      const arr = map.get(key)
      if (arr) arr.push(e)
      else map.set(key, [e])
    }
    return Array.from(map.entries())
  }, [filtered])

  const visible = filtered.slice(0, isHomepage ? maxItems : visibleCount)
  const hasMore = isHomepage ? false : visibleCount < filtered.length

  const handleSelect = useCallback((event: EventItem) => {
    if (event.hasCustomPage) router.push(`/evento/${event.id}`)
    else setModalEvent(event)
  }, [router])

  /* Reset visible count on filter change */
  useEffect(() => { setVisibleCount(BATCH_SIZE) }, [activeCategory, search])

  if (isLoading) {
    return (
      <section className="flex min-h-[400px] items-center justify-center bg-[#050505] py-24">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </section>
    )
  }

  return (
    <section id="eventos" className="relative overflow-hidden bg-[#050505] py-12 sm:py-16 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505]" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-6 sm:mb-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-purple-300/60 mb-1">Vida Estudantil</p>
          <h2 className="text-xl font-bold text-white sm:text-3xl lg:text-5xl">
            Eventos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">D.A.</span>
          </h2>
        </div>

        {/* Sticky search + filters — hidden in homepage mode */}
        {!isHomepage && (
          <div className="sticky top-0 z-20 -mx-4 bg-[#050505]/95 backdrop-blur-md px-4 pb-3 pt-2 sm:-mx-6 sm:px-6 border-b border-white/[0.04]">
            {/* Search */}
            <div className="relative mb-2.5">
              <Search size={13} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar evento…"
                className="w-full rounded-lg border border-white/[0.07] bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white placeholder:text-white/25 outline-none focus:border-purple-500/30 transition"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60"
                >
                  <X size={12} />
                </button>
              )}
            </div>

            {/* Category tabs */}
            {events.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" role="tablist">
                {categoryOptions.map((opt) => (
                  <button
                    key={opt.id}
                    role="tab"
                    aria-selected={activeCategory === opt.id}
                    onClick={() => setActiveCategory(opt.id)}
                    className={cn(
                      "shrink-0 rounded-full border px-3 py-1 text-[11px] font-medium transition-all",
                      activeCategory === opt.id
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white/70",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Count */}
        {!isLoading && !isHomepage && (
          <p className="mt-3 mb-4 text-[11px] text-white/20 tabular-nums">
            {filtered.length} evento{filtered.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* ─── MOBILE: Compact list grouped by date ─── */}
        <div className="sm:hidden space-y-4">
          {grouped.length > 0 ? (
            (() => {
              let count = 0
              const limit = isHomepage ? maxItems! : visibleCount
              return grouped.map(([label, items]) => {
                const remaining = limit - count
                if (remaining <= 0) return null
                const slice = items.slice(0, remaining)
                count += slice.length
                return (
                  <div key={label}>
                    <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">{label}</p>
                    <div className="space-y-1.5">
                      {slice.map((e) => (
                        <EventRow key={e.id} event={e} onSelect={handleSelect} />
                      ))}
                    </div>
                  </div>
                )
              })
            })()
          ) : (
            <div className="py-16 text-center">
              <AlertCircle className="mx-auto mb-3 text-white/15" size={32} />
              <p className="text-sm text-white/40">Nenhum evento encontrado</p>
            </div>
          )}
        </div>

        {/* ─── DESKTOP: Card grid ─── */}
        <div className="hidden sm:grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {visible.length > 0 ? (
            visible.map((event) => (
              <EventCard key={event.id} event={event} onSelect={handleSelect} />
            ))
          ) : (
            <Card className="col-span-full border-white/10 bg-white/5 p-8 text-center text-white/70">
              <AlertCircle className="mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-white">Nada por aqui ainda</h3>
              <p className="mt-1 text-sm">Tente outra categoria ou busque por nome.</p>
            </Card>
          )}
        </div>

        {/* "Ver todos" button — homepage mode */}
        {isHomepage && filtered.length > maxItems! && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => router.push("/eventos")}
              className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-6 py-2.5 text-sm font-medium text-white/70 transition hover:border-purple-500/30 hover:bg-purple-500/5 hover:text-white"
            >
              Ver todos os eventos
              <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </button>
          </div>
        )}

        {/* Infinite-scroll sentinel */}
        {hasMore && <div ref={sentinelRef} className="h-1" />}
        {hasMore && (
          <div className="mt-6 flex justify-center">
            <Loader2 className="animate-spin text-purple-500/50" size={20} />
          </div>
        )}
      </div>

      {/* Simple event modal */}
      <AnimatePresence>
        {modalEvent && <EventModal event={modalEvent} onClose={() => setModalEvent(null)} />}
      </AnimatePresence>
    </section>
  )
}
