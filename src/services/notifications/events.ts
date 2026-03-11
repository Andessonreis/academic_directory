/**
 * Notification Events
 * API pública do sistema de notificações.
 * Cada "algo aconteceu" é um evento com um nome semântico.
 * Nenhum outro módulo chama enqueueEmailJob diretamente.
 */
import { enqueueEmailJob } from "./queue"

const DA_EMAIL = process.env.DA_EMAIL ?? "da@daifba.com.br"

// ── eventos ────────────────────────────────────────────────────────

/**
 * Aluno enviou uma manifestação.
 * Emite:
 *   - feedback.new-admin → equipe DA
 *   - feedback.received  → aluno (se não anônimo e tiver e-mail)
 */
export async function onFeedbackCreated(params: {
  feedbackId: string
  tipo: string
  conteudo: string
  anonimo: boolean
  nome: string | null
  email: string | null
  createdAt: string
}): Promise<void> {
  // 1. Notifica a equipe do DA
  await enqueueEmailJob("feedback.new-admin", {
    to: DA_EMAIL,
    feedbackId: params.feedbackId,
    tipo: params.tipo,
    conteudo: params.conteudo,
    anonimo: params.anonimo,
    nome: params.nome,
    email: params.email,
    createdAt: params.createdAt,
  })

  // 2. Confirma ao aluno (apenas se identificado e com e-mail)
  if (!params.anonimo && params.email && params.nome) {
    await enqueueEmailJob("feedback.received", {
      to: params.email,
      nome: params.nome,
      tipo: params.tipo,
      conteudo: params.conteudo,
      createdAt: params.createdAt,
    })
  }
}

/**
 * Admin marcou manifestação como respondida.
 * Emite:
 *   - feedback.answered → aluno (se tiver e-mail)
 */
export async function onFeedbackAnswered(params: {
  nome: string
  email: string
  tipo: string
  conteudo: string
  adminMessage?: string
}): Promise<void> {
  await enqueueEmailJob("feedback.answered", {
    to: params.email,
    nome: params.nome,
    tipo: params.tipo,
    conteudo: params.conteudo,
    adminMessage: params.adminMessage,
  })
}
