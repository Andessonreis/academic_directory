"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Download, MapPin, AlertCircle, FileWarning, PartyPopper, ChevronDown } from "lucide-react"
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
  {
    id: "acad-start",
    title: "Início do Semestre 2025.1",
    date: "02 Fev",
    weekday: "Segunda",
    type: "event",
    description: "Início oficial das aulas do primeiro semestre letivo."
  },
  {
    id: "acad-1",
    title: "Solicitação de Trancamento",
    date: "10 Set",
    weekday: "Quarta",
    type: "deadline",
    description: "Último dia para solicitar trancamento parcial ou total de disciplinas via SUAP."
  },
  {
    id: "acad-2",
    title: "Fim da 2ª Unidade Letiva",
    date: "25 Out",
    weekday: "Sábado",
    type: "deadline",
    description: "Encerramento oficial das aulas e avaliações da segunda unidade."
  },
  {
    id: "acad-3",
    title: "Semana Nacional de C&T",
    date: "15 Out",
    weekday: "Seg-Sex",
    type: "event",
    description: "Evento obrigatório para todos os cursos. Palestras no auditório principal."
  },
  {
    id: "acad-4",
    title: "Renovação de Matrícula",
    date: "10 Dez",
    weekday: "Seg-Qua",
    type: "deadline",
    description: "Período para renovação de matrícula online para o próximo semestre."
  },
  {
    id: "acad-end",
    title: "Fim do Semestre Letivo",
    date: "20 Dez",
    weekday: "Sábado",
    type: "event",
    description: "Encerramento oficial de todas as atividades acadêmicas."
  }
]

const ACADEMIC_EVENTS_FIXED: CalendarEvent[] = ACADEMIC_EVENTS_BASE.map((evt) => ({
  ...evt,
  rawDate: parseCustomDate(evt.date),
}))

export default function CalendarSection() {
  const [filter, setFilter] = useState<"all" | "deadline" | "holiday" | "event">("all")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<CalendarCourse[]>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string>("")

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

          // Formata data visual: "07 Set"
          const day = String(dateObj.getDate()).padStart(2, '0')
          const month = dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '')
          const formattedDate = `${day} ${month.charAt(0).toUpperCase() + month.slice(1)}`

          // Formata dia da semana: "Domingo"
          const weekday = dateObj.toLocaleString('pt-BR', { weekday: 'long' })
          const formattedWeekday = weekday.charAt(0).toUpperCase() + weekday.slice(1).split('-')[0]

          let description = "Feriado Nacional. Não haverá funcionamento do campus."

          const inSemester1 = dateObj >= SEMESTER_BOUNDARIES.s1_start && dateObj <= SEMESTER_BOUNDARIES.s1_end
          const inSemester2 = dateObj >= SEMESTER_BOUNDARIES.s2_start && dateObj <= SEMESTER_BOUNDARIES.s2_end
          const isAcademicPeriod = inSemester1 || inSemester2

          if (isAcademicPeriod) {
            if (dateObj.getDay() === 4) {
              description += " Possibilidade de recesso na sexta-feira (imprensado)."
            }
            if (dateObj.getDay() === 2) {
              description += " Possibilidade de recesso na segunda-feira."
            }
          }

          return {
            id: `hol-${index}`,
            title: holiday.name,
            date: formattedDate,
            weekday: formattedWeekday,
            type: "holiday",
            description: description,
            rawDate: dateObj
          }
        })

        const allEvents = [...ACADEMIC_EVENTS_FIXED, ...formattedHolidays]

        const futureEvents = allEvents
          .filter(evt => evt.rawDate && evt.rawDate >= today)
          .sort((a, b) => (a.rawDate && b.rawDate ? a.rawDate.getTime() - b.rawDate.getTime() : 0))

        setEvents(futureEvents)

      } catch (error) {
        console.error("Erro ao buscar feriados:", error)
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
        const defaultCourse = list.find((c) => c.isDefault)
        setSelectedCourseId((defaultCourse ?? list[0]).id)
      }
    }
    loadCourses()
  }, [])

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true
    return event.type === filter
  })

  const selectedCourse = courses.find((c) => c.id === selectedCourseId)
  const generalPdf = courses.find((c) => c.isDefault) ?? courses[0]

  const handleDownloadCourse = (course?: CalendarCourse) => {
    const target = course ?? selectedCourse
    if (!target?.pdfUrl) return alert("Nenhum PDF configurado para este curso.")
    window.open(target.pdfUrl, "_blank")
  }

  return (
    <section id="calendario" className="relative overflow-hidden bg-[#030303] py-16 sm:py-20 lg:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),transparent_60%)]" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6">

        {/* Cabeçalho */}
        <div className="mb-10 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Agenda Campus</p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl">
              Calendário <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Institucional</span>
            </h2>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Eventos, feriados e prazos oficiais do IFBA Irecê. Tudo organizado por curso e pronto para baixar.
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl bg-white/[0.03] p-4 sm:flex-row sm:items-center lg:bg-transparent lg:p-0">
            <div className="min-w-0 flex-1">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Escolha o curso</label>
              <div className="relative">
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full appearance-none rounded-xl border border-emerald-500/40 bg-[#0c0c0c] px-4 py-3 pr-10 text-sm text-white/80 outline-none transition-colors hover:border-emerald-400 focus:border-emerald-300"
                >
                  <option value="" disabled>
                    Baixar Calendário: Selecione o Curso
                  </option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id} className="bg-[#0c0c0c] text-white">
                      {course.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:w-60">
              <button
                onClick={() => handleDownloadCourse()}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200 transition-all hover:bg-emerald-500/20"
              >
                <Download size={18} />
                <span>PDF do Curso</span>
              </button>

              <button
                onClick={() => handleDownloadCourse(generalPdf)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                <Download size={18} />
                <span>PDF Geral</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">

          <div className="order-2 hidden lg:order-1 lg:col-span-1 lg:block">
            <Card className="p-6 bg-gradient-to-b from-emerald-900/20 to-black border-emerald-500/20 h-full relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Calendar size={120} />
              </div>

              <div className="relative z-10 flex flex-col h-full">
                <span className="text-emerald-400 font-medium tracking-wider text-sm mb-2 uppercase">Status do Semestre</span>
                <h3 className="text-3xl font-bold text-white mb-1">2025.1</h3>
                <p className="text-white/50 mb-8">Campus Irecê</p>

                <div className="space-y-6 mt-auto">
                  <div className="p-4 rounded-lg bg-white/5 border border-white/10">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-white/70">Dias Letivos Concluídos</span>
                      <span className="text-emerald-400 font-bold">45%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "45%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                      <span className="block text-xs text-white/40 mb-1">Início</span>
                      <span className="text-white font-medium">02 Fev</span>
                    </div>
                    <div className="p-3 bg-white/[0.03] rounded-lg border border-white/5">
                      <span className="block text-xs text-white/40 mb-1">Término</span>
                      <span className="text-white font-medium">15 Jun</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="order-1 lg:order-2 lg:col-span-2">

            <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              {[
                { id: "all", label: "Todos" },
                { id: "deadline", label: "Prazos & Secretaria" },
                { id: "event", label: "Eventos Campus" },
                { id: "holiday", label: "Feriados" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id as any)}
                  className={cn(
                    "rounded-full border px-4 py-2 text-center text-sm font-medium transition-all",
                    filter === tab.id
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {loading ? (
                <div className="space-y-3 opacity-50">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-white/5 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="group space-y-3 rounded-2xl border-white/5 bg-white/[0.03] p-4 transition-all hover:border-white/15 hover:bg-white/[0.06]">
                        <div className="flex items-center justify-between gap-3">
                          <div className={cn(
                            "flex h-12 w-12 flex-col items-center justify-center rounded-xl border text-sm font-semibold",
                            event.type === 'deadline'
                              ? "border-amber-400/60 bg-amber-500/10 text-amber-200"
                              : event.type === 'holiday'
                                ? "border-red-400/60 bg-red-500/10 text-red-200"
                                : "border-blue-400/60 bg-blue-500/10 text-blue-200",
                          )}>
                            <span className="text-base leading-none">{event.date.split(" ")[0]}</span>
                            <span className="text-[11px] uppercase tracking-wide">{event.date.split(" ")[1]}</span>
                          </div>
                          <span className="flex-1 text-right text-xs font-semibold uppercase tracking-[0.25em] text-white/40 sm:text-sm sm:tracking-[0.35em]">
                            {event.weekday}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="text-lg font-semibold text-white">
                              {event.title}
                            </h4>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                              event.type === 'deadline'
                                ? "bg-amber-500/15 text-amber-200"
                                : event.type === 'holiday'
                                  ? "bg-red-500/15 text-red-200"
                                  : "bg-blue-500/15 text-blue-200",
                            )}>
                              {event.type === 'deadline' ? 'Prazo' : event.type === 'holiday' ? 'Feriado' : 'Evento'}
                            </span>
                            {(event.description.includes("imprensado") || event.description.includes("recesso")) && (
                              <span className="flex items-center gap-1 rounded-full bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-purple-200">
                                <PartyPopper size={10} /> Recesso?
                              </span>
                            )}
                          </div>

                          <p className="text-sm leading-relaxed text-white/70">
                            {event.description}
                          </p>

                          {(event.time || event.location) && (
                            <div className="flex flex-wrap gap-4 text-xs text-white/50">
                              {event.time && (
                                <span className="inline-flex items-center gap-1">
                                  <Clock size={12} />
                                  {event.time}
                                </span>
                              )}
                              {event.location && (
                                <span className="inline-flex items-center gap-1">
                                  <MapPin size={12} />
                                  {event.location}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
              {!loading && filteredEvents.length === 0 && (
                <div className="text-center py-10 text-white/40">
                  Nenhum evento encontrado para este filtro (apenas eventos futuros são exibidos).
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
