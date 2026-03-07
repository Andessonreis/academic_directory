"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Download, ChevronDown, ChevronRight, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { getCalendarCourses } from "@/services/calendar-service"
import type { CalendarCourse } from "@/types/event"

interface CalendarEvent {
  id: number | string
  title: string
  date: string
  weekday: string
  type: "deadline" | "holiday" | "event"
  description: string
  time?: string
  location?: string
  rawDate?: Date
}

interface MonthGroup {
  key: string
  label: string
  year: number
  events: CalendarEvent[]
}

const parseCustomDate = (dateStr: string): Date => {
  const [day, monthStr] = dateStr.split(" ")
  const months: { [key: string]: number } = {
    "Jan": 0, "Fev": 1, "Mar": 2, "Abr": 3, "Mai": 4, "Jun": 5,
    "Jul": 6, "Ago": 7, "Set": 8, "Out": 9, "Nov": 10, "Dez": 11
  }
  const year = new Date().getFullYear()
  const month = months[monthStr]
  if (month === undefined) return new Date(year + 1, 0, 1)
  return new Date(year, month, parseInt(day))
}

const SEMESTER_BOUNDARIES = {
  s1_start: parseCustomDate("02 Fev"),
  s1_end: parseCustomDate("15 Jun"),
  s2_start: parseCustomDate("10 Jul"),
  s2_end: parseCustomDate("20 Dez")
}

const ACADEMIC_EVENTS_BASE: CalendarEvent[] = [
  { id: "acad-start", title: "Início do Semestre 2025.1", date: "02 Fev", weekday: "Segunda", type: "event", description: "Início oficial das aulas do primeiro semestre letivo." },
  { id: "acad-1", title: "Solicitação de Trancamento", date: "10 Set", weekday: "Quarta", type: "deadline", description: "Último dia para solicitar trancamento parcial ou total de disciplinas via SUAP." },
  { id: "acad-2", title: "Fim da 2ª Unidade Letiva", date: "25 Out", weekday: "Sábado", type: "deadline", description: "Encerramento oficial das aulas e avaliações da segunda unidade." },
  { id: "acad-3", title: "Semana Nacional de C&T", date: "15 Out", weekday: "Seg-Sex", type: "event", description: "Evento obrigatório para todos os cursos. Palestras no auditório principal." },
  { id: "acad-4", title: "Renovação de Matrícula", date: "10 Dez", weekday: "Seg-Qua", type: "deadline", description: "Período para renovação de matrícula online para o próximo semestre." },
  { id: "acad-end", title: "Fim do Semestre Letivo", date: "20 Dez", weekday: "Sábado", type: "event", description: "Encerramento oficial de todas as atividades acadêmicas." },
]

const ACADEMIC_EVENTS_FIXED: CalendarEvent[] = ACADEMIC_EVENTS_BASE.map((evt) => ({
  ...evt,
  rawDate: parseCustomDate(evt.date),
}))

const TYPE_CFG = {
  deadline: { dot: "bg-amber-400",   text: "text-amber-400",   label: "Prazo"   },
  holiday:  { dot: "bg-red-400",     text: "text-red-400",     label: "Feriado" },
  event:    { dot: "bg-emerald-400", text: "text-emerald-400", label: "Evento"  },
} as const

const SHORT_MONTHS: Record<string, number> = {
  Jan: 0, Fev: 1, Mar: 2, Abr: 3, Mai: 4, Jun: 5,
  Jul: 6, Ago: 7, Set: 8, Out: 9, Nov: 10, Dez: 11,
}

const FULL_MONTHS = [
  "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
  "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",
]

const SHORT_KEYS = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

function EventRow({ event }: { event: CalendarEvent }) {
  const [open, setOpen] = useState(false)
  const cfg = TYPE_CFG[event.type] ?? TYPE_CFG.event
  return (
    <div>
      <button onClick={() => setOpen(!open)} className="w-full text-left">
        <div className="flex items-center gap-3 rounded-md px-2 py-2.5 transition hover:bg-white/[0.03]">
          <span className="w-6 shrink-0 text-center text-xs font-mono text-white/30 tabular-nums">
            {event.date.split(" ")[0]}
          </span>
          <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", cfg.dot)} />
          <span className="flex-1 truncate text-sm text-white/75">{event.title}</span>
          <span className={cn("hidden sm:block shrink-0 text-[10px] font-semibold w-14 text-right", cfg.text)}>
            {cfg.label}
          </span>
          <span className="hidden md:block shrink-0 w-20 text-right text-[11px] text-white/20">
            {event.weekday}
          </span>
          <ChevronRight
            size={12}
            className={cn("shrink-0 text-white/15 transition-transform duration-150", open && "rotate-90 text-white/40")}
          />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="d"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden"
          >
            <p className="pb-3 pl-11 pr-2 text-xs leading-relaxed text-white/40">
              {event.description}
              {event.time     && <span className="text-white/25"> · {event.time}</span>}
              {event.location && <span className="text-white/25"> · {event.location}</span>}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MonthAccordion({ group, defaultOpen, groupRef }: {
  group: MonthGroup
  defaultOpen: boolean
  groupRef?: (el: HTMLDivElement | null) => void
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div ref={groupRef} data-month={group.key}>
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 py-2.5 text-left">
        <span className="w-8 shrink-0 text-xs font-black uppercase tracking-[0.2em] text-white/40">{group.key}</span>
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="shrink-0 rounded-full bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-white/25 tabular-nums">
          {group.events.length}
        </span>
        <ChevronDown
          size={13}
          className={cn("shrink-0 text-white/20 transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="r"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="mb-3 ml-3 border-l border-white/[0.06] pl-3">
              {group.events.map((evt) => <EventRow key={evt.id} event={evt} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function CalendarSection() {
  const [filter, setFilter]                     = useState<"all"|"deadline"|"holiday"|"event">("all")
  const [search, setSearch]                     = useState("")
  const [events, setEvents]                     = useState<CalendarEvent[]>([])
  const [loading, setLoading]                   = useState(true)
  const [courses, setCourses]                   = useState<CalendarCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")
  const [activeMonth, setActiveMonth]           = useState<string>("")
  const groupRefs = useRef<Record<string, HTMLDivElement | null>>({})

  useEffect(() => {
    const fetchAndFilterEvents = async () => {
      try {
        const currentYear = new Date().getFullYear()
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const response = await fetch(`https://brasilapi.com.br/api/feriados/v1/${currentYear}`)
        const data = await response.json()

        const formattedHolidays: CalendarEvent[] = data.map((holiday: any, index: number) => {
          const dateObj = new Date(holiday.date + "T12:00:00")
          const day = String(dateObj.getDate()).padStart(2, '0')
          const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
          const formattedDate = `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`
          const weekday = dateObj.toLocaleString('pt-BR', { weekday: 'long' })
          const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).split('-')[0]

          let description = "Feriado Nacional. Não haverá funcionamento do campus."
          const inSemester1 = dateObj >= SEMESTER_BOUNDARIES.s1_start && dateObj <= SEMESTER_BOUNDARIES.s1_end
          const inSemester2 = dateObj >= SEMESTER_BOUNDARIES.s2_start && dateObj <= SEMESTER_BOUNDARIES.s2_end
          if (inSemester1 || inSemester2) {
            if (dateObj.getDay() === 4) description += " Possibilidade de recesso na sexta-feira (imprensado)."
            if (dateObj.getDay() === 2) description += " Possibilidade de recesso na segunda-feira."
          }

          return { id: `hol-${index}`, title: holiday.name, date: formattedDate, weekday: formattedWeekday, type: "holiday" as const, description, rawDate: dateObj }
        })

        const allEvents = [...ACADEMIC_EVENTS_FIXED, ...formattedHolidays]
        const futureEvents = allEvents
          .filter(evt => evt.rawDate && evt.rawDate >= today)
          .sort((a, b) => (a.rawDate && b.rawDate ? a.rawDate.getTime() - b.rawDate.getTime() : 0))

        setEvents(futureEvents)
      } catch {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        setEvents(ACADEMIC_EVENTS_FIXED.filter(evt => evt.rawDate && evt.rawDate >= today))
      } finally {
        setLoading(false)
      }
    }
    fetchAndFilterEvents()
  }, [])

  useEffect(() => {
    const loadCourses = async () => {
      const list = await getCalendarCourses()
      setCourses(list)
      if (list.length) {
        const def = list.find((c) => c.isDefault)
        setSelectedCourseId((def ?? list[0]).id)
      }
    }
    loadCourses()
  }, [])

  const filtered = events.filter((e) => {
    const matchType   = filter === "all" || e.type === filter
    const q           = search.trim().toLowerCase()
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q)
    return matchType && matchSearch
  })

  // Group filtered events by month
  const groups: MonthGroup[] = []
  const seen: Record<string, number> = {}
  for (const evt of filtered) {
    const shortKey = evt.date.split(" ")[1] ?? "?"
    const idx      = SHORT_MONTHS[shortKey] ?? -1
    const yr       = evt.rawDate?.getFullYear() ?? new Date().getFullYear()
    const key      = `${shortKey}-${yr}`
    if (seen[key] === undefined) {
      seen[key] = groups.length
      groups.push({ key: shortKey, label: FULL_MONTHS[idx] ?? shortKey, year: yr, events: [] })
    }
    groups[seen[key]].events.push(evt)
  }

    // Find the first visible month group (with events from today onward)
    const firstVisibleMonth = groups.length > 0 ? groups[0].key : SHORT_KEYS[new Date().getMonth()]
    const nextVisibleMonth  = groups.length > 1 ? groups[1].key : null

  const scrollToMonth = useCallback((key: string) => {
    groupRefs.current[key]?.scrollIntoView({ behavior: "smooth", block: "start" })
    setActiveMonth(key)
  }, [])

  const selectedCourse = courses.find(c => c.id === selectedCourseId)
  const generalPdf     = courses.find(c => c.isDefault) ?? courses[0]
  const handleDownload = (course?: CalendarCourse) => {
    const t = course ?? selectedCourse
    if (!t?.pdfUrl) return alert("Nenhum PDF configurado.")
    window.open(t.pdfUrl, "_blank")
  }

    // Highlight the first visible month by default
    useEffect(() => {
      if (groups.length > 0) setActiveMonth(groups[0].key)
    }, [filtered.length])
  const counts = {
    all:      events.length,
    deadline: events.filter(e => e.type === "deadline").length,
    event:    events.filter(e => e.type === "event").length,
    holiday:  events.filter(e => e.type === "holiday").length,
  }

  return (
    <section id="calendario" className="relative overflow-hidden bg-[#050505] py-16 sm:py-20 lg:py-24">
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-emerald-900/8 via-transparent to-transparent opacity-50" />
      </div>

      <div className="relative z-10 container mx-auto max-w-5xl px-4 sm:px-6">

        {/* Header */}
        <div className="mb-10 text-center sm:mb-14">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-2 text-[10px] font-bold uppercase tracking-[0.4em] text-emerald-500/50"
          >
            Agenda Campus
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.05 }}
            className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl"
          >
            Calendário{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Institucional</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="mx-auto mt-3 max-w-xl text-sm text-white/50 sm:text-base"
          >
            Consulte prazos, feriados e eventos institucionais do IFBA Irecê.
          </motion.p>
          {!loading && (
            <p className="mt-2 text-xs text-white/20 tabular-nums">{filtered.length} eventos listados</p>
          )}
        </div>

        {/* Download strip */}
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
            <button onClick={() => handleDownload(generalPdf)} className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs font-medium text-white/35 transition hover:bg-white/[0.04] hover:text-white/55">
              <Download size={12} /> PDF Geral
            </button>
          </div>
        </div>

        {/* Search + filters */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[160px] flex-1">
            <Search size={11} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/25" />
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar eventos…"
              className="w-full rounded-lg border border-white/[0.07] bg-white/[0.02] py-1.5 pl-7 pr-6 text-xs text-white/65 placeholder:text-white/20 outline-none transition focus:border-white/15"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50">
                <X size={11} />
              </button>
            )}
          </div>
          <div className="flex gap-0.5">
            {(["all","deadline","event","holiday"] as const).map((f) => {
              const labels = { all:"Todos", deadline:"Prazos", event:"Eventos", holiday:"Feriados" }
              return (
                <button key={f} onClick={() => setFilter(f)}
                  className={cn("flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition-all",
                    filter === f ? "bg-white/8 text-white" : "text-white/30 hover:text-white/55")}
                >
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
                  <button key={g.key} onClick={() => scrollToMonth(g.key)}
                    className={cn("flex w-full items-center justify-between rounded-md px-1.5 py-1 text-[11px] transition-all",
                      activeMonth === g.key ? "text-white font-semibold" : "text-white/25 hover:text-white/50")}
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
            {loading ? (
              <div className="space-y-6 pt-1">
                {[1,2,3].map((i) => (
                  <div key={i}>
                    <div className="mb-3 flex items-center gap-3">
                      <div className="h-3 w-8 animate-pulse rounded bg-white/[0.05]" />
                      <div className="h-px flex-1 bg-white/[0.04]" />
                    </div>
                    <div className="space-y-2 pl-5">
                      {[1,2,3].map((j) => (<div key={j} className="h-8 animate-pulse rounded-md bg-white/[0.025]" />))}
                    </div>
                  </div>
                ))}
              </div>
            ) : groups.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-sm text-white/20">Nenhum evento encontrado.</p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-2 text-xs text-emerald-500/50 hover:text-emerald-400 transition">
                    Limpar busca
                  </button>
                )}
              </div>
            ) : (
              <div>
                {groups.map((g) => (
                  <MonthAccordion
                    key={g.key}
                    group={g}
                    defaultOpen={g.key === firstVisibleMonth || g.key === nextVisibleMonth}
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
