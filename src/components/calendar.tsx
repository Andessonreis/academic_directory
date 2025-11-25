"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Calendar, Clock, Download, MapPin, AlertCircle, FileWarning, PartyPopper } from "lucide-react"
import { cn } from "@/lib/utils"

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

  const filteredEvents = events.filter(event => {
    if (filter === "all") return true
    return event.type === filter
  })

  return (
    <section id="calendario" className="py-24 relative bg-[#030303] overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">

        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Calendário <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">Institucional</span>
            </h2>
            <p className="text-white/60 max-w-xl text-lg">
              Datas oficiais que afetam todos os cursos. Fique atento aos prazos da secretaria e feriados.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 hover:border-emerald-500/50 transition-colors focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none">
              <option>Baixar Calendário: Selecione o Curso</option>
              <option>Engenharia de Computação</option>
              <option>Engenharia Elétrica</option>
              <option>Técnico em Informática</option>
              <option>Técnico em Edificações</option>
            </select>

            <button className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 transition-all group whitespace-nowrap">
              <Download size={20} className="group-hover:scale-110 transition-transform" />
              <span>Baixar PDF</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-1">
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

          <div className="lg:col-span-2">

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
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
                    "px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                    filter === tab.id
                      ? "bg-white text-black border-white"
                      : "bg-white/5 text-white/60 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/10"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 min-h-[300px]">
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
                      <Card className="group p-4 bg-white/[0.02] border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10 transition-all flex flex-col sm:flex-row gap-5 items-start sm:items-center">

                        <div className={cn(
                          "flex flex-col items-center justify-center w-[60px] h-[60px] rounded-lg border shrink-0",
                          event.type === 'deadline' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                            event.type === 'holiday' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                              "bg-blue-500/10 border-blue-500/20 text-blue-400"
                        )}>
                          <span className="text-lg font-bold leading-none">{event.date.split(" ")[0]}</span>
                          <span className="text-[10px] uppercase font-bold opacity-80">{event.date.split(" ")[1]}</span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {event.title}
                            </h4>
                            <span className={cn(
                              "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border",
                              event.type === 'deadline' ? "bg-amber-500/10 border-amber-500/20 text-amber-400" :
                                event.type === 'holiday' ? "bg-red-500/10 border-red-500/20 text-red-400" :
                                  "bg-blue-500/10 border-blue-500/20 text-blue-400"
                            )}>
                              {event.type === 'deadline' ? 'Prazo' : event.type === 'holiday' ? 'Feriado' : 'Evento'}
                            </span>

                            {(event.description.includes("imprensado") || event.description.includes("recesso")) && (
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border bg-purple-500/10 border-purple-500/20 text-purple-400 flex items-center gap-1">
                                <PartyPopper size={10} /> Recesso?
                              </span>
                            )}
                          </div>

                          <p className="text-white/50 text-sm line-clamp-2">
                            {event.description}
                          </p>
                        </div>

                        <div className="hidden sm:block text-xs font-medium text-white/20 uppercase tracking-widest rotate-90 origin-center w-4 text-center">
                          {event.weekday.substring(0, 3)}
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
