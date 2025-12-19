"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card } from "@/components/ui/card"
import {
  Calendar,
  MapPin,
  ArrowRight,
  Clock,
  AlertCircle,
  X,
  Info,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { EventItem } from "@/types/event"
import { getEvents } from "@/services/event-service"

export default function EventsSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [events, setEvents] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null)
  const [isPaused, setIsPaused] = useState(false)

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

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return
    const current = scrollRef.current
    const scrollAmount = direction === "left" ? -350 : 350
    const isEnd = current.scrollLeft + current.clientWidth >= current.scrollWidth - 10
    if (direction === "right" && isEnd) {
      current.scrollTo({ left: 0, behavior: "smooth" })
    } else {
      current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (isPaused || isLoading || selectedEvent) return
    const interval = setInterval(() => {
      if (!scrollRef.current) return
      const current = scrollRef.current
      const isEnd = current.scrollLeft + current.clientWidth >= current.scrollWidth - 50
      if (isEnd) {
        current.scrollTo({ left: 0, behavior: "smooth" })
      } else {
        current.scrollBy({ left: 350, behavior: "smooth" })
      }
    }, 4000)
    return () => clearInterval(interval)
  }, [isPaused, isLoading, selectedEvent])

  const getColors = (color?: string) => {
    const map: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
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
    }
    return map[color ?? "purple"] || map.purple
  }

  if (isLoading) {
    return (
      <section className="py-24 bg-[#050505] flex justify-center items-center min-h-[400px]">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </section>
    )
  }

  return (
    <section id="eventos" className="py-24 relative overflow-hidden bg-[#050505]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-[#050505] to-[#050505] pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Eventos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">D.A.</span>
            </h2>
            <p className="text-white/60 text-lg">Clique nos cards para ver detalhes completos.</p>
          </div>

          <div className="hidden md:flex gap-3">
            <button
              onClick={() => scroll("left")}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all active:scale-95"
              aria-label="Anterior"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-3 rounded-full border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white hover:border-white/30 transition-all active:scale-95"
              aria-label="Próximo"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)} className="relative">
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-8 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] scroll-smooth"
          >
            {events.map((event) => {
              const colors = getColors(event.categoryColor)
              return (
                <motion.div
                  key={event.id}
                  className="min-w-[80vw] max-w-sm md:min-w-[320px] md:max-w-xs snap-center relative group"
                  onClick={() => setSelectedEvent(event)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Card
                    className="h-[500px] bg-[#0F0F0F] border-white/5 overflow-hidden relative hover:border-white/20 transition-all duration-300 cursor-pointer flex flex-col group-hover:-translate-y-1 group-hover:shadow-xl"
                  >
                    <div className="h-48 w-full relative overflow-hidden shrink-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                      {event.image_url ? (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F0F] to-transparent z-10" />
                          <img
                            src={event.image_url || "/placeholder.svg"}
                            alt={event.title}
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                          />
                        </>
                      ) : (
                        <div
                          className={`w-full h-full bg-gradient-to-br ${colors.gradient} opacity-20 relative flex items-center justify-center`}
                        >
                          <Calendar size={48} className="text-white/20" />
                        </div>
                      )}
                      <span
                        className={cn(
                          "absolute top-4 left-4 z-20 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-lg",
                          colors.bg,
                          colors.text,
                          colors.border,
                        )}
                      >
                        {event.category}
                      </span>
                    </div>

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 leading-tight min-h-[3.5rem]">
                          {event.title}
                        </h3>
                        {event.status === "pending" && (
                          <AlertCircle size={18} className="text-yellow-500 shrink-0 ml-2" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                        <Calendar size={14} />
                        <span>{event.event_date}</span>
                        <span className="mx-1 text-white/20">|</span>
                        <Clock size={14} />
                        <span>{event.event_time?.split(" - ")[0] ?? ""}</span>
                      </div>

                      <div className="flex items-center gap-2 text-white/60 text-sm mb-4">
                        <MapPin size={14} />
                        <span className="truncate">{event.location}</span>
                      </div>

                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/5">
                        <span className="text-xs font-medium text-white/40 uppercase tracking-wider group-hover:text-white/80 transition-colors">
                          Saiba mais
                        </span>
                        <div className="p-2 rounded-full bg-white/5 group-hover:bg-white group-hover:text-black transition-all">
                          <ArrowRight size={14} />
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
            <div className="min-w-[1px] md:hidden" />
          </div>
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
              className="relative w-full max-w-5xl bg-[#111] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
            >
              <div className="w-full md:w-2/5 h-64 md:h-auto relative shrink-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                {selectedEvent.image_url ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#111] to-transparent z-10" />
                    <img
                      src={selectedEvent.image_url || "/placeholder.svg"}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </>
                ) : (
                  <div
                    className={`w-full h-full bg-gradient-to-br ${getColors(selectedEvent.categoryColor).gradient} opacity-20 relative flex items-center justify-center`}
                  >
                    <Calendar size={64} className="text-white/10" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 md:hidden p-2 bg-black/50 backdrop-blur rounded-full text-white z-20"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 md:p-8 flex flex-col overflow-y-auto w-full relative">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="hidden md:block absolute top-6 right-6 text-white/40 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>

                <div className="mb-6">
                  <span
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider mb-3 inline-block",
                      getColors(selectedEvent.categoryColor).bg,
                      getColors(selectedEvent.categoryColor).text,
                      getColors(selectedEvent.categoryColor).border,
                    )}
                  >
                    {selectedEvent.category}
                  </span>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedEvent.title}</h2>
                  <p className="text-white/60">{selectedEvent.description}</p>
                </div>

                <div className="space-y-4 mb-8 bg-white/5 p-4 rounded-xl border border-white/5">
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
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Info size={16} /> Sobre o evento
                  </h4>
                  <p className="text-white/70 leading-relaxed">{selectedEvent.longDescription}</p>
                </div>

                <button className="mt-auto w-full py-3 rounded-lg bg-white text-black font-bold hover:bg-purple-200 transition-colors flex items-center justify-center gap-2">
                  {selectedEvent.status === "pending" ? "Entrar na Lista de Espera" : "Confirmar Presença"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  )
}
