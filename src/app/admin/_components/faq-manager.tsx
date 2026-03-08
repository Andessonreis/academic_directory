"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Save, X, GripVertical, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { getAllFaqs, createFaq, updateFaq, deleteFaq } from "@/services/faq-service"
import { getActiveCourses } from "@/services/course-service"
import type { FaqItemDB, Course } from "@/types/event"

export default function FaqManager() {
  const [faqs, setFaqs] = useState<FaqItemDB[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const [form, setForm] = useState({ question: "", answer: "", category: "", tags: [] as string[], isActive: true })
  const [availableCourses, setAvailableCourses] = useState<Course[]>([])

  useEffect(() => {
    loadFaqs()
    getActiveCourses().then(setAvailableCourses)
  }, [])

  async function loadFaqs() {
    setLoading(true)
    const data = await getAllFaqs()
    setFaqs(data)
    setLoading(false)
  }

  function startCreate() {
    setEditingId(null)
    setForm({ question: "", answer: "", category: "", tags: [], isActive: true })
    setIsCreating(true)
  }

  function startEdit(faq: FaqItemDB) {
    setIsCreating(false)
    setEditingId(faq.id)
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? "",
      tags: faq.tags || [],
      isActive: faq.isActive,
    })
  }

  function cancelEdit() {
    setEditingId(null)
    setIsCreating(false)
    setForm({ question: "", answer: "", category: "", tags: [], isActive: true })
  }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) return

    if (isCreating) {
      const created = await createFaq({
        question: form.question,
        answer: form.answer,
        category: form.category || undefined,
        tags: form.tags,
        displayOrder: faqs.length,
        isActive: form.isActive,
      })
      if (created) {
        setFaqs((prev) => [...prev, created])
      }
    } else if (editingId) {
      const updated = await updateFaq(editingId, {
        question: form.question,
        answer: form.answer,
        category: form.category || undefined,
        tags: form.tags,
        isActive: form.isActive,
      })
      if (updated) {
        setFaqs((prev) => prev.map((f) => (f.id === editingId ? updated : f)))
      }
    }
    cancelEdit()
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir esta FAQ?")) return
    const ok = await deleteFaq(id)
    if (ok) setFaqs((prev) => prev.filter((f) => f.id !== id))
  }

  async function toggleActive(faq: FaqItemDB) {
    const updated = await updateFaq(faq.id, { isActive: !faq.isActive })
    if (updated) {
      setFaqs((prev) => prev.map((f) => (f.id === faq.id ? updated : f)))
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-amber-500" size={32} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">Dúvidas Frequentes</h2>
          <p className="text-sm text-white/40 mt-1">{faqs.length} perguntas cadastradas</p>
        </div>
        <button
          onClick={startCreate}
          className="flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-amber-500/20"
        >
          <Plus size={16} />
          Nova FAQ
        </button>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingId) && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-4">
          <h3 className="text-sm font-semibold text-white/80">
            {isCreating ? "Nova pergunta" : "Editar pergunta"}
          </h3>

          <div className="space-y-3">
            <input
              type="text"
              value={form.question}
              onChange={(e) => setForm({ ...form, question: e.target.value })}
              placeholder="Pergunta..."
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/40"
            />
            <textarea
              value={form.answer}
              onChange={(e) => setForm({ ...form, answer: e.target.value })}
              placeholder="Resposta..."
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber-500/40 resize-none"
            />
            <div className="flex gap-3">
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white outline-none focus:border-amber-500/40 [&>option]:bg-[#0a0a0a] [&>option]:text-white"
              >
                <option value="">Selecione a categoria</option>
                <option value="Acadêmico">Acadêmico</option>
                <option value="Manifestações">Manifestações</option>
                <option value="Comunidade">Comunidade</option>
                <option value="Privacidade">Privacidade</option>
                <option value="Financeiro">Financeiro</option>
                <option value="Infraestrutura">Infraestrutura</option>
                <option value="Geral">Geral</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="accent-amber-500"
                />
                Ativo
              </label>
            </div>

            {/* Tags - Público-Alvo */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-white/50">Público-Alvo (Tags)</span>
              <div className="flex flex-wrap gap-1.5">
                {["Geral", "Superior", "Integrado"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag],
                    }))}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                      form.tags.includes(tag)
                        ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
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
                    onClick={() => {
                      const t = c.shortName || c.name
                      setForm(prev => ({
                        ...prev,
                        tags: prev.tags.includes(t) ? prev.tags.filter(x => x !== t) : [...prev.tags, t],
                      }))
                    }}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-[11px] font-medium transition",
                      form.tags.includes(c.shortName || c.name)
                        ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                        : "border-white/10 text-white/30 hover:border-white/20"
                    )}
                  >
                    {c.shortName || c.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={cancelEdit}
              className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm text-white/50 hover:text-white transition"
            >
              <X size={14} /> Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!form.question.trim() || !form.answer.trim()}
              className="flex items-center gap-1.5 rounded-lg bg-amber-500/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500 disabled:opacity-40"
            >
              <Save size={14} /> Salvar
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className={cn(
              "group flex items-start gap-3 rounded-xl border p-4 transition",
              faq.isActive
                ? "border-white/[0.07] bg-white/[0.02] hover:border-white/15"
                : "border-white/[0.04] bg-white/[0.01] opacity-50"
            )}
          >
            <GripVertical size={16} className="mt-1 shrink-0 text-white/15" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white/80">{faq.question}</p>
              <p className="text-xs text-white/40 mt-1 line-clamp-2">{faq.answer}</p>
              {faq.category && (
                <span className="mt-2 inline-block rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/30">
                  {faq.category}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => toggleActive(faq)}
                className={cn(
                  "h-5 w-9 rounded-full transition",
                  faq.isActive ? "bg-amber-500/60" : "bg-white/10"
                )}
              >
                <div
                  className={cn(
                    "h-4 w-4 rounded-full bg-white transition-transform",
                    faq.isActive ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </button>
              <button
                onClick={() => startEdit(faq)}
                className="p-1.5 text-white/30 hover:text-white transition"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(faq.id)}
                className="p-1.5 text-white/30 hover:text-red-400 transition"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {faqs.length === 0 && !isCreating && (
          <div className="rounded-2xl border border-dashed border-white/10 py-12 text-center">
            <p className="text-sm text-white/30">Nenhuma FAQ cadastrada</p>
            <button
              onClick={startCreate}
              className="mt-3 text-sm text-amber-400 hover:text-amber-300 transition"
            >
              + Criar primeira FAQ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
