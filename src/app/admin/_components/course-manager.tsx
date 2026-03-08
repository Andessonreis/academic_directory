"use client"

import { useState, useEffect } from "react"
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  LEVEL_LABELS,
} from "@/services/course-service"
import type { Course, CourseLevel } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  GraduationCap,
  BookOpen,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"

const LEVELS: { value: CourseLevel; label: string; color: string }[] = [
  { value: "superior", label: "Superior", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  { value: "integrado", label: "Integrado", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { value: "subsequente", label: "Subsequente", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { value: "pos-graduacao", label: "Pós-Graduação", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
]

const EMPTY_FORM = {
  name: "",
  shortName: "",
  level: "superior" as CourseLevel,
  isActive: true,
  displayOrder: 0,
}

export default function CourseManager() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterLevel, setFilterLevel] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    setLoading(true)
    const data = await getCourses()
    setCourses(data)
    setLoading(false)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingCourse(null)
  }

  function openEdit(course: Course) {
    setEditingCourse(course)
    setForm({
      name: course.name,
      shortName: course.shortName || "",
      level: course.level,
      isActive: course.isActive,
      displayOrder: course.displayOrder,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingCourse) {
        await updateCourse(editingCourse.id, form)
      } else {
        await createCourse(form)
      }
      await loadCourses()
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Erro ao salvar curso:", err)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este curso?")) return
    try {
      await deleteCourse(id)
      await loadCourses()
    } catch (err) {
      console.error("Erro ao excluir curso:", err)
    }
  }

  async function handleToggleActive(course: Course) {
    try {
      await updateCourse(course.id, { isActive: !course.isActive })
      await loadCourses()
    } catch (err) {
      console.error("Erro ao alternar status:", err)
    }
  }

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.shortName || "").toLowerCase().includes(search.toLowerCase())
    const matchLevel = filterLevel === "all" || c.level === filterLevel
    return matchSearch && matchLevel
  })

  // Group by level
  const grouped = LEVELS.map((lvl) => ({
    ...lvl,
    courses: filtered.filter((c) => c.level === lvl.value),
  })).filter((g) => g.courses.length > 0)

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GraduationCap size={20} className="text-blue-400" />
            Cursos & Níveis
          </h2>
          <p className="text-sm text-white/40 mt-1">{courses.length} cursos cadastrados</p>
        </div>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="sm"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
              onClick={resetForm}
            >
              <Plus size={16} className="mr-1.5" />
              Novo Curso
            </Button>
          </DialogTrigger>

          <DialogContent className="bg-[#0a0a0a] border-white/15 text-white max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? "Editar Curso" : "Novo Curso"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label>Nome do Curso *</Label>
                <Input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Análise e Desenvolvimento de Sistemas"
                  className="bg-white/5 border-white/10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Sigla</Label>
                  <Input
                    value={form.shortName}
                    onChange={(e) =>
                      setForm({ ...form, shortName: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: ADS"
                    className="bg-white/5 border-white/10"
                    maxLength={10}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Nível *</Label>
                  <Select
                    value={form.level}
                    onValueChange={(v) =>
                      setForm({ ...form, level: v as CourseLevel })
                    }
                  >
                    <SelectTrigger className="bg-white/5 border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#111] border-white/10">
                      {LEVELS.map((lvl) => (
                        <SelectItem key={lvl.value} value={lvl.value}>
                          {lvl.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ordem de exibição</Label>
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        displayOrder: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="bg-white/5 border-white/10"
                  />
                </div>
                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 text-sm cursor-pointer text-white/70">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm({ ...form, isActive: e.target.checked })
                      }
                      className="rounded accent-blue-500"
                    />
                    Ativo
                  </label>
                </div>
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
                <Button type="submit" className="bg-blue-600  hover:bg-blue-700">
                  {editingCourse ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search + level filter */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar curso…"
            className="pl-9 h-9 text-sm bg-white/[0.03] border-white/[0.08]"
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setFilterLevel("all")}
            className={cn(
              "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition",
              filterLevel === "all"
                ? "bg-white/10 text-white"
                : "text-white/30 hover:text-white/60"
            )}
          >
            Todos
          </button>
          {LEVELS.map((lvl) => (
            <button
              key={lvl.value}
              onClick={() => setFilterLevel(lvl.value)}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-[11px] font-medium transition",
                filterLevel === lvl.value
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped list */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
          <BookOpen className="mx-auto mb-3 text-white/15" size={32} />
          <p className="text-sm text-white/30">Nenhum curso encontrado</p>
        </div>
      ) : (
        <div className="space-y-5">
          {grouped.map((group) => (
            <div key={group.value}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                    group.color
                  )}
                >
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-white/[0.05]" />
                <span className="text-[10px] text-white/20 tabular-nums">
                  {group.courses.length}
                </span>
              </div>

              <div className="divide-y divide-white/[0.05] rounded-xl border border-white/[0.08] bg-white/[0.02]">
                {group.courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 px-3 py-2.5 sm:px-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-sm font-medium",
                            !course.isActive && "line-through text-white/30"
                          )}
                        >
                          {course.name}
                        </span>
                        {course.shortName && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.06] text-white/35 font-mono">
                            {course.shortName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => handleToggleActive(course)}
                        title={course.isActive ? "Desativar" : "Ativar"}
                      >
                        {course.isActive ? (
                          <Eye size={14} className="text-white/40" />
                        ) : (
                          <EyeOff size={14} className="text-white/25" />
                        )}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => openEdit(course)}
                      >
                        <Pencil size={14} className="text-white/40" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-400/60 hover:text-red-400"
                        onClick={() => handleDelete(course.id)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
