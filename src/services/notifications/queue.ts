/**
 * Email Queue
 * Enfileira jobs na tabela `email_jobs` do Supabase.
 * Tudo passa por aqui — nenhum módulo envia email diretamente.
 */
import { createClient } from "@supabase/supabase-js"

// ── tipos ──────────────────────────────────────────────────────────

export type EmailJobType =
  | "feedback.new-admin"
  | "feedback.received"
  | "feedback.answered"

export interface EmailJobPayload {
  to: string
  [key: string]: unknown
}

// ── cliente service-role (servidor apenas) ─────────────────────────

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

// ── enfileirar ────────────────────────────────────────────────────

/**
 * Adiciona um job de email na fila.
 * Pode receber `delaySeconds` para agendar para o futuro.
 */
export async function enqueueEmailJob(
  type: EmailJobType,
  payload: EmailJobPayload,
  delaySeconds = 0,
): Promise<void> {
  const supabaseAdmin = getAdminClient()

  const scheduledAt = new Date(Date.now() + delaySeconds * 1000).toISOString()

  const { error } = await supabaseAdmin.from("email_jobs").insert({
    type,
    payload,
    status: "pending",
    scheduled_at: scheduledAt,
  })

  if (error) {
    console.error(`[enqueueEmailJob] Falha ao enfileirar ${type}:`, error.message)
  }
}

// ── processar (usado pelo worker) ─────────────────────────────────

export interface PendingEmailJob {
  id: string
  type: EmailJobType
  payload: EmailJobPayload
  retries: number
  max_retries: number
}

export async function fetchPendingJobs(limit = 10): Promise<PendingEmailJob[]> {
  const supabaseAdmin = getAdminClient()

  const { data, error } = await supabaseAdmin
    .from("email_jobs")
    .select("id, type, payload, retries, max_retries")
    .eq("status", "pending")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("[fetchPendingJobs]", error.message)
    return []
  }

  return (data ?? []) as PendingEmailJob[]
}

export async function markJobSent(id: string): Promise<void> {
  const supabaseAdmin = getAdminClient()
  await supabaseAdmin
    .from("email_jobs")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
}

export async function markJobFailed(id: string, error: string, retries: number, maxRetries: number): Promise<void> {
  const supabaseAdmin = getAdminClient()

  if (retries + 1 >= maxRetries) {
    await supabaseAdmin
      .from("email_jobs")
      .update({ status: "failed", error, retries: retries + 1 })
      .eq("id", id)
  } else {
    // retry com backoff exponencial (30s, 2min, 10min)
    const backoffSeconds = 30 * Math.pow(4, retries)
    const nextAt = new Date(Date.now() + backoffSeconds * 1000).toISOString()
    await supabaseAdmin
      .from("email_jobs")
      .update({ status: "pending", error, retries: retries + 1, scheduled_at: nextAt })
      .eq("id", id)
  }
}
