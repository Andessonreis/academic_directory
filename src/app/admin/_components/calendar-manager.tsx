"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarCourses,
  createCalendarCourse,
  updateCalendarCourse,
  deleteCalendarCourse,
} from "@/services/calendar-service"
import { supabase } from "@/lib/supabase/client"
import type { CalendarCourse, CalendarEvent } from "@/types/event"

export default function CalendarManager() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [courses, setCourses] = useState<CalendarCourse[]>([])
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CalendarCourse | null>(null)

  const [formData, setFormData] = useState<Pick<CalendarEvent, "title" | "date" | "weekday" | "type" | "description" | "time" | "location">>({
    title: "",
    date: "",
    weekday: "",
    type: "event",
    description: "",
    time: "",
    location: "",
  })

  const [courseForm, setCourseForm] = useState<Pick<CalendarCourse, "name" | "pdfUrl" | "isActive" | "isDefault">>({
    name: "",
    pdfUrl: "",
    isActive: true,
    isDefault: false,
  })
  const [courseFile, setCourseFile] = useState<File | null>(null)

  useEffect(() => {
    loadEvents()
    loadCourses()
  }, [])

  const loadEvents = async () => {
    setLoading(true)
    const { data } = await supabase.from("calendar_events").select("*").order("date")
    if (data) {
      setEvents(
        data.map((e: { id: any; title: any; date: any; weekday: any; type: any; description: any; time: any; location: any }) => ({
          id: e.id,
          title: e.title,
          date: e.date,
          weekday: e.weekday,
          type: e.type,
          description: e.description,
          time: e.time,
          location: e.location,
        })),
      )
    }
    setLoading(false)
  }

  const loadCourses = async () => {
    const list = await getCalendarCourses()
    setCourses(list)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEvent) {
        await updateCalendarEvent(editingEvent.id, formData)
      } else {
        await createCalendarEvent(formData)
      }
      setIsDialogOpen(false)
      resetForm()
      loadEvents()
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      alert("Erro ao salvar evento")
    }
  }

  const handleCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Se houver arquivo, faz upload para o Storage e usa a URL pública
      let finalPdfUrl = courseForm.pdfUrl
      if (courseFile) {
        const fileNameSafe = `${Date.now()}-${courseForm.name.replace(/[^a-zA-Z0-9-_]+/g, "-").toLowerCase()}.pdf`
        const storage = supabase.storage.from("Files")
        const filePath = `calendario/${fileNameSafe}`
        const { error: uploadError } = await storage.upload(filePath, courseFile, {
          contentType: "application/pdf",
          upsert: true,
        })
        if (uploadError) throw uploadError

        const { data: publicData } = storage.getPublicUrl(filePath)
        finalPdfUrl = publicData.publicUrl
      }

      if (editingCourse) {
        await updateCalendarCourse(editingCourse.id, { ...courseForm, pdfUrl: finalPdfUrl })
      } else {
        await createCalendarCourse({ ...courseForm, pdfUrl: finalPdfUrl })
      }
      setIsCourseDialogOpen(false)
      resetCourseForm()
      loadCourses()
    } catch (error) {
      console.error("Erro ao salvar calendário de curso:", error)
      alert("Erro ao salvar calendário de curso")
    }
  }

  const handleEdit = (event: CalendarEvent) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      date: event.date,
      weekday: event.weekday,
      type: event.type,
      description: event.description,
      time: event.time || "",
      location: event.location || "",
    })
    setIsDialogOpen(true)
  }

  const handleEditCourse = (course: CalendarCourse) => {
    setEditingCourse(course)
    setCourseForm({
      name: course.name,
      pdfUrl: course.pdfUrl,
      isActive: course.isActive,
      isDefault: course.isDefault ?? false,
    })
    setIsCourseDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return
    try {
      await deleteCalendarEvent(id)
      loadEvents()
    } catch (error) {
      console.error("Erro ao deletar evento:", error)
      alert("Erro ao deletar evento")
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este calendário de curso?")) return
    try {
      await deleteCalendarCourse(id)
      loadCourses()
    } catch (error) {
      console.error("Erro ao deletar calendário de curso:", error)
      alert("Erro ao deletar calendário de curso")
    }
  }

  const resetForm = () => {
    setEditingEvent(null)
    setFormData({
      title: "",
      date: "",
      weekday: "",
      type: "event",
      description: "",
      time: "",
      location: "",
    })
  }

  const resetCourseForm = () => {
    setEditingCourse(null)
    setCourseForm({
      name: "",
      pdfUrl: "",
      isActive: true,
      isDefault: false,
    })
    setCourseFile(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-green-500" size={40} />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Gerenciar Calendário Acadêmico</h2>
        <Button
          onClick={() => {
            resetForm()
            setIsDialogOpen(true)
          }}
          className="bg-green-500 hover:bg-green-600"
        >
          <Plus className="mr-2" size={18} />
          Novo Evento
        </Button>
      </div>

      <div className="space-y-3">
        {events.map((event) => (
          <Card key={event.id} className="p-4 bg-white/5 border-white/10 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">{event.title}</h3>
              <p className="text-sm text-white/60">
                {event.date} • {event.weekday} • {event.type === "deadline" ? "Prazo" : "Evento"}
              </p>
              <p className="text-sm text-white/50 mt-1">{event.description}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(event)}>
                <Edit size={14} />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(event.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Cursos / PDFs */}
      <div className="flex justify-between items-center mt-10 mb-4">
        <h3 className="text-xl font-semibold text-white">Calendários por Curso (PDF)</h3>
        <Button
          onClick={() => {
            resetCourseForm()
            setIsCourseDialogOpen(true)
          }}
          className="bg-emerald-500 hover:bg-emerald-600"
        >
          <Plus className="mr-2" size={18} /> Novo Calendário de Curso
        </Button>
      </div>

      <div className="space-y-3">
        {courses.map((course) => (
          <Card key={course.id} className="p-4 bg-white/5 border-white/10 flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-white">{course.name}</h4>
                {course.isDefault && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-500/30">
                    Geral
                  </span>
                )}
                {!course.isActive && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 text-white/60 border border-white/20">
                    Inativo
                  </span>
                )}
              </div>
              <p className="text-sm text-white/60 break-words mt-1">{course.pdfUrl}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEditCourse(course)}>
                <Edit size={14} />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDeleteCourse(course.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          </Card>
        ))}
        {courses.length === 0 && <p className="text-sm text-white/50">Nenhum calendário de curso cadastrado.</p>}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/15 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? "Editar Evento" : "Novo Evento"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                required
                className="bg-white/5 border-white/10 text-white"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Data (ex: 10 Dez)</Label>
                <Input
                  value={formData.date}
                  onChange={(e) => setFormData((prev) => ({ ...prev, date: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="10 Dez"
                />
              </div>
              <div>
                <Label>Dia da Semana</Label>
                <Input
                  value={formData.weekday}
                  onChange={(e) => setFormData((prev) => ({ ...prev, weekday: e.target.value }))}
                  required
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Segunda"
                />
              </div>
              <div>
                <Label>Tipo</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111] border-white/10">
                    <SelectItem value="event">Evento</SelectItem>
                    <SelectItem value="deadline">Prazo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Descrição</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
                className="bg-white/5 border-white/10 text-white"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Horário (opcional)</Label>
                <Input
                  value={formData.time}
                  onChange={(e) => setFormData((prev) => ({ ...prev, time: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="14:30"
                />
              </div>
              <div>
                <Label>Local (opcional)</Label>
                <Input
                  value={formData.location}
                  onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                  className="bg-white/5 border-white/10 text-white"
                  placeholder="Sala 105"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-green-500 hover:bg-green-600">
                {editingEvent ? "Atualizar" : "Criar"} Evento
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCourseDialogOpen} onOpenChange={setIsCourseDialogOpen}>
        <DialogContent className="bg-[#0a0a0a] border-white/15 text-white max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingCourse ? "Editar calendário de curso" : "Novo calendário de curso"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCourseSubmit} className="space-y-4">
            <div>
              <Label>Nome do Curso</Label>
              <Input
                value={courseForm.name}
                onChange={(e) => setCourseForm((prev) => ({ ...prev, name: e.target.value }))}
                required
                className="bg-white/5 border-white/15 text-white"
                placeholder="Ex: Engenharia de Computação"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>URL do PDF (opcional)</Label>
                <Input
                  value={courseForm.pdfUrl}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, pdfUrl: e.target.value }))}
                  className="bg-white/5 border-white/15 text-white"
                  placeholder="https://.../calendario.pdf"
                />
              </div>
              <div>
                <Label>Upload de PDF (opcional)</Label>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setCourseFile(e.target.files?.[0] ?? null)}
                  className="bg-white/5 border-white/15 text-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:bg-white/10 file:text-white"
                />
                <p className="text-xs text-white/40 mt-1">Você pode informar uma URL ou enviar um arquivo PDF.</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={courseForm.isActive}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, isActive: e.target.checked }))}
                />
                Ativo
              </label>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={courseForm.isDefault}
                  onChange={(e) => setCourseForm((prev) => ({ ...prev, isDefault: e.target.checked }))}
                />
                Marcar como padrão (PDF geral)
              </label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsCourseDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600">
                {editingCourse ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
