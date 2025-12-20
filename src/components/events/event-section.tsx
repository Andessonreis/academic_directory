"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Calendar, MapPin, ArrowRight, Clock, AlertCircle, X, Info, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventItem } from "@/types/event"
import { getEvents } from "@/services/event-service"

const COLOR_MAP = {
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    gradient: "from-purple-600 to-indigo-600",
  },
  pink: {
    bg: "bg-pink-500/10",
    text: "text-pink-400",
    border: "border-pink-500/20",
    gradient: "from-pink-600 to-rose-600",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    gradient: "from-blue-600 to-cyan-600",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    gradient: "from-emerald-600 to-green-600",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    border: "border-orange-500/20",
    gradient: "from-orange-600 to-amber-600",
  },
} as const

type CategoryOption = {
  id: string
  label: string
}

type EventCardProps = {
  event: EventItem
  onSelect: (event: EventItem) => void
}

const normalizeCategory = (category?: string) => (category?.trim()?.length ? category.trim() : "Outros")

function getColors(color?: string) {
  if (!color) return COLOR_MAP.purple
  const key = color.toLowerCase() as keyof typeof COLOR_MAP
  return COLOR_MAP[key] || COLOR_MAP.purple
}

function EventCard({ event, onSelect }: EventCardProps) {
  const colors = getColors(event.categoryColor)
  const categoryLabel = normalizeCategory(event.category)

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="group h-full cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/60"
      onClick={() => onSelect(event)}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes do evento ${event.title}`}
      onKeyDown={(keyboardEvent) => {
        if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
          keyboardEvent.preventDefault()
          onSelect(event)
        }
      }}
    >
      <Card className="flex h-full flex-col overflow-hidden border-white/5 bg-[#0F0F0F] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-xl">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          {event.image_url ? (
            <>
              <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#0F0F0F] via-transparent to-transparent" />
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            </>
          ) : (
            <div className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br opacity-20", colors.gradient)}>
              <Calendar size={48} className="text-white/20" />
            </div>
          )}
          <span
            className={cn(
              "absolute top-4 left-4 z-20 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide backdrop-blur-md",
              colors.bg,
              colors.text,
              colors.border,
            )}
          >
            {categoryLabel}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <div className="mb-4 flex items-start justify-between gap-3">
            <h3 className="text-lg font-semibold leading-tight text-white transition-colors group-hover:text-purple-200 sm:text-xl line-clamp-2">
              {event.title}
            </h3>
            {event.status === "pending" && <AlertCircle size={18} className="text-yellow-500" />}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Calendar size={14} />
              {event.event_date}
            </span>
            <span className="text-white/30">•</span>
            <span className="flex items-center gap-2">
              <Clock size={14} />
              {event.event_time?.split(" - ")[0] ?? ""}
            </span>
          </div>

          <div className="mb-4 flex items-center gap-2 text-sm text-white/70">
            <MapPin size={14} />
            <span className="line-clamp-2">{event.location}</span>
          </div>

          {event.description && (
            <p className="mb-6 text-sm text-white/60 line-clamp-3">{event.description}</p>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/50 transition-colors group-hover:text-white">
              Saiba mais
            </span>
            <div className="rounded-full bg-white/10 p-2 text-white transition-all group-hover:bg-white group-hover:text-black">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </Card>
    </motion.article>
  )
}

export default function EventsSection() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [activeCategory, setActiveCategory] = useState("all")

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getEvents()
        setEvents(data)
      } catch (error) {
        console.error("Erro ao carregar eventos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const categoryOptions = useMemo<CategoryOption[]>(() => {
    const unique = new Set<string>()
    events.forEach((event) => unique.add(normalizeCategory(event.category)))
    return [{ id: "all", label: "Todos" }, ...Array.from(unique).map((label) => ({ id: label, label }))]
  }, [events])

  useEffect(() => {
    if (activeCategory === "all") return
    const stillExists = events.some((event) => normalizeCategory(event.category) === activeCategory)
    if (!stillExists) {
      setActiveCategory("all")
    }
  }, [events, activeCategory])

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") return events
    return events.filter((event) => normalizeCategory(event.category) === activeCategory)
  }, [events, activeCategory])

  if (isLoading) {
    return (
      <section className="flex min-h-[400px] items-center justify-center bg-[#050505] py-24">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </section>
    )
  }

  return (
<section id="eventos" className="relative overflow-hidden bg-[#050505] py-16 sm:py-20 lg:py-24">
      {/* Background (Cores originais mantidas) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505]" />
      <div className="container relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 flex flex-col gap-8 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-purple-300/80">
              Vida Estudantil
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl lg:text-5xl">
              Eventos <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">D.A.</span>
            </h2>
            <p className="text-sm leading-relaxed text-white/70 sm:text-base">
              Escolha uma categoria ou explore todos os eventos disponíveis.
            </p>
          </div>

          {events.length > 0 && (
            <div
              className="-mx-4 flex w-full gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:flex-wrap md:overflow-visible"
              role="tablist"
              aria-label="Categorias de eventos"
            >
              {categoryOptions.map((option) => (
                <button
                  key={option.id}
                  role="tab"
                  aria-selected={activeCategory === option.id}
                  onClick={() => setActiveCategory(option.id)}
                  className={cn(
                    "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-all",
                    activeCategory === option.id
                      ? "border-white bg-white text-black shadow-lg shadow-purple-500/30"
                      : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:text-white",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => <EventCard key={event.id} event={event} onSelect={setSelectedEvent} />)
          ) : (
            <Card className="col-span-full border-white/10 bg-white/5 p-8 text-center text-white/70">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white">
                <AlertCircle />
              </div>
              <h3 className="mt-4 text-2xl font-semibold text-white">Nada por aqui ainda</h3>
              <p className="mt-2">Não encontramos eventos nessa categoria. Tente outra aba para descobrir mais atividades.</p>
            </Card>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative flex w-full max-w-5xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111] shadow-2xl md:flex-row"
            >
              <div className="relative h-64 w-full shrink-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 md:h-auto md:w-2/5">
                {selectedEvent.image_url ? (
                  <>
                    <div className="absolute inset-0 z-10 bg-gradient-to-t from-[#111] via-transparent to-transparent md:bg-gradient-to-r" />
                    <img src={selectedEvent.image_url || "/placeholder.svg"} alt="" className="h-full w-full object-cover" />
                  </>
                ) : (
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center bg-gradient-to-br opacity-20",
                      getColors(selectedEvent.categoryColor).gradient,
                    )}
                  >
                    <Calendar size={64} className="text-white/10" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 z-20 rounded-full bg-black/50 p-2 text-white backdrop-blur md:hidden"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative flex w-full flex-col overflow-y-auto p-6 md:p-8">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute right-6 top-6 hidden text-white/40 transition-colors hover:text-white md:block"
                >
                  <X size={24} />
                </button>

                <div className="mb-6">
                  <span
                    className={cn(
                      "mb-3 inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider",
                      getColors(selectedEvent.categoryColor).bg,
                      getColors(selectedEvent.categoryColor).text,
                      getColors(selectedEvent.categoryColor).border,
                    )}
                  >
                    {normalizeCategory(selectedEvent.category)}
                  </span>
                  <h2 className="text-3xl font-bold text-white">{selectedEvent.title}</h2>
                  {selectedEvent.description && <p className="mt-2 text-white/60">{selectedEvent.description}</p>}
                </div>

                <div className="mb-8 space-y-4 rounded-xl border border-white/5 bg-white/5 p-4">
                  <div className="flex items-center gap-3 text-white/80">
                    <Calendar className="text-purple-400" size={20} />
                    <span className="font-medium">{selectedEvent.event_date}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <Clock className="text-pink-400" size={20} />
                    <span className="font-medium">{selectedEvent.event_time?.split(" - ")[0] ?? ""}</span>
                  </div>
                  <div className="flex items-center gap-3 text-white/80">
                    <MapPin className="text-blue-400" size={20} />
                    <span className="font-medium">{selectedEvent.location}</span>
                  </div>
                </div>

                <div className="prose prose-invert prose-sm mb-8">
                  <h4 className="mb-2 flex items-center gap-2 text-white">
                    <Info size={16} /> Sobre o evento
                  </h4>
                  <p className="text-white/70">
                    {selectedEvent.longDescription || "Mais informações em breve. Assim que tivermos novidades, atualizaremos por aqui."}
                  </p>
                </div>

{/*                 <button className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 font-bold text-black transition-colors hover:bg-purple-200">
                  {selectedEvent.status === "pending" ? "Entrar na Lista de Espera" : "Confirmar Presença"}
                </button> */}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
