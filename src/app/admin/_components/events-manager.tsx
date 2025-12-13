"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2, Upload, X, Calendar, Clock, MapPin, FileText } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createEvent, updateEvent, deleteEvent } from "@/services/event-service"
import { supabase } from "@/lib/supabase/client"
import type { EventItem } from "@/types/event"

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
    startTime: DEFAULT_START_TIME, // Horário padrão
    endTime: DEFAULT_END_TIME, // Horário padrão
    location: DEFAULT_LOCATION, // Local padrão
    category: "Reunião",
    categoryColor: "purple",
    image: "",
    imagePreview: "",
    status: "confirmed",
  })

  useEffect(() => {
    loadEvents()
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

    const { error: uploadError } = await supabase.storage.from("Files").upload(filePath, file)

    if (uploadError) {
      alert("Erro ao fazer upload: " + uploadError.message)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from("Files").getPublicUrl(filePath)
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
        startTime: formData.startTime || DEFAULT_START_TIME, // Usa padrão se vazio
        endTime: formData.endTime || DEFAULT_END_TIME, // Usa padrão se vazio
        location: formData.location || DEFAULT_LOCATION, // Usa padrão se vazio
        category: formData.category,
        image: formData.image || formData.imagePreview || undefined,
        status: formData.status,
      }

      if (editingEvent) {
        await updateEvent(editingEvent.id, payload)
      } else {
        await createEvent(payload)
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
      startTime: DEFAULT_START_TIME, // Reset com padrão
      endTime: DEFAULT_END_TIME, // Reset com padrão
      location: DEFAULT_LOCATION, // Reset com padrão
      category: "Reunião",
      categoryColor: "purple",
      image: "",
      imagePreview: "",
      status: "confirmed",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={40} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#050505] to-[#0a0a0a] p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
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
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/20"
          >
            <Plus className="mr-2" size={18} />
            Criar Evento
          </Button>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              // ALTERAÇÃO: Removendo altura fixa 'h-[440px]' para deixar o card mais flexível.
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
                {/* Mantenha line-clamp para controle de altura vertical do texto */}
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 min-h-[3.5rem]">{event.title}</h3>
                <p className="text-sm text-white/60 mb-4 line-clamp-2 min-h-[2.5rem]">{event.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
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

                <div className="flex gap-2 mt-auto">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(event)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white border-0"
                  >
                    <Edit size={14} className="mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleDelete(event.id)}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border-0"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {events.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="mx-auto mb-4 text-white/20" size={64} />
            <p className="text-white/40 text-lg">Nenhum evento criado ainda</p>
            <p className="text-white/30 text-sm">Clique em "Criar Evento" para começar</p>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#111] border border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
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

          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white flex items-center gap-2">
                <Upload size={16} className="text-purple-400" />
                Imagem (Opcional)
              </Label>
              {formData.imagePreview ? (
                <div className="relative group">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-black/20">
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
                  <span className="text-sm text-white/60">Clique ou arraste uma imagem</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              )}
              {/* Indicador de upload enquanto espera */}
              {uploading && (
                <div className="flex items-center text-white/50 text-sm mt-2">
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Enviando imagem...
                </div>
              )}
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
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
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px] mt-1"
                />
              </div>
            </div>

            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-purple-400" />
                <span className="text-sm font-medium text-white">Data e Horário</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-white/70">Data Início *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm text-white/70">Data Término</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                    min={formData.startDate}
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                  <p className="text-xs text-white/40 mt-1">Deixe vazio se for evento de 1 dia</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm text-white/70">Hora Início</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                  <p className="text-xs text-white/40 mt-1">Padrão: {DEFAULT_START_TIME}</p>
                </div>

                <div>
                  <Label className="text-sm text-white/70">Hora Término</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white mt-1"
                  />
                  <p className="text-xs text-white/40 mt-1">Padrão: {DEFAULT_END_TIME}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
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
                <p className="text-xs text-white/40 mt-1">Padrão: {DEFAULT_LOCATION}</p>
              </div>

              <div>
                <Label className="text-sm text-white/70 mb-2 block">Categoria *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORY_PRESETS.slice(0, 3).map((preset) => (
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
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${formData.category === preset.name
                        ? "bg-purple-500 text-white scale-105"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {CATEGORY_PRESETS.slice(3).map((preset) => (
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
                      className={`px-2 py-2 rounded-lg text-xs font-medium transition-all ${formData.category === preset.name
                        ? "bg-purple-500 text-white scale-105"
                        : "bg-white/10 text-white/60 hover:bg-white/20"
                        }`}
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <Button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false)
                  resetForm()
                }}
                className="bg-white/5 hover:bg-white/10 text-white border-white/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={uploading}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={16} />
                    Salvando...
                  </>
                ) : (
                  <>{editingEvent ? "Atualizar" : "Criar Evento"}</>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
