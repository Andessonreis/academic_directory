"use client"

import { useEffect, useState } from "react"
import {
  getAllCommunityLinks,
  createCommunityLink,
  updateCommunityLink,
  deleteCommunityLink,
} from "@/services/community-service"
import type { CommunityLink } from "@/types/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  ExternalLink,
  Eye,
  EyeOff,
} from "lucide-react"
import { getActiveCourses } from "@/services/course-service"
import type { Course } from "@/types/event"

const TYPE_OPTIONS = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "discord", label: "Discord" },
  { value: "telegram", label: "Telegram" },
  { value: "clube", label: "Clube" },
  { value: "outro", label: "Outro" },
]

const EMPTY_FORM = {
  title: "",
  description: "",
  url: "",
  type: "whatsapp" as CommunityLink["type"],
  category: "",
  icon: "",
  tags: [] as string[],
  isActive: true,
  displayOrder: 0,
}

export default function CommunityManager() {
  const [links, setLinks] = useState<CommunityLink[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLink, setEditingLink] = useState<CommunityLink | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])

  useEffect(() => {
    loadLinks()
    getActiveCourses().then(setAvailableCourses)
  }, [])

  async function loadLinks() {
    setLoading(true)
    const data = await getAllCommunityLinks()
    setLinks(data)
    setLoading(false)
  }

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingLink(null)
  }

  function openEdit(link: CommunityLink) {
    setEditingLink(link)
    setForm({
      title: link.title,
      description: link.description || "",
      url: link.url,
      type: link.type,
      category: link.category,
      icon: link.icon || "",
      tags: link.tags || [],
      isActive: link.isActive,
      displayOrder: link.displayOrder,
    })
    setIsDialogOpen(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (editingLink) {
        await updateCommunityLink(editingLink.id, form)
      } else {
        await createCommunityLink(form)
      }
      await loadLinks()
      setIsDialogOpen(false)
      resetForm()
    } catch (err) {
      console.error("Erro ao salvar link:", err)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja excluir este link?")) return
    try {
      await deleteCommunityLink(id)
      await loadLinks()
    } catch (err) {
      console.error("Erro ao excluir link:", err)
    }
  }

  async function handleToggleActive(link: CommunityLink) {
    try {
      await updateCommunityLink(link.id, { isActive: !link.isActive })
      await loadLinks()
    } catch (err) {
      console.error("Erro ao alternar visibilidade:", err)
    }
  }

  const toggleTag = (tag: string) => {
    setForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }))
  }

  const filtered = links.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold sm:text-xl">
          Gerenciar Comunidade
        </h2>

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
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
              onClick={resetForm}
            >
              <Plus size={16} className="mr-1.5" />
              Novo Link
            </Button>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? "Editar Link" : "Novo Link"}
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
                  placeholder="Ex: Grupo ADS 2024"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Descrição</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Breve descrição do link"
                  rows={2}
                />
              </div>

              <div className="space-y-1.5">
                <Label>URL *</Label>
                <Input
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm({ ...form, url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as CommunityLink["type"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Categoria</Label>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Ex: Turma ADS"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Ícone (opcional)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value })
                    }
                    placeholder="Nome do ícone"
                  />
                </div>

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
                  />
                </div>
              </div>

              {/* Tags - Público-Alvo */}
              <div className="space-y-1.5">
                <Label>Público-Alvo (Tags)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["Geral", "Superior", "Integrado"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${form.tags.includes(tag)
                          ? "border-green-500/40 bg-green-500/10 text-green-400"
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
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${form.tags.includes(c.shortName || c.name)
                          ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                          : "border-white/10 text-white/30 hover:border-white/20"
                        }`}
                    >
                      {c.shortName || c.name}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="rounded"
                />
                Ativo (visível para os alunos)
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {editingLink ? "Salvar" : "Criar"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por título ou categoria..."
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* List */}
      {loading ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Carregando...
        </p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          Nenhum link encontrado.
        </p>
      ) : (
        <div className="divide-y rounded-lg border bg-card">
          {filtered.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3"
            >
              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-medium truncate ${!link.isActive ? "line-through text-muted-foreground" : ""
                      }`}
                  >
                    {link.title}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wide">
                    {link.type}
                  </span>
                </div>
                {link.category && (
                  <p className="text-xs text-muted-foreground truncate">
                    {link.category}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => handleToggleActive(link)}
                  title={link.isActive ? "Desativar" : "Ativar"}
                >
                  {link.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  asChild
                >
                  <a href={link.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={14} />
                  </a>
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={() => openEdit(link)}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-red-500 hover:text-red-600"
                  onClick={() => handleDelete(link.id)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
