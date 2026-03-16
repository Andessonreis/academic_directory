// ─────────────────────────────────────────────────────────────
//  Template: feedback.new-admin
//  Destinatário: equipe do DA
//  Disparado: quando um aluno envia uma manifestação
// ─────────────────────────────────────────────────────────────

export interface FeedbackNewAdminPayload {
  feedbackId: string
  tipo: string
  conteudo: string
  anonimo: boolean
  nome: string | null
  email: string | null
  createdAt: string
}

const TIPO_LABELS: Record<string, string> = {
  reclamacao: "Reclamação",
  sugestao: "Sugestão",
  denuncia: "Denúncia",
  elogio: "Elogio",
}

const TIPO_COLORS: Record<string, string> = {
  reclamacao: "#ef4444",
  sugestao: "#eab308",
  denuncia: "#f97316",
  elogio: "#22c55e",
}

export function feedbackNewAdminTemplate(payload: FeedbackNewAdminPayload): {
  subject: string
  html: string
} {
  const tipoLabel = TIPO_LABELS[payload.tipo] ?? payload.tipo
  const tipoColor = TIPO_COLORS[payload.tipo] ?? "#6b7280"
  const from = payload.anonimo
    ? "Anônimo"
    : `${payload.nome ?? "Não informado"}${payload.email ? ` (${payload.email})` : ""}`
  const date = new Date(payload.createdAt).toLocaleString("pt-BR")

  return {
    subject: `[DA IFBA] Nova ${tipoLabel} recebida`,
    html: `
<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /></head>
<body style="margin:0;padding:0;background:#0f0f0f;font-family:Arial,sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid #2a2a2a;overflow:hidden;max-width:600px;">
        <!-- Header -->
        <tr>
          <td style="background:#141414;padding:24px 32px;border-bottom:1px solid #2a2a2a;">
            <p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.15em;color:#666;text-transform:uppercase;">
              DA IFBA Irecê · Painel Interno
            </p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;">
              Nova <span style="color:${tipoColor};">${tipoLabel}</span> recebida
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <!-- Tipo badge -->
            <p style="margin:0 0 24px;">
              <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${tipoColor}22;border:1px solid ${tipoColor}44;color:${tipoColor};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                ${tipoLabel}
              </span>
            </p>

            <!-- Message -->
            <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Mensagem</p>
              <p style="margin:0;font-size:15px;color:#d4d4d4;line-height:1.7;white-space:pre-wrap;">${escapeHtml(payload.conteudo)}</p>
            </div>

            <!-- Meta -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:0 0 12px;">
                  <p style="margin:0;font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">De</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#d4d4d4;">${escapeHtml(from)}</p>
                </td>
              </tr>
              <tr>
                <td style="padding:0 0 12px;">
                  <p style="margin:0;font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">Data</p>
                  <p style="margin:4px 0 0;font-size:14px;color:#d4d4d4;">${date}</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style="margin:0;font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">ID</p>
                  <p style="margin:4px 0 0;font-size:12px;color:#555;font-family:monospace;">${payload.feedbackId}</p>
                </td>
              </tr>
            </table>

            <!-- CTA -->
            ${!payload.anonimo && payload.email
        ? `<div style="margin-top:28px;padding-top:24px;border-top:1px solid #2a2a2a;">
                <a href="mailto:${payload.email}?subject=${encodeURIComponent(`Re: ${tipoLabel} — DA IFBA Irecê`)}"
                   style="display:inline-block;padding:12px 24px;background:#3b82f6;color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
                  Responder por e-mail
                </a>
              </div>`
        : ""
      }
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a2a;background:#141414;">
            <p style="margin:0;font-size:12px;color:#444;">
              Este e-mail foi gerado automaticamente pelo sistema DA IFBA Irecê.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
    `.trim(),
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}
