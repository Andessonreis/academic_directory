"use client"

import { useState, useEffect } from "react"
import {
  Loader2,
  Mail,
  CheckCheck,
  Archive,
  Eye,
  ChevronDown,
  ChevronUp,
  User,
  UserX,
  Megaphone,
  Lightbulb,
  ShieldAlert,
  ThumbsUp,
  RefreshCw,
  Send,
} from "lucide-react"
import { supabase } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"
import { updateFeedbackStatus } from "../_actions/feedback-actions"

type FeedbackStatus = "pendente" | "lido" | "respondido" | "arquivado"
type FeedbackTipo = "reclamacao" | "sugestao" | "denuncia" | "elogio"

interface Manifestacao {
  id: string
  tipo: FeedbackTipo
  conteudo: string
  anonimo: boolean
  nome: string | null
  email: string | null
  status: FeedbackStatus
  created_at: string
}

const TIPO_CONFIG: Record<FeedbackTipo, { label: string; icon: React.ReactNode; color: string; badgeBg: string }> = {
  reclamacao: {
    label: "Reclamação",
    icon: <Megaphone size={15} />,
    color: "text-red-400",
    badgeBg: "bg-red-500/10 border-red-500/20 text-red-400",
  },
  sugestao: {
    label: "Sugestão",
    icon: <Lightbulb size={15} />,
    color: "text-yellow-400",
    badgeBg: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400",
  },
  denuncia: {
    label: "Denúncia",
    icon: <ShieldAlert size={15} />,
    color: "text-orange-400",
    badgeBg: "bg-orange-500/10 border-orange-500/20 text-orange-400",
  },
  elogio: {
    label: "Elogio",
    icon: <ThumbsUp size={15} />,
    color: "text-green-400",
    badgeBg: "bg-green-500/10 border-green-500/20 text-green-400",
  },
}

const STATUS_CONFIG: Record<FeedbackStatus, { label: string; color: string }> = {
  pendente: { label: "Pendente", color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  lido: { label: "Lido", color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  respondido: { label: "Respondido", color: "bg-green-500/10 border-green-500/20 text-green-400" },
  arquivado: { label: "Arquivado", color: "bg-white/5 border-white/10 text-white/40" },
}

const FILTER_TABS: { key: FeedbackStatus | "todos"; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "pendente", label: "Pendentes" },
  { key: "lido", label: "Lidos" },
  { key: "respondido", label: "Respondidos" },
  { key: "arquivado", label: "Arquivados" },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function FeedbackManager() {
  const [items, setItems] = useState<Manifestacao[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FeedbackStatus | "todos">("todos")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  // adminReply: mensagem opcional incluída no e-mail ao marcar como respondido
  const [adminReply, setAdminReply] = useState<Record<string, string>>({})

  useEffect(() => {
    loadFeedbacks()
  }, [])

  async function loadFeedbacks() {
    setLoading(true)
    const { data, error } = await supabase
      .from("manifestacoes")
      .select("*")
      .order("created_at", { ascending: false })
    if (!error && data) setItems(data as Manifestacao[])
    setLoading(false)
  }

  async function handleUpdateStatus(id: string, status: FeedbackStatus, adminMessage?: string) {
    setUpdatingId(id)
    const result = await updateFeedbackStatus({ id, status, adminMessage })
    if (result.success) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)))
    }
    setUpdatingId(null)
  }

  const filtered = filter === "todos" ? items : items.filter((i) => i.status === filter)

  const counts = {
    todos: items.length,
    pendente: items.filter((i) => i.status === "pendente").length,
    lido: items.filter((i) => i.status === "lido").length,
    respondido: items.filter((i) => i.status === "respondido").length,
    arquivado: items.filter((i) => i.status === "arquivado").length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Central de Feedbacks</h2>
          <p className="text-white/40 text-sm mt-1">
            Manifestações enviadas pelos estudantes — leia e responda por e-mail
          </p>
        </div>
        <button
          onClick={loadFeedbacks}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white/60 hover:text-white hover:border-white/20 transition text-sm"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Atualizar
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "px-3 py-1.5 rounded-xl border text-sm font-medium transition",
              filter === key
                ? "border-purple-500/40 bg-purple-500/10 text-purple-300"
                : "border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20"
            )}
          >
            {label}
            <span className="ml-1.5 text-[11px] opacity-60">({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-purple-400" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-white/30">
          <Megaphone size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhuma manifestação encontrada</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const tipo = TIPO_CONFIG[item.tipo]
            const statusCfg = STATUS_CONFIG[item.status]
            const isExpanded = expandedId === item.id
            const isUpdating = updatingId === item.id

            return (
              <div
                key={item.id}
                className={cn(
                  "rounded-2xl border transition-all duration-200",
                  item.status === "pendente"
                    ? "border-white/10 bg-white/[0.04]"
                    : "border-white/[0.06] bg-white/[0.02]"
                )}
              >
                {/* Row header */}
                <button
                  className="w-full flex items-start gap-3 px-4 py-4 text-left"
                  onClick={() => {
                    setExpandedId(isExpanded ? null : item.id)
                    if (!isExpanded && item.status === "pendente") {
                      handleUpdateStatus(item.id, "lido")
                    }
                  }}
                >
                  {/* Tipo icon */}
                  <span className={cn("mt-0.5 shrink-0", tipo.color)}>{tipo.icon}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {/* Tipo badge */}
                      <span className={cn("px-2 py-0.5 rounded-full border text-[11px] font-semibold", tipo.badgeBg)}>
                        {tipo.label}
                      </span>
                      {/* Status badge */}
                      <span className={cn("px-2 py-0.5 rounded-full border text-[11px] font-medium", statusCfg.color)}>
                        {statusCfg.label}
                      </span>
                      {/* Anônimo badge */}
                      {item.anonimo ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-white/10 bg-white/5 text-[11px] text-white/35">
                          <UserX size={10} /> Anônimo
                        </span>
                      ) : (
                        item.nome && (
                          <span className="flex items-center gap-1 text-[11px] text-white/50">
                            <User size={10} />
                            {item.nome}
                          </span>
                        )
                      )}
                    </div>
                    <p className={cn("text-sm line-clamp-2", isExpanded ? "text-white/80" : "text-white/55")}>
                      {item.conteudo}
                    </p>
                    <p className="text-[11px] text-white/25 mt-1">{formatDate(item.created_at)}</p>
                  </div>

                  {/* unread dot */}
                  <div className="flex items-center gap-2 shrink-0">
                    {item.status === "pendente" && (
                      <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                    )}
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-white/30" />
                    ) : (
                      <ChevronDown size={16} className="text-white/30" />
                    )}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.06] pt-4 space-y-4">
                    {/* Full message */}
                    <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4">
                      <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{item.conteudo}</p>
                    </div>

                    {/* Contact info */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                      <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
                        {item.anonimo ? (
                          <p className="text-sm text-white/30 flex items-center gap-2">
                            <UserX size={14} /> Identificação não informada
                          </p>
                        ) : (
                          <div className="space-y-0.5">
                            {item.nome && (
                              <p className="text-sm text-white/80 font-medium flex items-center gap-2">
                                <User size={13} className="text-white/40" />
                                {item.nome}
                              </p>
                            )}
                            {item.email ? (
                              <p className="text-sm text-blue-400 flex items-center gap-2">
                                <Mail size={13} />
                                {item.email}
                              </p>
                            ) : (
                              <p className="text-sm text-white/30 flex items-center gap-2">
                                <Mail size={13} /> E-mail não informado
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Reply by email button */}
                      {!item.anonimo && item.email && (
                        <a
                          href={`mailto:${item.email}?subject=${encodeURIComponent(
                            `Re: ${TIPO_CONFIG[item.tipo].label} — DA IFBA Irecê`
                          )}&body=${encodeURIComponent(
                            `Olá${item.nome ? `, ${item.nome}` : ""},\n\nRecebemos sua ${TIPO_CONFIG[item.tipo].label.toLowerCase()} e gostaríamos de retornar.\n\n---\nSua mensagem original:\n"${item.conteudo}"\n---\n\n`
                          )}`}
                          onClick={() => {
                            if (item.status !== "respondido") handleUpdateStatus(item.id, "respondido")
                          }}
                          className="flex shrink-0 items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition text-sm font-medium"
                        >
                          <Mail size={15} />
                          Responder por e-mail
                        </a>
                      )}
                    </div>

                    {/* Reply textarea + actions */}
                    <div className="space-y-3">
                      {/* Caixa de resposta (visível apenas se aluno tem e-mail e não é anônimo) */}
                      {!item.anonimo && item.email && item.status !== "respondido" && (
                        <div className="rounded-xl border border-purple-500/15 bg-purple-500/5 p-3 space-y-2">
                          <p className="text-[11px] font-semibold text-purple-300/70 uppercase tracking-widest">
                            Mensagem para incluir no e-mail (opcional)
                          </p>
                          <textarea
                            rows={3}
                            value={adminReply[item.id] ?? ""}
                            onChange={(e) =>
                              setAdminReply((prev) => ({ ...prev, [item.id]: e.target.value }))
                            }
                            placeholder="Escreva uma mensagem adicional para o aluno..."
                            className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/25 resize-none outline-none focus:border-purple-500/40 transition"
                          />
                        </div>
                      )}

                      {/* Ações */}
                      <div className="flex flex-wrap gap-2">
                        {item.status !== "lido" && item.status !== "respondido" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "lido")}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-blue-500/20 bg-blue-500/5 text-blue-400 hover:bg-blue-500/15 transition text-xs font-medium"
                          >
                            {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Eye size={13} />}
                            Marcar como lido
                          </button>
                        )}
                        {item.status !== "respondido" && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(
                                item.id,
                                "respondido",
                                adminReply[item.id]?.trim() || undefined,
                              )
                            }
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-green-500/20 bg-green-500/5 text-green-400 hover:bg-green-500/15 transition text-xs font-medium"
                          >
                            {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                            {!item.anonimo && item.email
                              ? "Responder e notificar aluno"
                              : "Marcar como respondido"}
                          </button>
                        )}
                        {item.status !== "arquivado" && (
                          <button
                            onClick={() => handleUpdateStatus(item.id, "arquivado")}
                            disabled={isUpdating}
                            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/10 bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/20 transition text-xs font-medium"
                          >
                            {isUpdating ? <Loader2 size={13} className="animate-spin" /> : <Archive size={13} />}
                            Arquivar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
