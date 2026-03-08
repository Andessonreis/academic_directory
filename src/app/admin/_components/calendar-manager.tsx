"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  Calendar,
  Download,
  Upload,
  Eye,
  EyeOff,
  ChevronDown,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  getCalendarCourses,
  createCalendarCourse,
  updateCalendarCourse,
  deleteCalendarCourse,
  getSemesterConfig,
  saveSemesterConfig,
} from "@/services/calendar-service"
import { getActiveCourses } from "@/services/course-service"
import { supabase } from "@/lib/supabase/client"
import type { CalendarCourse, CalendarEvent, Course } from "@/types/event"
import { cn } from "@/lib/utils"

const STORAGE_BUCKET = "uploads"

const EVENT_TYPES = [
  { value: "event", label: "Evento", dot: "bg-emerald-400" },
  //{ value: "deadline", label: "Prazo", dot: "bg-amber-400" },
  { value: "holiday", label: "Feriado", dot: "bg-red-400" },
  { value: "academic", label: "Marco Acadêmico", dot: "bg-blue-400" },
]

type Tab = "dates" | "pdfs"

const EMPTY_FORM: Omit<CalendarEvent, "id" | "createdAt" | "updatedAt"> = {
  title: "",
  date: "",
  endDate: "",
  weekday: "",
  type: "event",
  description: "",
  time: "",
  location: "",
  tags: [],
  isDayOff: false,
  isSchoolDay: false,
}

export default function CalendarManager() {
  const [tab, setTab] = useState<Tab>("dates")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])

  // PDF / course state
  const [courses, setCourses] = useState<CalendarCourse[]>([])
  const [isCourseDialogOpen, setIsCourseDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<CalendarCourse | null>(null)
  const [courseForm, setCourseForm] = useState({
    name: "",
    pdfUrl: "",
    isActive: true,
    isDefault: false,
  })
  const [courseFile, setCourseFile] = useState<File | null>(null)
  const [semesterStart, setSemesterStart] = useState("")
  const [semesterEnd, setSemesterEnd] = useState("")
  const [savingSemester, setSavingSemester] = useState(false)

  useEffect(() => {
    loadAll()
  }, [])

  async function loadAll() {
    setLoading(true)
    const [evts, crsList, courseList, semConfig] = await Promise.all([
      getCalendarEvents(),
      getCalendarCourses(),
      getActiveCourses(),
      getSemesterConfig(),
    ])
    setEvents(evts)
    setCourses(crsList)
    setAvailableCourses(courseList)
    if (semConfig) {
      setSemesterStart(semConfig.date || "")
      setSemesterEnd(semConfig.endDate || "")
    }
    setLoading(false)
  }

  // ─── Date events ───
  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingEvent(null)
  }

  function openEdit(event: CalendarEvent) {
    setEditingEvent(event)
    setForm({
      title: event.title,
      date: event.date,
      endDate: event.endDate || "",
      weekday: event.weekday || "",
      type: event.type,
      description: event.description || "",
      time: event.time || "",
      location: event.location || "",
      tags: event.tags || [],
      isDayOff: event.isDayOff || false,
      isSchoolDay: event.isSchoolDay || false,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      // Auto-compute weekday from date
      const dateObj = new Date(form.date + "T12:00:00")
      const wd = dateObj.toLocaleDateString("pt-BR", { weekday: "long" })
      const weekday = wd.charAt(0).toUpperCase() + wd.slice(1)
      const payload = { ...form, weekday }

      if (editingEvent) {
        await updateCalendarEvent(editingEvent.id, payload)
      } else {
        await createCalendarEvent(payload)
      }
      setIsDialogOpen(false)
      resetForm()
      loadAll()
    } catch (error) {
      console.error("Erro ao salvar:", error)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta data?")) return
    try {
      await deleteCalendarEvent(id)
      loadAll()
    } catch (error) {
      console.error("Erro ao deletar:", error)
    }
  }

  function toggleTag(tag: string) {
    setForm((prev) => {
      const tags = prev.tags || []
      return {
        ...prev,
        tags: tags.includes(tag)
          ? tags.filter((t) => t !== tag)
          : [...tags, tag],
      }
    })
  }

  // ─── Course PDFs ───
  function resetCourseForm() {
    setEditingCourse(null)
    setCourseForm({ name: "", pdfUrl: "", isActive: true, isDefault: false })
    setCourseFile(null)
  }

  function openEditCourse(course: CalendarCourse) {
    setEditingCourse(course)
    setCourseForm({
      name: course.name,
      pdfUrl: course.pdfUrl,
      isActive: course.isActive,
      isDefault: course.isDefault ?? false,
    })
    setIsCourseDialogOpen(true)
  }

  async function handleCourseSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      let finalPdfUrl = courseForm.pdfUrl
      if (courseFile) {
        const safe = `${Date.now()}-${courseForm.name.replace(/[^a-zA-Z0-9-_]+/g, "-").toLowerCase()}.pdf`
        const path = `calendario/${safe}`
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(path, courseFile, { contentType: "application/pdf", upsert: true })
        if (upErr) throw upErr
        const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)
        finalPdfUrl = data.publicUrl
      }

      if (editingCourse) {
        await updateCalendarCourse(editingCourse.id, { ...courseForm, pdfUrl: finalPdfUrl })
      } else {
        await createCalendarCourse({ ...courseForm, pdfUrl: finalPdfUrl })
      }
      setIsCourseDialogOpen(false)
      resetCourseForm()
      loadAll()
    } catch (error) {
      console.error("Erro ao salvar calendário de curso:", error)
    }
  }

  async function handleDeleteCourse(id: string) {
    if (!confirm("Excluir este calendário de curso?")) return
    try {
      await deleteCalendarCourse(id)
      loadAll()
    } catch (error) {
      console.error("Erro ao deletar:", error)
    }
  }

  // ─── Filters ───
  const filtered = events.filter((ev) => {
    if (ev.type === "semester") return false
    const matchType = filterType === "all" || ev.type === filterType
    const q = search.trim().toLowerCase()
    const matchSearch =
      !q ||
      ev.title.toLowerCase().includes(q) ||
      (ev.description || "").toLowerCase().includes(q)
    return matchType && matchSearch
  })

  // Sort by date
  const sorted = [...filtered].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Group by month
  const grouped: { label: string; events: CalendarEvent[] }[] = []
  const seenMonth: Record<string, number> = {}
  for (const ev of sorted) {
    const d = new Date(ev.date + "T12:00:00")
    const key = `${d.getFullYear()}-${d.getMonth()}`
    const monthLabel = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
    const label = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)
    if (seenMonth[key] === undefined) {
      seenMonth[key] = grouped.length
      grouped.push({ label, events: [] })
    }
    grouped[seenMonth[key]].events.push(ev)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-emerald-500" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 rounded-xl border border-white/[0.08] bg-white/[0.02] p-1">
        <button
          onClick={() => setTab("dates")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
            tab === "dates"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70"
          )}
        >
          <Calendar size={14} className="inline mr-1.5 -mt-0.5" />
          Datas & Eventos
        </button>
        <button
          onClick={() => setTab("pdfs")}
          className={cn(
            "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition",
            tab === "pdfs"
              ? "bg-white/10 text-white"
              : "text-white/40 hover:text-white/70"
          )}
        >
          <Download size={14} className="inline mr-1.5 -mt-0.5" />
          PDFs por Curso
        </button>
      </div>

      {/* ═══════════ DATES TAB ═══════════ */}
      {tab === "dates" && (
        <>
          {/* Header */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-white">
              Calendário Acadêmico
            </h2>
            <Button
              size="sm"
              onClick={() => {
                resetForm()
                setIsDialogOpen(true)
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={16} className="mr-1.5" />
              Nova Data
            </Button>
          </div>

          {/* Semester Config */}
          <Card className="rounded-xl border border-blue-500/10 bg-blue-500/[0.02] p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-blue-400/70" />
              <h3 className="text-sm font-bold text-white/80">Período Letivo</h3>
            </div>
            <p className="text-[10px] text-white/25 mb-3">
              Define o semestre e gera automaticamente os dias letivos (seg–sex, exceto feriados). Para editar um dia específico, crie uma data com tipo &quot;Marco Acadêmico&quot;.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] text-white/30">Início</Label>
                <Input
                  type="date"
                  value={semesterStart}
                  onChange={(e) => setSemesterStart(e.target.value)}
                  className="bg-white/5 border-white/10 h-9 text-sm text-white/80"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] text-white/30">Fim</Label>
                <Input
                  type="date"
                  value={semesterEnd}
                  onChange={(e) => setSemesterEnd(e.target.value)}
                  className="bg-white/5 border-white/10 h-9 text-sm text-white/80"
                />
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <p className="text-[10px] text-white/20">
                {semesterStart && semesterEnd
                  ? `${semesterStart.split("-").reverse().join("/")} — ${semesterEnd.split("-").reverse().join("/")}`
                  : "Configure as datas para gerar o calendário"}
              </p>
              <Button
                size="sm"
                disabled={!semesterStart || !semesterEnd || savingSemester}
                onClick={async () => {
                  setSavingSemester(true)
                  try {
                    await saveSemesterConfig(semesterStart, semesterEnd)
                    loadAll()
                  } catch (err: unknown) {
                    const msg = err instanceof Error ? err.message : JSON.stringify(err)
                    console.error("Erro ao salvar período:", msg)
                    alert(`Erro ao salvar período letivo: ${msg}`)
                  } finally {
                    setSavingSemester(false)
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-xs"
              >
                {savingSemester ? <Loader2 size={14} className="animate-spin" /> : "Salvar Período"}
              </Button>
            </div>
          </Card>

          {/* Search + type filter */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar…"
                className="pl-9 h-9 text-sm bg-white/[0.03] border-white/[0.08]"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              <button
                onClick={() => setFilterType("all")}
                className={cn(
                  "shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition",
                  filterType === "all"
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                )}
              >
                Todos
              </button>
              {EVENT_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setFilterType(t.value)}
                  className={cn(
                    "shrink-0 flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-medium transition",
                    filterType === t.value
                      ? "bg-white/10 text-white"
                      : "text-white/30 hover:text-white/60"
                  )}
                >
                  <span className={cn("h-1.5 w-1.5 rounded-full", t.dot)} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Grouped list */}
          {sorted.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/30">
              Nenhuma data cadastrada.
            </div>
          ) : (
            <div className="space-y-5">
              {grouped.map((g) => (
                <div key={g.label}>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/25">
                    {g.label}
                  </p>
                  <div className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    {g.events.map((ev) => {
                      const typeCfg =
                        EVENT_TYPES.find((t) => t.value === ev.type) ??
                        EVENT_TYPES[0]
                      const d = new Date(ev.date + "T12:00:00")
                      const dayStr = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
                      const endStr = ev.endDate
                        ? ` → ${new Date(ev.endDate + "T12:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })}`
                        : ""
                      return (
                        <div
                          key={ev.id}
                          className="flex items-center gap-3 px-3 py-2.5 sm:px-4"
                        >
                          <span className="w-12 text-center text-[11px] font-mono text-white/30 tabular-nums">
                            {dayStr}
                          </span>
                          <span
                            className={cn(
                              "h-2 w-2 rounded-full shrink-0",
                              typeCfg.dot
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white/85 truncate">
                                {ev.title}
                              </span>
                              {endStr && (
                                <span className="text-[10px] text-white/25">
                                  {endStr}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-white/30">
                                {typeCfg.label}
                              </span>
                              {(ev.tags || []).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/[0.05] text-white/30"
                                >
                                  {tag}
                                </span>
                              ))}
                              {ev.isDayOff && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-400/60">
                                  Não letivo
                                </span>
                              )}
                              {ev.isSchoolDay && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/60">
                                  Dia letivo
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => openEdit(ev)}
                            >
                              <Edit size={14} className="text-white/40" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-red-400/60 hover:text-red-400"
                              onClick={() => handleDelete(ev.id)}
                            >
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Event dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-[#0a0a0a] border-white/15 text-white max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEvent ? "Editar Data" : "Nova Data"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Título *</Label>
                  <Input
                    required
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Ex: Início do Semestre 2026.1"
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Data Início *</Label>
                    <Input
                      required
                      type="date"
                      value={form.date}
                      onChange={(e) =>
                        setForm({ ...form, date: e.target.value })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Data Fim (opcional)</Label>
                    <Input
                      type="date"
                      value={form.endDate || ""}
                      onChange={(e) =>
                        setForm({ ...form, endDate: e.target.value })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Tipo *</Label>

                    <Select
                      value={form.type}
                      onValueChange={(v) =>
                        setForm({ ...form, type: v })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10 ">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent className="bg-[#111] border-white/10 text-white">
                        {EVENT_TYPES.map((t) => (
                          <SelectItem
                            key={t.value}
                            value={t.value}
                            className="text-white focus:text-white"
                          >
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label>Horário (opcional)</Label>
                    <Input
                      type="time"
                      value={form.time || ""}
                      onChange={(e) =>
                        setForm({ ...form, time: e.target.value })
                      }
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Descrição</Label>
                  <Textarea
                    value={form.description || ""}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={2}
                    className="bg-white/5 border-white/10"
                    placeholder="Descrição breve..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Local (opcional)</Label>
                  <Input
                    value={form.location || ""}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    className="bg-white/5 border-white/10"
                    placeholder="Campus Irecê"
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label>Público-Alvo (Tags)</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {["Geral", "Superior", "Integrado"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                          (form.tags || []).includes(tag)
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : "border-white/10 text-white/30 hover:border-white/20"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                    {availableCourses.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleTag(c.shortName || c.name)}
                        className={cn(
                          "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                          (form.tags || []).includes(c.shortName || c.name)
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : "border-white/10 text-white/30 hover:border-white/20"
                        )}
                      >
                        {c.shortName || c.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Day status */}
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isDayOff || false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isDayOff: e.target.checked,
                          isSchoolDay: e.target.checked
                            ? false
                            : form.isSchoolDay,
                        })
                      }
                      className="accent-red-500"
                    />
                    Dia não letivo
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isSchoolDay || false}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          isSchoolDay: e.target.checked,
                          isDayOff: e.target.checked
                            ? false
                            : form.isDayOff,
                        })
                      }
                      className="accent-emerald-500"
                    />
                    Dia letivo (sábado/especial)
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="text-gray-900"

                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editingEvent ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}

      {/* ═══════════ PDFs TAB ═══════════ */}
      {tab === "pdfs" && (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-lg font-bold text-white">
              Calendários por Curso (PDF)
            </h2>
            <Button
              size="sm"
              onClick={() => {
                resetCourseForm()
                setIsCourseDialogOpen(true)
              }}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={16} className="mr-1.5" />
              Novo PDF
            </Button>
          </div>

          {courses.length === 0 ? (
            <div className="py-12 text-center text-sm text-white/30">
              Nenhum calendário de curso cadastrado.
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.08] bg-white/[0.02]">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-3 px-3 py-3 sm:px-4"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 shrink-0">
                    <Download size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white/85">
                        {course.name}
                      </span>
                      {course.isDefault && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400/70 border border-emerald-500/20">
                          Geral
                        </span>
                      )}
                      {!course.isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/30">
                          Inativo
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-white/25 truncate mt-0.5">
                      {course.pdfUrl || "Sem PDF"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {course.pdfUrl && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => window.open(course.pdfUrl, "_blank")}
                        title="Abrir PDF"
                      >
                        <Eye size={14} className="text-white/40" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7"
                      onClick={() => openEditCourse(course)}
                    >
                      <Edit size={14} className="text-white/40" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-red-400/60 hover:text-red-400"
                      onClick={() => handleDeleteCourse(course.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Course PDF dialog */}
          <Dialog
            open={isCourseDialogOpen}
            onOpenChange={setIsCourseDialogOpen}
          >
            <DialogContent className="bg-[#0a0a0a] border-white/15 text-white max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingCourse
                    ? "Editar Calendário de Curso"
                    : "Novo Calendário de Curso"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCourseSubmit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Curso *</Label>
                  {availableCourses.length > 0 ? (
                    <Select
                      value={courseForm.name}
                      onValueChange={(v) =>
                        setCourseForm({ ...courseForm, name: v })
                      }
                    >
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Selecione um curso…" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111] border-white/10 text-white">
                        {availableCourses.map((c) => (
                          <SelectItem
                            key={c.id}
                            value={c.shortName ? `${c.shortName} - ${c.name}` : c.name}
                            className="text-white focus:text-white"
                          >
                            {c.shortName ? `${c.shortName} - ${c.name}` : c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      required
                      value={courseForm.name}
                      onChange={(e) =>
                        setCourseForm({ ...courseForm, name: e.target.value })
                      }
                      placeholder="Ex: ADS - Análise e Desenvolvimento de Sistemas"
                      className="bg-white/5 border-white/10"
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>URL do PDF</Label>
                    <Input
                      value={courseForm.pdfUrl}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          pdfUrl: e.target.value,
                        })
                      }
                      placeholder="https://..."
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Upload PDF</Label>
                    <Input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) =>
                        setCourseFile(e.target.files?.[0] ?? null)
                      }
                      className="bg-white/5 border-white/10 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:bg-white/10 file:text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseForm.isActive}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          isActive: e.target.checked,
                        })
                      }
                      className="accent-emerald-500"
                    />
                    Ativo
                  </label>
                  <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={courseForm.isDefault}
                      onChange={(e) =>
                        setCourseForm({
                          ...courseForm,
                          isDefault: e.target.checked,
                        })
                      }
                      className="accent-emerald-500"
                    />
                    PDF Geral (padrão)
                  </label>
                </div>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCourseDialogOpen(false)}
                    className="text-gray-900"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {editingCourse ? "Salvar" : "Criar"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
