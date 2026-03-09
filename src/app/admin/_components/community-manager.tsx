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

const DESCRIPTION_MAX_LENGTH = 160
const MOBILE_BATCH_SIZE = 12

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
  const [visibleCount, setVisibleCount] = useState(MOBILE_BATCH_SIZE)
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
      const normalizedDescription = form.description.trim().slice(0, DESCRIPTION_MAX_LENGTH)
      const payload = { ...form, description: normalizedDescription }
      if (editingLink) {
        await updateCommunityLink(editingLink.id, payload)
      } else {
        await createCommunityLink(payload)
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

  useEffect(() => {
    setVisibleCount(MOBILE_BATCH_SIZE)
  }, [search, links.length])

  const mobileLinks = filtered.slice(0, visibleCount)
  const hasMoreMobile = visibleCount < filtered.length

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

          <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg border border-white/10 bg-[#111] text-white">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingLink ? "Editar Link" : "Novo Link"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div className="space-y-1.5">
                <Label className="text-white/85">Título *</Label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                  placeholder="Ex: Grupo ADS 2024"
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-white/85">Descrição</Label>
                  <span className="text-[11px] text-white/45">{form.description.length}/{DESCRIPTION_MAX_LENGTH}</span>
                </div>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value.slice(0, DESCRIPTION_MAX_LENGTH) })
                  }
                  placeholder="Descrição curta do link"
                  rows={2}
                  maxLength={DESCRIPTION_MAX_LENGTH}
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-white/85">URL *</Label>
                <Input
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) =>
                    setForm({ ...form, url: e.target.value })
                  }
                  placeholder="https://..."
                  className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-white/85">Tipo</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) =>
                      setForm({ ...form, type: v as CommunityLink["type"] })
                    }
                  >
                    <SelectTrigger className="border-white/15 bg-white/5 text-white">
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
                  <Label className="text-white/85">Categoria</Label>
                  <Input
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Ex: Turma ADS"
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-white/85">Ícone (opcional)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) =>
                      setForm({ ...form, icon: e.target.value })
                    }
                    placeholder="Nome do ícone"
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-white/85">Ordem de exibição</Label>
                  <Input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        displayOrder: Number.parseInt(e.target.value) || 0,
                      })
                    }
                    className="border-white/15 bg-white/5 text-white placeholder:text-white/35"
                  />
                </div>
              </div>

              {/* Tags - Público-Alvo */}
              <div className="space-y-1.5">
                <Label className="text-white/85">Público-Alvo (Tags)</Label>
                <div className="flex flex-wrap gap-1.5">
                  {["Geral", "Superior", "Integrado"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${form.tags.includes(tag)
                          ? "border-green-500/40 bg-green-500/10 text-green-400"
                          : "border-white/20 bg-white/[0.04] text-white/70 hover:border-white/35 hover:bg-white/[0.08]"
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
                          : "border-white/20 bg-white/[0.04] text-white/70 hover:border-white/35 hover:bg-white/[0.08]"
                        }`}
                    >
                      {c.shortName || c.name}
                    </button>
                  ))}
                </div>
              </div>

              <label className="flex items-center gap-2 text-sm cursor-pointer text-white/80">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  className="rounded border-white/20 bg-white/5"
                />
                Ativo (visível para os alunos)
              </label>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="border border-white/15 text-white/80 hover:bg-white/10"
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
        <>
          {/* Mobile: compact list */}
          <div className="sm:hidden divide-y divide-white/[0.06] rounded-xl border border-white/[0.08] bg-white/[0.02]">
            {mobileLinks.map((link) => (
              <div key={link.id} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`truncate text-sm font-semibold ${link.isActive ? "text-white/90" : "line-through text-white/40"}`}>
                      {link.title}
                    </span>
                    <span className="shrink-0 rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-white/55">
                      {link.type}
                    </span>
                  </div>
                  {link.category && (
                    <p className="mt-0.5 truncate text-[11px] text-white/45">{link.category}</p>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-white/55"
                    onClick={() => handleToggleActive(link)}
                    title={link.isActive ? "Desativar" : "Ativar"}
                  >
                    {link.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-white/55" asChild>
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink size={14} />
                    </a>
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-white/55" onClick={() => openEdit(link)}>
                    <Pencil size={14} />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500" onClick={() => handleDelete(link.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
            {hasMoreMobile && (
              <div className="p-2.5">
                <Button
                  variant="ghost"
                  className="h-8 w-full text-xs text-white/70 hover:bg-white/[0.06]"
                  onClick={() => setVisibleCount((prev) => prev + MOBILE_BATCH_SIZE)}
                >
                  Carregar mais links
                </Button>
              </div>
            )}
          </div>

          {/* Desktop: full list */}
          <div className="hidden sm:block divide-y divide-white/10 rounded-lg border border-white/10 bg-white/[0.03]">
            {filtered.map((link) => (
              <div
                key={link.id}
                className="flex items-center gap-3 px-3 py-2.5 sm:px-4 sm:py-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-sm font-medium truncate ${!link.isActive ? "line-through text-white/40" : "text-white/90"
                        }`}
                    >
                      {link.title}
                    </span>
                    <span className="hidden sm:inline-flex text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/60 uppercase tracking-wide">
                      {link.type}
                    </span>
                  </div>
                  {link.category && (
                    <p className="text-xs text-white/50 truncate">
                      {link.category}
                    </p>
                  )}
                </div>

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
        </>
      )}
    </div>
  )
}
