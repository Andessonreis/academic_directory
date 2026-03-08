"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, ChevronDown, ChevronRight, Search, X, Sunrise } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCalendarCourses, getCalendarEvents, getSemesterConfig } from "@/services/calendar-service"
import type { CalendarCourse, CalendarEvent as DBCalendarEvent } from "@/types/event"

/* ─── Internal event shape used for rendering ─── */
interface CalendarEvent {
  id: number | string
  title: string
  date: string            // YYYY-MM-DD
  endDate?: string        // YYYY-MM-DD
  weekday: string
  type: "deadline" | "holiday" | "event" | "academic" | string
  description: string
  time?: string
  location?: string
  tags?: string[]
  isDayOff?: boolean
  isSchoolDay?: boolean
  rawDate: Date
}

interface MonthGroup {
  key: string          // "Mar", "Abr" etc
  monthIndex: number   // 0-11
  label: string        // "Março"
  year: number
  events: CalendarEvent[]
  isCurrent: boolean   // is this the current month?
}

const TYPE_CFG = {
  //deadline: { dot: "bg-amber-400", text: "text-amber-400", label: "Prazo" },
  holiday: { dot: "bg-red-400", text: "text-red-400", label: "Feriado" },
  event: { dot: "bg-emerald-400", text: "text-emerald-400", label: "Evento" },
  academic: { dot: "bg-blue-400", text: "text-blue-400", label: "Acadêmico" },
} as const

const FULL_MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
]
const SHORT_KEYS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

/* ─── Helpers ─── */
function isWeekend(d: Date) { const day = d.getDay(); return day === 0 || day === 6 }
function addDays(d: Date, n: number) { const r = new Date(d); r.setDate(r.getDate() + n); return r }
function sameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate() }
function formatWeekday(d: Date) { const w = d.toLocaleDateString("pt-BR", { weekday: "long" }); return w.charAt(0).toUpperCase() + w.slice(1) }

/* ─── Sub-components ─── */

function EventRow({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false)
  const cfg = TYPE_CFG[event.type as keyof typeof TYPE_CFG] ?? TYPE_CFG.event
  const dayNum = String(event.rawDate.getDate()).padStart(2, "0")
  const endStr = event.endDate
    ? ` → ${new Date(event.endDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}`
    : ""

  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-center gap-3 rounded-md px-2 py-2.5 transition hover:bg-white/[0.03]">
          <span className="w-6 shrink-0 text-center text-xs font-mono text-white/30 tabular-nums">{dayNum}</span>
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} />
          <span className="flex-1 min-w-0 truncate text-sm text-white/75">{event.title}</span>
          {endStr && <span className="hidden sm:block text-[10px] text-white/20">{endStr}</span>}
          {(event.tags || []).slice(0, 2).map((t) => (
            <span key={t} className="hidden md:inline text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/25">{t}</span>
          ))}
          <span className={cn("hidden sm:block shrink-0 text-[10px] font-semibold w-16 text-right", cfg.text)}>{cfg.label}</span>
          <span className="hidden md:block shrink-0 w-20 text-right text-[11px] text-white/20">{event.weekday}</span>
          <ChevronRight size={12} className={cn("shrink-0 text-white/15 transition-transform duration-150", open && "rotate-90 text-white/40")} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="d" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.15 }} className="overflow-hidden">
            <div className="pb-3 pl-11 pr-2">
              <p className="text-xs leading-relaxed text-white/40">
                {event.description}
                {event.time && <span className="text-white/25"> · {event.time}</span>}
                {event.location && <span className="text-white/25"> · {event.location}</span>}
              </p>
              {(event.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {event.tags!.map((tag) => (
                    <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/30">{tag}</span>
                  ))}
                </div>
              )}
              {event.isDayOff && <span className="inline-block mt-1 text-[10px] text-red-400/60">Dia não letivo</span>}
              {event.isSchoolDay && <span className="inline-block mt-1 text-[10px] text-emerald-400/60">Dia letivo</span>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Academic day row ─── */
function AcademicDayRow({ event }: { event: CalendarEvent }) {
  const dateStr = event.rawDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  const isLetivo = !event.isDayOff
  return (
    <div className="flex items-center gap-3 rounded-md px-2 py-2 transition hover:bg-white/[0.03]">
      <span className="w-12 shrink-0 text-center text-[11px] font-mono text-white/30 tabular-nums">{dateStr}</span>
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isLetivo ? "bg-emerald-400" : "bg-red-400")} />
      <span className={cn(
        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
        isLetivo ? "bg-emerald-500/10 text-emerald-400/70" : "bg-red-500/10 text-red-400/70"
      )}>
        {isLetivo ? "Letivo" : "Não letivo"}
      </span>
      <span className="flex-1 min-w-0 truncate text-xs text-white/40">
        {event.title === "Dia letivo" ? "" : event.title}
      </span>
      <span className="hidden sm:block shrink-0 text-[11px] text-white/20">{event.weekday}</span>
    </div>
  )
}

/* ─── Generate academic days for a semester ─── */
function generateAcademicDays(
  config: { start: string; end: string },
  allEvents: CalendarEvent[]
): CalendarEvent[] {
  const holidayDates = new Map<string, string>()
  const overrides = new Map<string, CalendarEvent>()
  for (const ev of allEvents) {
    if (ev.type === "holiday") holidayDates.set(ev.date, ev.title)
    if (ev.type === "academic") overrides.set(ev.date, ev)
  }

  const start = new Date(config.start + "T12:00:00")
  const end = new Date(config.end + "T12:00:00")
  const days: CalendarEvent[] = []
  let cur = new Date(start)

  while (cur <= end) {
    const yr = cur.getFullYear()
    const mo = String(cur.getMonth() + 1).padStart(2, "0")
    const da = String(cur.getDate()).padStart(2, "0")
    const dateStr = `${yr}-${mo}-${da}`
    const dow = cur.getDay()
    const isWknd = dow === 0 || dow === 6
    const holidayName = holidayDates.get(dateStr)
    const override = overrides.get(dateStr)
    const wkday = formatWeekday(cur)
    const snapshot = new Date(cur)
    const next = addDays(cur, 1)

    if (override) {
      const isOff = override.isDayOff ?? false
      days.push({
        id: `ovr-${dateStr}`,
        title: override.title || (isOff ? "Dia não letivo" : "Dia letivo"),
        date: dateStr,
        weekday: wkday,
        type: "academic",
        description: isOff ? "Dia não letivo (editado)" : "Dia letivo (editado)",
        isDayOff: isOff,
        isSchoolDay: !isOff,
        rawDate: snapshot,
      })
    } else if (isWknd) {
      // skip weekends without override
    } else if (holidayName) {
      days.push({
        id: `acad-${dateStr}`,
        title: holidayName,
        date: dateStr,
        weekday: wkday,
        type: "academic",
        description: "Feriado — Dia não letivo",
        isDayOff: true,
        isSchoolDay: false,
        rawDate: snapshot,
      })
    } else {
      days.push({
        id: `acad-${dateStr}`,
        title: "Dia letivo",
        date: dateStr,
        weekday: wkday,
        type: "academic",
        description: wkday,
        isDayOff: false,
        isSchoolDay: true,
        rawDate: snapshot,
      })
    }

    cur = next
  }

  return days
}

function MonthAccordion({ group, defaultOpen, groupRef, isAcademic }: {
  group: MonthGroup
  defaultOpen: boolean
  groupRef?: (el: HTMLDivElement | null) => void
  isAcademic?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div ref={groupRef} data-month={group.key}>
      <button onClick={() => setOpen(!open)} className={cn(
        "flex w-full items-center gap-3 py-2.5 text-left rounded-lg px-1 -mx-1 transition",
        group.isCurrent && "ring-1 ring-emerald-500/25 bg-emerald-500/[0.03]"
      )}>
        <span className={cn("w-8 shrink-0 text-xs font-black uppercase tracking-[0.2em]", group.isCurrent ? "text-emerald-400/70" : "text-white/40")}>{group.key}</span>
        <div className="h-px flex-1 bg-white/[0.06]" />
        {group.isCurrent && <span className="text-[9px] font-semibold text-emerald-500/50 uppercase tracking-wider">Atual</span>}
        <span className="shrink-0 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/25 tabular-nums">{group.events.length}</span>
        <ChevronDown size={13} className={cn("shrink-0 text-white/20 transition-transform duration-200", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="r" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className={cn("mb-3 ml-3 border-l pl-3", group.isCurrent ? "border-emerald-500/20" : "border-white/[0.06]")}>
              {group.events.map((evt) => isAcademic ? <AcademicDayRow key={evt.id} event={evt} /> : <EventRow key={evt.id} event={evt} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ═══════════════════════════════════════
   Main Section
   ═══════════════════════════════════════ */

export default function CalendarSection() {
  const [filter, setFilter] = useState<"all" | "deadline" | "holiday" | "event" | "academic">("all")
  const [search, setSearch] = useState("")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CalendarCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [activeMonth, setActiveMonth] = useState<string>("")
  const [semesterConfig, setSemesterConfig] = useState<{ start: string; end: string } | null>(null)
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const now = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  }, [])
  const currentMonthKey = SHORT_KEYS[now.getMonth()]
  const currentYear = now.getFullYear()

  /* ── Fetch events: DB + BrasilAPI ── */
  useEffect(() => {
    async function load() {
      try {
        const [dbEvents, holidaysResp, semConfig] = await Promise.all([
          getCalendarEvents(),
          fetch(`https://brasilapi.com.br/api/feriados/v1/${currentYear}`).then(r => r.json()).catch(() => []),
          getSemesterConfig(),
        ])

        // Convert DB events
        const mapped: CalendarEvent[] = dbEvents.map((ev) => {
          const d = new Date(ev.date + "T12:00:00")
          return {
            id: ev.id,
            title: ev.title,
            date: ev.date,
            endDate: ev.endDate,
            weekday: ev.weekday || formatWeekday(d),
            type: ev.type,
            description: ev.description || "",
            time: ev.time,
            location: ev.location,
            tags: ev.tags,
            isDayOff: ev.isDayOff,
            isSchoolDay: ev.isSchoolDay,
            rawDate: d,
          }
        })

        // Convert BrasilAPI holidays — skip duplicates
        const dbTitlesLower = new Set(mapped.map(e => e.title.toLowerCase()))
        const holidays: CalendarEvent[] = (Array.isArray(holidaysResp) ? holidaysResp : [])
          .filter((h: any) => !dbTitlesLower.has(h.name?.toLowerCase()))
          .map((h: any, i: number) => {
            const d = new Date(h.date + "T12:00:00")
            return {
              id: `hol-${i}`,
              title: h.name,
              date: h.date,
              weekday: formatWeekday(d),
              type: "holiday" as const,
              description: "Feriado Nacional. Não haverá funcionamento do campus.",
              isDayOff: true,
              rawDate: d,
            }
          })

        const all = [...mapped, ...holidays].sort((a, b) => a.rawDate.getTime() - b.rawDate.getTime())
        setEvents(all)
        if (semConfig?.date && semConfig?.endDate) {
          setSemesterConfig({ start: semConfig.date, end: semConfig.endDate })
        }
      } catch (err) {
        console.error("Erro ao carregar calendário:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [currentYear])

  /* ── Load download courses ── */
  useEffect(() => {
    async function loadCourses() {
      const list = await getCalendarCourses()
      setCourses(list)
      if (list.length) {
        const def = list.find((c) => c.isDefault)
        setSelectedCourseId((def ?? list[0]).id)
      }
    }
    loadCourses()
  }, [])

  /* ── Academic days (auto-generated from semester config) ── */
  const academicDays = useMemo(
    () => (semesterConfig ? generateAcademicDays(semesterConfig, events) : []),
    [semesterConfig, events]
  )

  /* ── Filter & search ── */
  const filtered = useMemo(() => {
    let result: CalendarEvent[]
    if (filter === "academic") {
      result = academicDays
    } else {
      result = events.filter((e) =>
        filter === "all" ? e.type !== "academic" && e.type !== "semester" : e.type === filter
      )
    }
    const q = search.trim().toLowerCase()
    if (q) result = result.filter(e => e.title.toLowerCase().includes(q) || (e.description || "").toLowerCase().includes(q))
    return result
  }, [events, filter, search, academicDays])

  /* ── Group by month, starting from CURRENT month ── */
  const groups: MonthGroup[] = useMemo(() => {
    const result: MonthGroup[] = []
    const seen: Record<string, number> = {}

    // Filter events from current month onward
    const startOfMonth = new Date(currentYear, now.getMonth(), 1)
    const relevant = filtered.filter(e => e.rawDate >= startOfMonth)

    for (const evt of relevant) {
      const m = evt.rawDate.getMonth()
      const yr = evt.rawDate.getFullYear()
      const compositeKey = `${m}-${yr}`
      if (seen[compositeKey] === undefined) {
        seen[compositeKey] = result.length
        result.push({
          key: SHORT_KEYS[m],
          monthIndex: m,
          label: FULL_MONTHS[m],
          year: yr,
          events: [],
          isCurrent: m === now.getMonth() && yr === currentYear,
        })
      }
      result[seen[compositeKey]].events.push(evt)
    }

    // Make sure current month always exists (even if no events yet)
    const curKey = `${now.getMonth()}-${currentYear}`
    if (seen[curKey] === undefined) {
      result.unshift({
        key: currentMonthKey,
        monthIndex: now.getMonth(),
        label: FULL_MONTHS[now.getMonth()],
        year: currentYear,
        events: [],
        isCurrent: true,
      })
    }

    return result
  }, [filtered, currentYear, now, currentMonthKey])

  /* ── Next business day ── */
  const nextBusinessDay = useMemo(() => {
    let d = addDays(now, 1)
    while (isWeekend(d)) d = addDays(d, 1)
    return d
  }, [now])

  const nextDayEvents = useMemo(() => events.filter(e => sameDay(e.rawDate, nextBusinessDay)), [events, nextBusinessDay])

  /* ── Counts ── */
  const counts = useMemo(() => ({
    all: events.filter(e => e.type !== "academic" && e.type !== "semester").length,
    deadline: events.filter(e => e.type === "deadline").length,
    event: events.filter(e => e.type === "event").length,
    holiday: events.filter(e => e.type === "holiday").length,
    academic: academicDays.length,
  }), [events, academicDays])

  /* ── Utils ── */
  const firstVisibleMonth = groups.length > 0 ? groups[0].key : currentMonthKey
  const scrollToMonth = useCallback((key: string) => {
    groupRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" })
    setActiveMonth(key)
  }, [])

  useEffect(() => {
    if (groups.length > 0) setActiveMonth(groups.find(g => g.isCurrent)?.key ?? groups[0].key)
  }, [groups])

  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const generalPdf = courses.find(c => c.isDefault) ?? courses[0]
  const handleDownload = (course?: CalendarCourse) => {
    const t = course ?? selectedCourse
    if (!t?.pdfUrl) return alert("Nenhum PDF configurado.")
    window.open(t.pdfUrl, "_blank")
  }

  return (
    <section id="calendario" className="relative overflow-hidden bg-[#050505] py-16 sm:py-20 lg:py-24">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-emerald-900/8 via-transparent to-transparent opacity-50" />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10 text-center sm:mb-14">
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/50">
            Agenda Campus
          </motion.p>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 }} className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl">
            Calendário{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Institucional</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:text-base">
            Consulte prazos, feriados e eventos institucionais do IFBA Irecê.
          </motion.p>
          {!loading && (
            <p className="mt-2 text-xs text-white/20 tabular-nums">{filtered.length} eventos listados</p>
          )}
        </div>

        {/* Download strip */}
        {courses.length > 0 && (
          <div className="mb-6 flex flex-col gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3 sm:flex-row sm:items-center sm:gap-3">
            <div className="relative flex-1">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/[0.08] bg-transparent px-3 py-2 pr-8 text-xs text-white/50 outline-none transition hover:border-white/20"
              >
                <option value="" disabled className="bg-[#111]">Selecione o curso…</option>
                {courses.map((c) => (<option key={c.id} value={c.id} className="bg-[#111] text-white">{c.name}</option>))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25" />
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleDownload()} className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 px-3 py-2 text-xs font-medium text-emerald-400/70 transition hover:bg-emerald-500/10 hover:text-emerald-400">
                <Download size={12} /> PDF do Curso
              </button>
              {generalPdf && (
                <button onClick={() => handleDownload(generalPdf)} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/55">
                  <Download size={12} /> PDF Geral
                </button>
              )}
            </div>
          </div>
        )}

        {/* Search + filters */}
        <div className="mb-6 space-y-2">
          <div className="relative">
            <Search size={11} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar eventos…" className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] py-1.5 pl-7 pr-6 text-xs text-white/65 placeholder:text-white/20 outline-none transition focus:border-white/15" />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50"><X size={11} /></button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {(["all", "event", "holiday", "academic"] as const).map((f) => {
              const labels = { all: "Todos", event: "Eventos", holiday: "Feriados", academic: "Acadêmico" }

              return (
                <button key={f} onClick={() => setFilter(f)} className={cn("flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-all whitespace-nowrap", filter === f ? "bg-white/8 text-white" : "text-white/30 hover:text-white/55")}>
                  {labels[f]} <span className="text-[9px] tabular-nums opacity-40">{counts[f]}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Layout: sidebar + grouped list */}
        <div className="flex gap-10">

          {/* Month jump — desktop only */}
          {!loading && groups.length > 2 && (
            <aside className="hidden lg:block shrink-0 w-16 pt-0.5">
              <div className="sticky top-24 space-y-0.5">
                <p className="mb-3 text-[9px] font-black uppercase tracking-[0.3em] text-white/15">Mês</p>
                {groups.map((g) => (
                  <button key={`${g.key}-${g.year}`} onClick={() => scrollToMonth(g.key)}
                    className={cn("flex w-full items-center justify-between rounded-md px-1.5 py-1 text-[11px] transition-all",
                      g.isCurrent ? "text-emerald-400 font-bold" : activeMonth === g.key ? "text-white font-semibold" : "text-white/25 hover:text-white/50")}
                  >
                    <span>{g.key}</span>
                    <span className="text-[9px] opacity-40 tabular-nums">{g.events.length}</span>
                  </button>
                ))}
              </div>
            </aside>
          )}

          {/* Grouped list */}
          <div className="flex-1 min-w-0">
            {/* Next business day strip */}
            {!loading && nextDayEvents.length > 0 && filter !== "academic" && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2">
                <Sunrise size={12} className="shrink-0 text-amber-400/50" />
                <span className="text-[11px] text-white/30">
                  <span className="font-semibold text-amber-400/50">Próx. dia útil</span>{" — "}
                  {nextBusinessDay.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "short" })}
                  {" · "}
                  {nextDayEvents.map(e => e.title).join(", ")}
                </span>
              </div>
            )}
            {/* Academic summary strip */}
            {filter === "academic" && !loading && semesterConfig && (
              <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-blue-500/10 bg-blue-500/[0.03] px-3 py-2">
                <span className="text-[11px] font-semibold text-blue-400/60">Período Letivo</span>
                <span className="text-[11px] text-white/30">
                  {new Date(semesterConfig.start + "T12:00:00").toLocaleDateString("pt-BR")} — {new Date(semesterConfig.end + "T12:00:00").toLocaleDateString("pt-BR")}
                </span>
                <span className="text-[10px] text-emerald-400/60 font-medium">{academicDays.filter(d => d.isSchoolDay).length} letivos</span>
                <span className="text-[10px] text-red-400/60 font-medium">{academicDays.filter(d => d.isDayOff).length} não letivos</span>
              </div>
            )}
            {loading ? (
              <div className="space-y-6 pt-1">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-3 w-8 animate-pulse rounded bg-white/[0.05]" />
                      <div className="h-px flex-1 bg-white/[0.04]" />
                    </div>
                    <div className="space-y-2 pl-5">
                      {[1, 2, 3].map((j) => (<div key={j} className="h-8 animate-pulse rounded-md bg-white/[0.025]" />))}
                    </div>
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-white/20">
                  {filter === "academic" && !semesterConfig
                    ? "Nenhum período letivo configurado pelo administrador."
                    : "Nenhum evento encontrado."}
                </p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-2 text-xs text-emerald-500/50 hover:text-emerald-400 transition">Limpar busca</button>
                )}
              </div>
            ) : (
              <div>
                {groups.map((g) => (
                  <MonthAccordion
                    key={`${g.key}-${g.year}`}
                    group={g}
                    defaultOpen={g.isCurrent || g.key === firstVisibleMonth}
                    groupRef={(el) => { groupRefs.current[g.key] = el }}
                    isAcademic={filter === "academic"}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
