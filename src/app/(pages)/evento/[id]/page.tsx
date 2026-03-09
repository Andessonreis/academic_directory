"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Clock, MapPin, Info, Loader2, FileDown, ExternalLink, Mail, CheckCircle } from "lucide-react"
import Link from "next/link"
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { getEventById } from "@/services/event-service"
import { getPageBySlug } from "@/services/page-service"
import { cn, resolveEventVars } from "@/lib/utils"
import type { EventItem, CustomPage } from "@/types/event"

const COLOR_MAP: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  purple: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", gradient: "from-purple-600 to-indigo-600" },
  pink: { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20", gradient: "from-pink-600 to-rose-600" },
  blue: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", gradient: "from-blue-600 to-cyan-600" },
  green: { bg: "bg-green-500/10", text: "text-green-400", border: "border-green-500/20", gradient: "from-emerald-600 to-green-600" },
  orange: { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20", gradient: "from-orange-600 to-amber-600" },
}

function getColors(color?: string) {
  return COLOR_MAP[color?.toLowerCase() ?? "purple"] ?? COLOR_MAP.purple
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventItem | null>(null)
  const [customPage, setCustomPage] = useState<CustomPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regSubmitting, setRegSubmitting] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  useEffect(() => {
    if (!eventId) return
    getEventById(eventId).then(async (data) => {
      if (data) {
        setEvent(data)
        // Check if there's a linked custom page for this event
        // We do this via a simple fetch from custom_pages where event_id matches
        try {
          const { supabase } = await import("@/lib/supabase/client")
          const { data: page } = await supabase
            .from("custom_pages")
            .select("*")
            .eq("event_id", eventId)
            .eq("is_published", true)
            .single()
          if (page) {
            setCustomPage({
              id: page.id,
              slug: page.slug,
              title: page.title,
              description: page.description,
              htmlContent: page.html_content ?? "",
              coverImage: page.cover_image,
              eventId: page.event_id,
              attachments: Array.isArray(page.attachments) ? page.attachments : [],
              isPublished: page.is_published,
              createdAt: page.created_at,
              updatedAt: page.updated_at,
            })
          }
        } catch { /* no custom page, that's fine */ }
      } else {
        setNotFound(true)
      }
      setLoading(false)
    })
  }, [eventId])

  if (loading) {
    return (
      <main className="min-h-screen bg-[#030303] text-white flex items-center justify-center">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </main>
    )
  }

  if (notFound || !event) {
    return (
      <main className="min-h-screen bg-[#030303] text-white">
        <Navigation />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-3xl font-bold mb-3">Evento não encontrado</h1>
          <p className="text-white/50 mb-6 text-center">O evento que você procura não existe ou foi removido.</p>
          <Link href="/" className="flex items-center gap-2 text-purple-400 hover:text-purple-300 transition text-sm">
            <ArrowLeft size={16} /> Voltar ao início
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const colors = getColors(event.categoryColor)

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <Navigation />

      {/* Hero / Cover */}
      <div className="relative w-full overflow-hidden">
        {event.image_url ? (
          <div className="relative h-56 sm:h-72 md:h-96">
            <img
              src={event.image_url}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#030303]" />
          </div>
        ) : (
          <div className={cn("h-48 sm:h-64 bg-gradient-to-br opacity-30", colors.gradient)} />
        )}
      </div>

      <section className={`relative ${event.image_url ? "-mt-20 sm:-mt-28" : "pt-28"} pb-16 sm:pb-24`}>
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Back + Category */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-5">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/70 transition"
              >
                <ArrowLeft size={16} /> Voltar
              </button>
              {event.category && (
                <span className={cn("rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider", colors.bg, colors.text, colors.border)}>
                  {event.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white">{event.title}</h1>
            {event.description && (
              <p className="mt-3 text-white/60 text-sm sm:text-lg max-w-3xl">{event.description}</p>
            )}
          </div>

          {/* Info strip — centered, auto-width */}
          <div className="mb-8 flex justify-center">
            <div className="inline-flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.03] px-6 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-4">
              {event.event_date && (
                <div className="flex items-center gap-3 text-white/70">
                  <Calendar className="text-purple-400 shrink-0" size={18} />
                  <span className="text-sm font-medium">{event.event_date}</span>
                </div>
              )}
              {event.event_time && (
                <div className="flex items-center gap-3 text-white/70">
                  <Clock className="text-pink-400 shrink-0" size={18} />
                  <span className="text-sm font-medium">{event.event_time}</span>
                </div>
              )}
              {event.location && (
                <div className="flex items-center gap-3 text-white/70">
                  <MapPin className="text-blue-400 shrink-0" size={18} />
                  <span className="text-sm font-medium">{event.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Registration section */}
          {event.registration_type === "external" && event.registration_url && (
            <div className="mb-8 flex justify-center">
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-purple-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-purple-500 hover:shadow-lg hover:shadow-purple-500/20"
              >
                <ExternalLink size={18} /> Inscrever-se ↗
              </a>
            </div>
          )}

          {event.registration_type === "internal" && !regSuccess && (
            <div className="mb-8 mx-auto max-w-md rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Mail size={16} className="text-emerald-400" /> Registrar Participação
              </h3>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (!regName.trim() || !regEmail.trim()) return
                  setRegSubmitting(true)
                  try {
                    const { supabase } = await import("@/lib/supabase/client")
                    await supabase.from("event_registrations").insert({
                      event_id: event.id,
                      name: regName.trim(),
                      email: regEmail.trim().toLowerCase(),
                    })
                    setRegSuccess(true)
                  } catch (err) {
                    console.error("Erro no registro:", err)
                    alert("Erro ao registrar. Tente novamente.")
                  } finally {
                    setRegSubmitting(false)
                  }
                }}
                className="space-y-3"
              >
                <input
                  type="text"
                  placeholder="Seu nome completo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50"
                />
                <input
                  type="email"
                  placeholder="Seu email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {regSubmitting ? "Registrando..." : "Confirmar Participação"}
                </button>
              </form>
            </div>
          )}

          {event.registration_type === "internal" && regSuccess && (
            <div className="mb-8 mx-auto max-w-md rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-white mb-1">Participação Registrada!</h3>
              <p className="text-sm text-white/50">Você receberá um email de confirmação em breve.</p>
            </div>
          )}

          {/* Long description */}
          <div className="mb-8">
            <h3 className="flex items-center gap-2 text-white font-semibold mb-3">
              <Info size={16} className="text-white/40" /> Sobre o evento
            </h3>
            {(() => {
              const resolved = event.longDescription
                ? resolveEventVars(event.longDescription, event)
                : "Mais informações em breve."
              // If the resolved content looks like HTML, render it; otherwise plain text
              const isHtml = /<[a-z][\s\S]*>/i.test(resolved)
              return isHtml ? (
                <div
                  className="prose prose-invert prose-sm sm:prose-base max-w-none
                    prose-p:text-white/60 prose-headings:text-white prose-a:text-purple-400
                    prose-strong:text-white prose-li:text-white/60"
                  dangerouslySetInnerHTML={{ __html: resolved }}
                />
              ) : (
                <p className="text-white/60 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                  {resolved}
                </p>
              )
            })()}
          </div>

          {/* Custom page content if linked */}
          {customPage && customPage.htmlContent && (
            <div className="mt-10 pt-8 border-t border-white/[0.06]">
              <div
                className="prose prose-invert prose-sm sm:prose-base max-w-none
                  prose-headings:text-white prose-p:text-white/70 prose-a:text-purple-400
                  prose-strong:text-white prose-img:rounded-xl prose-img:border prose-img:border-white/10"
                dangerouslySetInnerHTML={{ __html: customPage.htmlContent }}
              />
            </div>
          )}

          {/* Attachments from custom page */}
          {customPage && customPage.attachments && customPage.attachments.length > 0 && (
            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white/70 mb-4 flex items-center gap-2">
                <FileDown size={16} className="text-purple-400" />
                Arquivos para Download
              </h3>
              <div className="space-y-2">
                {customPage.attachments.map((att, idx) => (
                  <a
                    key={idx}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 transition hover:border-purple-500/30 hover:bg-purple-500/5"
                  >
                    <div className="shrink-0 rounded-lg bg-purple-500/10 p-2 text-purple-400 group-hover:bg-purple-500/20 transition">
                      {att.type === "link" ? <ExternalLink size={16} /> : <FileDown size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white/80 group-hover:text-white transition truncate">{att.name}</p>
                      {att.size ? (
                        <p className="text-[11px] text-white/30">
                          {att.size < 1024 * 1024 ? `${(att.size / 1024).toFixed(0)} KB` : `${(att.size / (1024 * 1024)).toFixed(1)} MB`}
                        </p>
                      ) : att.type === "link" ? (
                        <p className="text-[11px] text-white/30 truncate">{att.url}</p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-[11px] font-medium text-purple-400/60 group-hover:text-purple-400 transition">
                      {att.type === "link" ? "Abrir ↗" : "Baixar ↓"}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
