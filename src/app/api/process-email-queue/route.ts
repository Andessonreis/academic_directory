/**
 * Worker de e-mails — GET /api/process-email-queue
 *
 * Chamado por um cron job (ex: Vercel Cron, GitHub Actions, pg_cron).
 * Protegido por Authorization: Bearer <CRON_SECRET>.
 *
 * Exemplo de configuração no vercel.json:
 * {
 *   "crons": [{ "path": "/api/process-email-queue", "schedule": "* * * * *" }]
 * }
 *
 * Variáveis de ambiente necessárias:
 *   CRON_SECRET        — segredo compartilhado com o scheduler
 *   RESEND_API_KEY     — chave da API do Resend
 *   FROM_EMAIL         — remetente (ex: "DA IFBA <noreply@daifba.com.br>")
 *   DA_EMAIL           — e-mail da equipe do DA
 */

import { type NextRequest, NextResponse } from "next/server"
import { fetchPendingJobs, markJobSent, markJobFailed } from "@/services/notifications/queue"
import { sendEmail } from "@/services/notifications/send-email"
import { feedbackNewAdminTemplate, type FeedbackNewAdminPayload } from "@/services/notifications/templates/feedback-new-admin"
import { feedbackReceivedTemplate, type FeedbackReceivedPayload } from "@/services/notifications/templates/feedback-received"
import { feedbackAnsweredTemplate, type FeedbackAnsweredPayload } from "@/services/notifications/templates/feedback-answered"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // ── Autenticação ───────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = req.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  // ── Busca jobs pendentes ───────────────────────────────────
  const jobs = await fetchPendingJobs(10)

  if (jobs.length === 0) {
    return NextResponse.json({ processed: 0, message: "Nenhum job pendente" })
  }

  const results: { id: string; type: string; status: "sent" | "failed" | "skipped"; error?: string }[] = []

  for (const job of jobs) {
    try {
      const { subject, html } = resolveTemplate(job.type, job.payload)
      const to = job.payload.to as string

      if (!to || !subject || !html) {
        await markJobFailed(job.id, "Template ou destinatário inválido", job.retries, job.max_retries)
        results.push({ id: job.id, type: job.type, status: "failed", error: "invalid template/to" })
        continue
      }

      const result = await sendEmail({ to, subject, html })

      if (result.success) {
        await markJobSent(job.id)
        results.push({ id: job.id, type: job.type, status: "sent" })
      } else {
        await markJobFailed(job.id, result.error ?? "Resend error", job.retries, job.max_retries)
        results.push({ id: job.id, type: job.type, status: "failed", error: result.error })
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      await markJobFailed(job.id, msg, job.retries, job.max_retries)
      results.push({ id: job.id, type: job.type, status: "failed", error: msg })
    }
  }

  return NextResponse.json({ processed: jobs.length, results })
}

// ── Resolução de template ──────────────────────────────────────────

function resolveTemplate(
  type: string,
  payload: Record<string, unknown>,
): { subject: string; html: string } {
  switch (type) {
    case "feedback.new-admin":
      return feedbackNewAdminTemplate(payload as unknown as FeedbackNewAdminPayload)

    case "feedback.received":
      return feedbackReceivedTemplate(payload as unknown as FeedbackReceivedPayload)

    case "feedback.answered":
      return feedbackAnsweredTemplate(payload as unknown as FeedbackAnsweredPayload)

    default:
      throw new Error(`Tipo de job desconhecido: ${type}`)
  }
}
