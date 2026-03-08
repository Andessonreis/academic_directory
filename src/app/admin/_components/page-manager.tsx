"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import {
  Plus, Pencil, Trash2, Save, X, Eye, EyeOff,
  FileCode, Layout, Globe, Loader2, ExternalLink, Copy,
  ImagePlus, Video, Type, Columns, Quote,
  Upload, Link2, LayoutGrid, Minus, FileDown, FileUp
} from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllPages, createPage, updatePage, deletePage } from "@/services/page-service"
import { getEvents, updateEvent } from "@/services/event-service"
import { supabase } from "@/lib/supabase/client"
import type { CustomPage, EventItem, PageAttachment } from "@/types/event"

/* ─── HTML Templates ─── */
const TEMPLATES = [
  {
    id: "blank",
    label: "Em branco",
    icon: FileCode,
    html: "",
  },
  {
    id: "event-basic",
    label: "Evento Básico",
    icon: Layout,
    html: `<div class="max-w-3xl mx-auto space-y-6">
  <div class="text-center space-y-3">
    <span class="inline-block px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-wider">Evento Especial</span>
    <h1 class="text-3xl md:text-5xl font-bold text-white">Título do Evento</h1>
    <p class="text-white/60 text-lg">Uma breve descrição do evento que captura a atenção.</p>
  </div>

  <div class="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-3">
    <div class="flex items-center gap-3 text-white/80">
      <span class="text-purple-400">📅</span>
      <span class="font-medium">15 de Março de 2026</span>
    </div>
    <div class="flex items-center gap-3 text-white/80">
      <span class="text-pink-400">⏰</span>
      <span class="font-medium">14:00 - 18:00</span>
    </div>
    <div class="flex items-center gap-3 text-white/80">
      <span class="text-blue-400">📍</span>
      <span class="font-medium">Auditório Principal - IFBA</span>
    </div>
  </div>

  <div class="space-y-4 text-white/70 leading-relaxed">
    <p>Descreva aqui os detalhes completos do evento. Você pode usar HTML para formatar o conteúdo.</p>
    <p>Adicione <strong class="text-white">destaques</strong>, <em>ênfases</em> e até imagens.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 class="text-white font-semibold mb-2">O que esperar</h3>
      <ul class="space-y-2 text-sm text-white/60">
        <li>✦ Palestras inspiradoras</li>
        <li>✦ Networking com profissionais</li>
        <li>✦ Certificado de participação</li>
      </ul>
    </div>
    <div class="rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 class="text-white font-semibold mb-2">Requisitos</h3>
      <ul class="space-y-2 text-sm text-white/60">
        <li>✦ Matrícula ativa no IFBA</li>
        <li>✦ Inscrição prévia</li>
        <li>✦ Notebook (opcional)</li>
      </ul>
    </div>
  </div>
</div>`,
  },
  {
    id: "event-photo",
    label: "Evento com Galeria",
    icon: Globe,
    html: `<div class="max-w-4xl mx-auto space-y-8">
  <div class="text-center space-y-3">
    <h1 class="text-3xl md:text-5xl font-bold text-white">Semana de Tecnologia IFBA</h1>
    <p class="text-white/50 max-w-xl mx-auto">Uma semana inteira dedicada à inovação, aprendizado e tecnologia.</p>
  </div>

  <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80" alt="Banner do evento" class="w-full rounded-2xl border border-white/10 object-cover aspect-[21/9]" />

  <div class="prose prose-invert max-w-none">
    <p class="text-white/70 text-lg leading-relaxed">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
    </p>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
    <img src="https://images.unsplash.com/photo-1515169067868-5387ec356754?w=400&q=80" alt="Foto 1" class="rounded-xl border border-white/10 aspect-square object-cover w-full" />
    <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&q=80" alt="Foto 2" class="rounded-xl border border-white/10 aspect-square object-cover w-full" />
    <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=400&q=80" alt="Foto 3" class="rounded-xl border border-white/10 aspect-square object-cover w-full" />
  </div>

  <div class="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-center">
    <p class="text-emerald-400 font-semibold text-lg mb-2">Inscrições abertas!</p>
    <p class="text-white/50 text-sm">Vagas limitadas. Garanta sua participação agora.</p>
  </div>
</div>`,
  },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/* ─── Media insertion snippets ─── */
const MEDIA_SNIPPETS = [
  {
    id: "image-url",
    label: "Imagem (URL)",
    icon: ImagePlus,
    snippet: `\n<img src="COLE_A_URL_DA_IMAGEM" alt="Descrição da imagem" class="w-full rounded-2xl border border-white/10 object-cover" />\n`,
  },
  {
    id: "image-gallery",
    label: "Galeria de fotos",
    icon: LayoutGrid,
    snippet: `\n<div class="grid grid-cols-2 md:grid-cols-3 gap-3">
  <img src="URL_FOTO_1" alt="Foto 1" class="rounded-xl border border-white/10 aspect-square object-cover w-full" />
  <img src="URL_FOTO_2" alt="Foto 2" class="rounded-xl border border-white/10 aspect-square object-cover w-full" />
  <img src="URL_FOTO_3" alt="Foto 3" class="rounded-xl border border-white/10 aspect-square object-cover w-full" />
</div>\n`,
  },
  {
    id: "video-youtube",
    label: "Vídeo YouTube",
    icon: Video,
    snippet: `\n<div class="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
  <iframe src="https://www.youtube.com/embed/ID_DO_VIDEO" title="Vídeo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="absolute inset-0 w-full h-full"></iframe>
</div>\n`,
  },
  {
    id: "video-url",
    label: "Vídeo (MP4/URL)",
    icon: Video,
    snippet: `\n<video controls class="w-full rounded-2xl border border-white/10">
  <source src="COLE_A_URL_DO_VIDEO" type="video/mp4" />
  Seu navegador não suporta vídeos.
</video>\n`,
  },
  {
    id: "heading",
    label: "Título + Texto",
    icon: Type,
    snippet: `\n<div class="space-y-3">
  <h2 class="text-2xl md:text-3xl font-bold text-white">Seu Título Aqui</h2>
  <p class="text-white/60 leading-relaxed">Escreva o conteúdo do parágrafo aqui. Você pode usar <strong class="text-white">negrito</strong>, <em>itálico</em> e <a href="#" class="text-purple-400 underline">links</a>.</p>
</div>\n`,
  },
  {
    id: "two-columns",
    label: "2 Colunas",
    icon: Columns,
    snippet: `\n<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div class="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
    <h3 class="text-white font-semibold">Coluna 1</h3>
    <p class="text-sm text-white/60">Conteúdo da primeira coluna.</p>
  </div>
  <div class="rounded-xl border border-white/10 bg-white/5 p-5 space-y-2">
    <h3 class="text-white font-semibold">Coluna 2</h3>
    <p class="text-sm text-white/60">Conteúdo da segunda coluna.</p>
  </div>
</div>\n`,
  },
  {
    id: "callout",
    label: "Destaque / CTA",
    icon: Quote,
    snippet: `\n<div class="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-6 text-center space-y-2">
  <p class="text-purple-400 font-semibold text-lg">Texto em destaque!</p>
  <p class="text-white/50 text-sm">Uma descrição ou chamada para ação aqui.</p>
</div>\n`,
  },
  {
    id: "divider",
    label: "Divisor",
    icon: Minus,
    snippet: `\n<hr class="border-white/10 my-6" />\n`,
  },
  {
    id: "link-button",
    label: "Botão / Link",
    icon: Link2,
    snippet: `\n<div class="text-center">
  <a href="https://COLE_O_LINK" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-purple-500">
    Texto do Botão ↗
  </a>
</div>\n`,
  },
]

export default function PageManager() {
  const [pages, setPages] = useState<CustomPage[]>([])
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachmentFileRef = useRef<HTMLInputElement>(null)
  const [attachments, setAttachments] = useState<PageAttachment[]>([])

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    htmlContent: "",
    coverImage: "",
    eventId: "",
    isPublished: false,
  })

  useEffect(() => {
    Promise.all([getAllPages(), getEvents()]).then(([p, e]) => {
      setPages(p)
      setEvents(e)
      setLoading(false)
    })
  }, [])

  const updateSlug = useCallback((title: string) => {
    setForm((prev) => ({ ...prev, title, slug: slugify(title) }))
  }, [])

  /** Insert HTML snippet at textarea cursor position */
  function insertSnippet(snippet: string) {
    const ta = textareaRef.current
    if (!ta) {
      setForm((prev) => ({ ...prev, htmlContent: prev.htmlContent + snippet }))
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const before = form.htmlContent.substring(0, start)
    const after = form.htmlContent.substring(end)
    const newContent = before + snippet + after
    setForm((prev) => ({ ...prev, htmlContent: newContent }))
    // Restore cursor position after the inserted snippet
    requestAnimationFrame(() => {
      ta.selectionStart = ta.selectionEnd = start + snippet.length
      ta.focus()
    })
  }

  /** Upload image to Supabase Storage and insert into editor */
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")
    if (!isImage && !isVideo) {
      alert("Selecione um arquivo de imagem ou vídeo.")
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split(".").pop() ?? "png"
      const fileName = `pages/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

      const { error } = await supabase.storage.from("uploads").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        alert("Erro ao fazer upload: " + error.message)
        return
      }

      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(fileName)
      const publicUrl = urlData.publicUrl

      if (isImage) {
        insertSnippet(`\n<img src="${publicUrl}" alt="${file.name}" class="w-full rounded-2xl border border-white/10 object-cover" />\n`)
      } else {
        insertSnippet(`\n<video controls class="w-full rounded-2xl border border-white/10">\n  <source src="${publicUrl}" type="${file.type}" />\n  Seu navegador não suporta vídeos.\n</video>\n`)
      }
    } catch (err) {
      alert("Erro no upload. Tente novamente.")
      console.error(err)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  /** Upload a downloadable file attachment */
  async function handleAttachmentUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingAttachment(true)
    try {
      const ext = file.name.split(".").pop() ?? "bin"
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
      const fileName = `pages/attachments/${Date.now()}-${safeName}`

      const { error } = await supabase.storage.from("uploads").upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (error) {
        alert("Erro ao fazer upload: " + error.message)
        return
      }

      const { data: urlData } = supabase.storage.from("uploads").getPublicUrl(fileName)

      setAttachments((prev) => [
        ...prev,
        {
          name: file.name,
          url: urlData.publicUrl,
          size: file.size,
          type: file.type || ext,
        },
      ])
    } catch (err) {
      alert("Erro no upload do anexo. Tente novamente.")
      console.error(err)
    } finally {
      setUploadingAttachment(false)
      if (attachmentFileRef.current) attachmentFileRef.current.value = ""
    }
  }

  /** Add an external URL attachment (e.g. Google Drive link) */
  function addExternalAttachment() {
    const name = prompt("Nome do arquivo/link:")
    if (!name) return
    const url = prompt("URL (ex: link do Google Drive, regulamento, etc.):")
    if (!url) return
    setAttachments((prev) => [...prev, { name, url, type: "link" }])
  }

  function removeAttachment(idx: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  function startCreate(templateId = "blank") {
    const template = TEMPLATES.find((t) => t.id === templateId) ?? TEMPLATES[0]
    setEditingPage(null)
    setForm({
      title: "",
      slug: "",
      description: "",
      htmlContent: template.html,
      coverImage: "",
      eventId: "",
      isPublished: false,
    })
    setAttachments([])
    setIsCreating(true)
  }

  function startEdit(page: CustomPage) {
    setIsCreating(false)
    setEditingPage(page)
    setForm({
      title: page.title,
      slug: page.slug,
      description: page.description ?? "",
      htmlContent: page.htmlContent,
      coverImage: page.coverImage ?? "",
      eventId: page.eventId ?? "",
      isPublished: page.isPublished,
    })
    setAttachments(page.attachments ?? [])
  }

  function cancelEdit() {
    setEditingPage(null)
    setIsCreating(false)
    setShowPreview(false)
    setAttachments([])
  }

  async function handleSave() {
    if (!form.title.trim() || !form.slug.trim()) return

    if (isCreating) {
      const created = await createPage({
        title: form.title,
        slug: form.slug,
        description: form.description || undefined,
        htmlContent: form.htmlContent,
        coverImage: form.coverImage || undefined,
        eventId: form.eventId || undefined,
        attachments,
        isPublished: form.isPublished,
      })
      if (created) {
        setPages((prev) => [created, ...prev])
        // Auto-publish linked event when page is published
        if (form.isPublished && form.eventId) {
          await updateEvent(form.eventId, { status: "confirmed" })
        }
      }
    } else if (editingPage) {
      const updated = await updatePage(editingPage.id, {
        title: form.title,
        slug: form.slug,
        description: form.description || undefined,
        htmlContent: form.htmlContent,
        coverImage: form.coverImage || undefined,
        eventId: form.eventId || undefined,
        attachments,
        isPublished: form.isPublished,
      })
      if (updated) {
        setPages((prev) => prev.map((p) => (p.id === editingPage.id ? updated : p)))
        // Auto-publish linked event when page is published
        if (form.isPublished && form.eventId) {
          await updateEvent(form.eventId, { status: "confirmed" })
        }
      }
    }
    cancelEdit()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta página?")) return
    if (await deletePage(id)) setPages((prev) => prev.filter((p) => p.id !== id))
  }

  async function togglePublish(page: CustomPage) {
    const newPublished = !page.isPublished
    const updated = await updatePage(page.id, { isPublished: newPublished })
    if (updated) {
      setPages((prev) => prev.map((p) => (p.id === page.id ? updated : p)))
      // Auto-publish linked event when page is published
      if (newPublished && page.eventId) {
        await updateEvent(page.eventId, { status: "confirmed" })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-cyan-500" size={32} />
      </div>
    )
  }

  // Editor view
  if (isCreating || editingPage) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">
            {isCreating ? "Nova Página" : "Editar Página"}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-white/50 transition hover:text-white"
            >
              <Eye size={14} /> {showPreview ? "Editor" : "Preview"}
            </button>
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs text-white/40 hover:text-white transition"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.title.trim() || !form.slug.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-cyan-500/80 px-4 py-2 text-xs font-medium text-white transition hover:bg-cyan-500 disabled:opacity-40"
            >
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>

        {showPreview ? (
          <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] p-6 min-h-[400px]">
            <div
              className="prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: form.htmlContent }}
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Meta fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/30 mb-1 block">Título</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateSlug(e.target.value)}
                  placeholder="Nome da página..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-wider text-white/30 mb-1 block">Slug (URL)</label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/20">/pagina/</span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="url-da-pagina"
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Descrição curta (opcional)"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40"
              />
              <input
                type="text"
                value={form.coverImage}
                onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                placeholder="URL da capa (opcional)"
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none focus:border-cyan-500/40"
              />
              <select
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/50 outline-none focus:border-cyan-500/40"
              >
                <option value="" className="bg-[#111]">Vincular a evento (opcional)</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id} className="bg-[#111] text-white">{evt.title}</option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                className="accent-cyan-500"
              />
              Publicar imediatamente
            </label>

            {/* ── Attachments / Downloads ── */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/30 mb-2 block">
                Arquivos para Download (opcional)
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => attachmentFileRef.current?.click()}
                  disabled={uploadingAttachment}
                  className="flex items-center gap-1.5 rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-2 text-[11px] font-medium text-purple-400 transition hover:bg-purple-500/15 disabled:opacity-50"
                >
                  {uploadingAttachment ? <Loader2 size={12} className="animate-spin" /> : <FileUp size={12} />}
                  {uploadingAttachment ? "Enviando..." : "Upload Arquivo"}
                </button>
                <input
                  ref={attachmentFileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar,.txt,.csv,.png,.jpg,.jpeg"
                  onChange={handleAttachmentUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={addExternalAttachment}
                  className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[11px] text-white/50 transition hover:border-white/20 hover:text-white/80"
                >
                  <Link2 size={12} /> Link Externo (Drive, etc.)
                </button>
              </div>

              {attachments.length > 0 && (
                <div className="space-y-1.5 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2">
                      <FileDown size={14} className="shrink-0 text-purple-400/60" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white/70 truncate">{att.name}</p>
                        {att.size && (
                          <p className="text-[10px] text-white/25">
                            {att.size < 1024 * 1024
                              ? `${(att.size / 1024).toFixed(0)} KB`
                              : `${(att.size / (1024 * 1024)).toFixed(1)} MB`}
                          </p>
                        )}
                        {att.type === "link" && (
                          <p className="text-[10px] text-white/25 truncate">{att.url}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="shrink-0 p-1 text-white/25 hover:text-red-400 transition"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <p className="mt-1.5 text-[10px] text-white/20">
                PDFs, regulamentos, planilhas, links do Drive — qualquer arquivo que visitantes possam baixar.
              </p>
            </div>

            {/* ── Media Toolbar ── */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/30 mb-2 block">
                Inserir Elementos
              </label>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {/* Upload button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-3 py-2 text-[11px] font-medium text-cyan-400 transition hover:bg-cyan-500/15 disabled:opacity-50"
                >
                  {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                  {uploading ? "Enviando..." : "Upload Arquivo"}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Snippet buttons */}
                {MEDIA_SNIPPETS.map((ms) => {
                  const Icon = ms.icon
                  return (
                    <button
                      key={ms.id}
                      type="button"
                      onClick={() => insertSnippet(ms.snippet)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-2.5 py-2 text-[11px] text-white/50 transition hover:border-white/20 hover:text-white/80 hover:bg-white/[0.05]"
                      title={ms.label}
                    >
                      <Icon size={12} />
                      <span className="hidden sm:inline">{ms.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* HTML Editor */}
            <div>
              <label className="text-[11px] uppercase tracking-wider text-white/30 mb-1 block">
                Conteúdo HTML
              </label>
              <textarea
                ref={textareaRef}
                value={form.htmlContent}
                onChange={(e) => setForm({ ...form, htmlContent: e.target.value })}
                placeholder="<div>Seu conteúdo HTML aqui...</div>&#10;&#10;Use os botões acima para inserir imagens, vídeos, galerias e mais!"
                rows={24}
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-3 text-sm text-emerald-300 font-mono placeholder:text-white/20 outline-none focus:border-cyan-500/40 resize-y leading-relaxed"
                spellCheck={false}
              />
              <p className="mt-1.5 text-[10px] text-white/20">
                Dica: Você pode usar classes do Tailwind CSS para estilizar. Imagens, vídeos, iframes e qualquer HTML é aceito.
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Páginas Personalizadas</h2>
          <p className="text-sm text-white/40 mt-1">{pages.length} páginas criadas</p>
        </div>
      </div>

      {/* Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TEMPLATES.map((tpl) => {
          const Icon = tpl.icon
          return (
            <button
              key={tpl.id}
              onClick={() => startCreate(tpl.id)}
              className="group flex items-center gap-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-cyan-500/30 hover:bg-cyan-500/5"
            >
              <div className="rounded-lg bg-white/5 p-2.5 text-white/40 group-hover:text-cyan-400 transition">
                <Icon size={18} />
              </div>
              <div>
                <p className="text-sm font-medium text-white/70 group-hover:text-white transition">{tpl.label}</p>
                <p className="text-xs text-white/30">Criar com template</p>
              </div>
              <Plus size={16} className="ml-auto text-white/15 group-hover:text-cyan-400 transition" />
            </button>
          )
        })}
      </div>

      {/* Pages List */}
      <div className="space-y-2">
        {pages.map((page) => (
          <div
            key={page.id}
            className="group flex items-center gap-4 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/15"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-white/80 truncate">{page.title}</h3>
                {page.isPublished ? (
                  <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-400">público</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">rascunho</span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-white/25 font-mono">/pagina/{page.slug}</span>
                {page.eventId && (
                  <span className="text-[10px] text-purple-400/60">vinculado a evento</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => togglePublish(page)}
                className="p-1.5 text-white/30 hover:text-white transition"
                title={page.isPublished ? "Despublicar" : "Publicar"}
              >
                {page.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => {
                  const base = typeof window !== "undefined" ? window.location.origin : "https://daifba.com.br"
                  navigator.clipboard.writeText(`${base}/pagina/${page.slug}`)
                }}
                className="p-1.5 text-white/30 hover:text-white transition"
                title="Copiar link"
              >
                <Copy size={14} />
              </button>
              <button onClick={() => startEdit(page)} className="p-1.5 text-white/30 hover:text-white transition">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(page.id)} className="p-1.5 text-white/30 hover:text-red-400 transition">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {pages.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
            <p className="text-sm text-white/30">Nenhuma página criada ainda</p>
            <p className="text-xs text-white/20 mt-1">Use os templates acima para começar</p>
          </div>
        )}
      </div>
    </div>
  )
}
