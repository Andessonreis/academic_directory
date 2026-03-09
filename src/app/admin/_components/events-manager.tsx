"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, Upload, X, Calendar, Clock, MapPin, FileText, ExternalLink, Mail, Eye, EyeOff, Link2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createEvent, updateEvent, deleteEvent } from "@/services/event-service"
import { createCalendarEvent, updateCalendarEvent } from "@/services/calendar-service"
import { getActiveCourses } from "@/services/course-service"
import { supabase } from "@/lib/supabase/client"
import type { EventItem, Course } from "@/types/event"

const STORAGE_BUCKET = "uploads"

const CATEGORY_PRESETS = [
  { name: "Reunião", color: "purple" as const },
  { name: "Workshop", color: "blue" as const },
  { name: "Palestra", color: "pink" as const },
  { name: "Evento Social", color: "green" as const },
  { name: "Assembleia", color: "orange" as const },
]

const DEFAULT_LOCATION = "IFBA campus Irece"
const DEFAULT_START_TIME = "14:00"
const DEFAULT_END_TIME = "17:00"

type RegistrationType = "none" | "external" | "internal"

type FormData = {
  title: string
  description: string
  longDescription: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  location: string
  category: string
  categoryColor: EventItem["categoryColor"]
  image: string
  imagePreview: string
  status: EventItem["status"]
  registrationType: RegistrationType
  registrationUrl: string
  registrationEmailSubject: string
  registrationEmailBody: string
  showInCalendar: boolean
  tags: string[]
}

export default function EventsManager() {
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)
  const [uploading, setUploading] = useState(false)

  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split("T")[0]
  }

  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    longDescription: "",
    startDate: getTodayDate(),
    endDate: "",
    startTime: DEFAULT_START_TIME,
    endTime: DEFAULT_END_TIME,
    location: DEFAULT_LOCATION,
    category: "Reunião",
    categoryColor: "purple",
    image: "",
    imagePreview: "",
    status: "confirmed",
    registrationType: "none",
    registrationUrl: "",
    registrationEmailSubject: "Confirmação de Inscrição - {evento}",
    registrationEmailBody: "Olá {nome},\n\nSua inscrição no evento \"{evento}\" foi confirmada!\n\nData: {data}\nHorário: {horario}\nLocal: {local}\n\nAté lá!\nDiretório Acadêmico - IFBA",
    showInCalendar: false,
    tags: [],
  })

  const [availableCourses, setAvailableCourses] = useState<Course[]>([])

  useEffect(() => {
    loadEvents()
    getActiveCourses().then(setAvailableCourses)
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false })

    if (data) {
      setEvents(
        data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description,
          longDescription: e.long_description,
          date: formatDisplayDate(e.event_date),
          time: formatDisplayTime(e.event_time, e.end_time),
          location: e.location,
          category: e.category,
          categoryColor: deriveCategoryColor(e.category),
          image: e.image_url,
          image_url: e.image_url,
          status: e.status === "published" ? "confirmed" : e.status === "draft" ? "pending" : "canceled",
          event_date: e.event_date,
          event_time: e.event_time,
          end_date: e.end_date,
          end_time: e.end_time,
          registration_type: e.registration_type ?? "none",
          registration_url: e.registration_url ?? "",
          registration_email_subject: e.registration_email_subject ?? "",
          registration_email_body: e.registration_email_body ?? "",
        })),
      )
    }
    setLoading(false)
  }

  const deriveCategoryColor = (category?: string) => {
    if (!category) return "purple"
    const c = category.toLowerCase()
    if (c.includes("workshop")) return "blue"
    if (c.includes("palestra")) return "pink"
    if (c.includes("social") || c.includes("festa")) return "green"
    if (c.includes("assembleia")) return "orange"
    return "purple"
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, imagePreview: reader.result as string }))
    }
    reader.readAsDataURL(file)

    setUploading(true)
    const fileExt = file.name.split(".").pop()
    const fileName = `event-${Date.now()}.${fileExt}`
    const filePath = `events/${fileName}`

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file)

    if (uploadError) {
      alert("Erro ao fazer upload: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
    setFormData((prev) => ({ ...prev, image: data.publicUrl }))
    setUploading(false)
  }

  const formatDisplayDate = (date: string) => {
    if (!date) return ""
    const d = new Date(date)
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })
  }

  const formatDisplayTime = (start: string, end: string) => {
    if (!start) return ""
    if (!end) return start
    return `${start} - ${end}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        longDescription: formData.longDescription,
        eventDate: formData.startDate || getTodayDate(),
        endDate: formData.endDate || null,
        startTime: formData.startTime || DEFAULT_START_TIME,
        endTime: formData.endTime || DEFAULT_END_TIME,
        location: formData.location || DEFAULT_LOCATION,
        category: formData.category,
        image: formData.image || formData.imagePreview || undefined,
        status: formData.status,
        registrationType: formData.registrationType,
        registrationUrl: formData.registrationType === "external" ? formData.registrationUrl : undefined,
        registrationEmailSubject: formData.registrationType === "internal" ? formData.registrationEmailSubject : undefined,
        registrationEmailBody: formData.registrationType === "internal" ? formData.registrationEmailBody : undefined,
        tags: formData.tags,
      }

      const savedEvent = editingEvent
        ? await updateEvent(editingEvent.id, payload)
        : await createEvent(payload)

      const eventDate = formData.startDate || getTodayDate()
      const d = new Date(eventDate + "T12:00:00")
      const weekday = d.toLocaleDateString("pt-BR", { weekday: "long" })
      const calendarPayload = {
        title: formData.title,
        date: eventDate,
        weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
        type: "event" as const,
        description: formData.description,
        time: formData.startTime || undefined,
        location: formData.location || undefined,
      }

      try {
        const sourceEventId = editingEvent?.id ?? savedEvent.id
        const { data: linkedBySource } = await supabase
          .from("calendar_events")
          .select("id")
          .eq("source_event_id", sourceEventId)
          .eq("type", "event")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        let calendarEventId = linkedBySource?.id ?? null

        if (!calendarEventId && editingEvent) {
          const { data: linkedLegacy } = await supabase
            .from("calendar_events")
            .select("id")
            .eq("type", "event")
            .eq("title", editingEvent.title)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle()
          if (linkedLegacy?.id) {
            calendarEventId = linkedLegacy.id
            await supabase
              .from("calendar_events")
              .update({ source_event_id: sourceEventId, updated_at: new Date().toISOString() })
              .eq("id", linkedLegacy.id)
          }
        }

        if (calendarEventId) {
          await updateCalendarEvent(calendarEventId, calendarPayload)
        } else if (formData.showInCalendar) {
          await createCalendarEvent({
            ...calendarPayload,
            sourceEventId,
          })
        }
      } catch (calErr) {
        console.error("Erro ao sincronizar evento no calendário:", calErr)
      }

      setIsDialogOpen(false)
      resetForm()
      loadEvents()
    } catch (error) {
      console.error("Erro ao salvar:", error)
      alert("Erro ao salvar evento")
    }
  }

  const handleEdit = (event: EventItem) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      longDescription: event.longDescription,
      startDate: event.event_date || getTodayDate(),
      endDate: event.end_date || "",
      startTime: event.event_time || DEFAULT_START_TIME,
      endTime: event.end_time || DEFAULT_END_TIME,
      location: event.location ?? DEFAULT_LOCATION,
      category: event.category ?? "Reunião",
      categoryColor: event.categoryColor ?? "purple",
      image: event.image_url || "",
      imagePreview: event.image_url || "",
      status: event.status,
      registrationType: (event.registration_type as RegistrationType) || "none",
      registrationUrl: event.registration_url || "",
      registrationEmailSubject: event.registration_email_subject || "Confirmação de Inscrição - {evento}",
      registrationEmailBody: event.registration_email_body || "",
      showInCalendar: false,
      tags: (event as any).tags || [],
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir?")) return
    try {
      await deleteEvent(id)
      loadEvents()
    } catch (error) {
      console.error("Erro ao deletar:", error)
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      description: "",
      longDescription: "",
      startDate: getTodayDate(),
      endDate: "",
      startTime: DEFAULT_START_TIME,
      endTime: DEFAULT_END_TIME,
      location: DEFAULT_LOCATION,
      category: "Reunião",
      categoryColor: "purple",
      image: "",
      imagePreview: "",
      status: "confirmed",
      registrationType: "none",
      registrationUrl: "",
      registrationEmailSubject: "Confirmação de Inscrição - {evento}",
      registrationEmailBody: "Olá {nome},\n\nSua inscrição no evento \"{evento}\" foi confirmada!\n\nData: {data}\nHorário: {horario}\nLocal: {local}\n\nAté lá!\nDiretório Acadêmico - IFBA",
      showInCalendar: false,
      tags: [],
    })
  }

  const toggleTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const toggleEventStatus = async (event: EventItem) => {
    const newStatus = event.status === "confirmed" ? "pending" : "confirmed"
    try {
      await updateEvent(event.id, { status: newStatus })
      loadEvents()
    } catch (error) {
      console.error("Erro ao alterar status:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a]">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Eventos{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">D.A.</span>
            </h1>
            <p className="text-white/50 text-sm">Gerencie todos os eventos de forma simples e rápida</p>
          </div>
          <Button
            onClick={() => {
              resetForm()
              setIsDialogOpen(true)
            }}
            className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/20"
          >
            <Plus className="mr-2" size={18} />
            Criar Evento
          </Button>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Mobile: compact list */}
        <div className="sm:hidden divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.02]">
          {events.map((event) => (
            <div key={event.id} className="flex items-center gap-3 p-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {event.image_url ? (
                  <img src={event.image_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Calendar className="text-white/20" size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="truncate text-sm font-semibold text-white/90">{event.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-white/40 mt-0.5">
                  <span>{formatDisplayDate(event.event_date)}</span>
                  {event.status === "confirmed" ? (
                    <span className="text-green-400/60">Publicado</span>
                  ) : (
                    <span className="text-yellow-400/60">Rascunho</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button size="icon" variant="ghost" className="h-7 w-7 text-white/40" onClick={() => toggleEventStatus(event)}>
                  {event.status === "confirmed" ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-white/40" onClick={() => handleEdit(event)}>
                  <Edit size={14} />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-red-400/60" onClick={() => handleDelete(event.id)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: card grid */}
        <div className="hidden sm:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="group relative overflow-hidden bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07] transition-all duration-300 flex flex-col h-auto"
            >
              <div className="relative w-full h-48 overflow-hidden shrink-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                {event.image_url ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <img
                      src={event.image_url || "/placeholder.svg"}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="text-white/10" size={48} />
                  </div>
                )}
              </div>

              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">{event.title}</h3>
                <p className="text-sm text-white/60 mb-4 line-clamp-2 min-h-[2.5rem]">{event.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-purple-500/10 text-purple-300 text-xs">
                    <Calendar size={12} />
                    {formatDisplayDate(event.event_date)}
                  </span>
                  {event.event_time && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-pink-500/10 text-pink-300 text-xs">
                      <Clock size={12} />
                      {event.event_time}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap sm:flex-nowrap gap-2 mt-auto">
                  <Button
                    size="sm"
                    onClick={() => toggleEventStatus(event)}
                    className={`flex-1 sm:flex-none ${event.status === "confirmed"
                      ? "bg-green-500/10 hover:bg-green-500/20 text-green-400 border-0"
                      : "bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-0"
                      }`}
                    title={event.status === "confirmed" ? "Público — clique para rascunho" : "Rascunho — clique para publicar"}
                  >
                    {event.status === "confirmed" ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <Edit size={14} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    className="flex-1 sm:flex-none bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20 px-4">
            <Calendar className="mx-auto mb-4 text-white/20" size={64} />
            <p className="text-white/40 text-lg">Nenhum evento criado ainda</p>
            <p className="text-white/30 text-sm">Clique em "Criar Evento" para começar</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        {/* AQUI ESTÁ A MÁGICA: sm:max-w-4xl lg:max-w-5xl e overflow-x-hidden para garantir que ele estique e não crie scroll horizontal */}
        <DialogContent className="bg-[#111] border border-white/10 text-white w-[95vw] sm:w-full sm:max-w-4xl lg:max-w-5xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              {editingEvent ? (
                <>
                  <Edit className="text-purple-400" size={24} />
                  Editar Evento
                </>
              ) : (
                <>
                  <Plus className="text-purple-400" size={24} />
                  Novo Evento
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white flex items-center gap-2">
                <Upload size={16} className="text-purple-400" />
                Imagem (Opcional)
              </Label>
              {formData.imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full h-48 sm:h-64 rounded-lg overflow-hidden bg-black/20">
                    <img
                      src={formData.imagePreview || "/placeholder.svg"}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, image: "", imagePreview: "" }))}
                    className="absolute top-3 right-3 p-2 bg-black/80 backdrop-blur rounded-full text-white hover:bg-black transition-all z-10"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/20 rounded-lg cursor-pointer hover:border-purple-500/50 hover:bg-white/5 transition-all">
                  <Upload className="w-8 h-8 text-white/40 mb-2" />
                  <span className="text-sm text-white/60 text-center px-4">Clique ou arraste uma imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
              {uploading && (
                <div className="flex items-center text-white/50 text-sm mt-2">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Enviando imagem...
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna Esquerda: Info Básicas */}
              <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10 h-full">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-blue-400" />
                  <span className="text-sm font-medium text-white/80">Informações Básicas</span>
                </div>

                <div>
                  <Label className="text-sm text-white/70">Título *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    required
                    placeholder="Ex: Assembleia Geral"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm text-white/70">Descrição Curta *</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    required
                    placeholder="Breve descrição..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[70px] mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm text-white/70">Detalhes Completos</Label>
                  <Textarea
                    value={formData.longDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, longDescription: e.target.value }))}
                    placeholder="Informações detalhadas (opcional)..."
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[140px] mt-1"
                  />
                </div>
              </div>

              {/* Coluna Direita: Data, Hora e Local */}
              <div className="flex flex-col gap-6">
                <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar size={16} className="text-purple-400" />
                    <span className="text-sm font-medium text-white">Data e Horário</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-white/70">Data Início *</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                        required
                        className="bg-white/10 border-white/20 text-white mt-1 w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white/70">Data Término</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                        min={formData.startDate}
                        className="bg-white/10 border-white/20 text-white mt-1 w-full"
                      />
                      <p className="text-xs text-white/40 mt-1">Deixe vazio se for 1 dia</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-white/70">Hora Início</Label>
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white mt-1 w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-white/70">Hora Término</Label>
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white mt-1 w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
                  <div>
                    <Label className="text-sm text-white/70 flex items-center gap-2">
                      <MapPin size={14} className="text-green-400" />
                      Local *
                    </Label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                      required
                      placeholder={DEFAULT_LOCATION}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm text-white/70 mb-2 block">Categoria *</Label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORY_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              category: preset.name,
                              categoryColor: preset.color,
                            }))
                          }
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none text-center ${formData.category === preset.name
                            ? "bg-purple-500 text-white shadow-lg shadow-purple-500/25"
                            : "bg-white/10 text-white/60 hover:bg-white/20"
                            }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Status do Evento */}
              <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={16} className="text-green-400" />
                  <span className="text-sm font-medium text-white/80">Visibilidade</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "confirmed" }))}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.status === "confirmed"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
                      }`}
                  >
                    <Eye size={16} /> Público
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, status: "pending" }))}
                    className={`px-3 py-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${formData.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30"
                      : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
                      }`}
                  >
                    <EyeOff size={16} /> Rascunho
                  </button>
                </div>
              </div>

              {/* Inscrição / Registro */}
              <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={16} className="text-emerald-400" />
                  <span className="text-sm font-medium text-white">Inscrição / Registro</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, registrationType: "none" }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex-1 ${formData.registrationType === "none"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                  >
                    Nenhuma
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, registrationType: "external" }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 flex-1 ${formData.registrationType === "external"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                  >
                    <Link2 size={16} /> Link Externo
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, registrationType: "internal" }))}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 flex-1 ${formData.registrationType === "internal"
                      ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                      : "bg-white/10 text-white/60 hover:bg-white/20"
                      }`}
                  >
                    <Mail size={16} /> Email Interno
                  </button>
                </div>

                {formData.registrationType === "external" && (
                  <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                    <Label className="text-sm text-white/70 flex items-center gap-2">
                      <ExternalLink size={14} className="text-blue-400" />
                      URL de Inscrição *
                    </Label>
                    <Input
                      value={formData.registrationUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, registrationUrl: e.target.value }))}
                      placeholder="https://forms.google.com/..."
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mt-1"
                    />
                    <p className="text-xs text-white/40 mt-1">Link do Google Forms, Sympla, etc.</p>
                  </div>
                )}

                {formData.registrationType === "internal" && (
                  <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div>
                      <Label className="text-sm text-white/70 flex items-center gap-2">
                        <Mail size={14} className="text-purple-400" />
                        Assunto do Email
                      </Label>
                      <Input
                        value={formData.registrationEmailSubject}
                        onChange={(e) => setFormData((prev) => ({ ...prev, registrationEmailSubject: e.target.value }))}
                        placeholder="Confirmação de Inscrição - {evento}"
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 mt-1"
                      />
                      <p className="text-xs text-white/40 mt-1">Use {"{evento}"}, {"{data}"}, {"{local}"} como variáveis</p>
                    </div>
                    <div>
                      <Label className="text-sm text-white/70">Corpo do Email (Template)</Label>
                      <Textarea
                        value={formData.registrationEmailBody}
                        onChange={(e) => setFormData((prev) => ({ ...prev, registrationEmailBody: e.target.value }))}
                        placeholder="Olá {nome},\n\nSua inscrição..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[120px] mt-1 font-mono text-sm"
                      />
                      <p className="text-xs text-white/40 mt-1">
                        Variáveis: {"{nome}"}, {"{email}"}, {"{evento}"}, {"{data}"}, {"{horario}"}, {"{local}"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Show in Calendar checkbox */}
            <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 cursor-pointer hover:bg-white/[0.04] transition">
              <input
                type="checkbox"
                checked={formData.showInCalendar}
                onChange={(e) => setFormData((prev) => ({ ...prev, showInCalendar: e.target.checked }))}
                className="h-4 w-4 rounded accent-purple-500"
              />
              <div>
                <span className="text-sm font-medium text-white/80 flex items-center gap-1.5">
                  <Calendar size={14} className="text-purple-400" />
                  Exibir no Calendário Acadêmico
                </span>
                <p className="text-[11px] text-white/35 mt-0.5">Adiciona automaticamente este evento ao calendário</p>
              </div>
            </label>

            {/* Tags - Público-Alvo */}
            <div className="space-y-2">
              <Label className="text-white/70">Público-Alvo (Tags)</Label>
              <div className="flex flex-wrap gap-1.5">
                {["Geral", "Superior", "Integrado"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${formData.tags.includes(tag)
                      ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                      : "border-white/10 text-white/30 hover:border-white/20"
                      }`}
                  >
                    {tag}
                  </button>
                ))}
                {availableCourses.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleTag(c.shortName || c.name)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${formData.tags.includes(c.shortName || c.name)
                      ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                      : "border-white/10 text-white/30 hover:border-white/20"
                      }`}
                  >
                    {c.shortName || c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-white/10">
              <Button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="bg-white/5 hover:bg-white/10 text-white border-white/10 w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/20 w-full sm:w-auto"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Salvando...
                  </>
                ) : (
                  <>{editingEvent ? "Atualizar Evento" : "Criar Evento"}</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
