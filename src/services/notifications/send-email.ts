import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const FROM_EMAIL =
  process.env.FROM_EMAIL ?? "DA IFBA Irecê <noreply@daifba.com.br>"

export interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

/**
 * Envia um e-mail via Resend.
 * Retorna { success, error }.
 * Nunca lança exceção — erros são logados e retornados.
 */
export async function sendEmail(opts: SendEmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[sendEmail] RESEND_API_KEY não configurada — e-mail não enviado.")
    return { success: false, error: "RESEND_API_KEY não configurada" }
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })

    if (error) {
      console.error("[sendEmail] Resend error:", error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[sendEmail] Unexpected error:", msg)
    return { success: false, error: msg }
  }
}
