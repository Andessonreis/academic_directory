// ─────────────────────────────────────────────────────────────
//  Template: feedback.answered
//  Destinatário: aluno
//  Disparado: quando admin marca manifestação como "respondido"
// ─────────────────────────────────────────────────────────────

export interface FeedbackAnsweredPayload {
  nome: string
  tipo: string
  conteudo: string
  adminMessage?: string
}

const TIPO_LABELS: Record<string, string> = {
  reclamacao: "Reclamação",
  sugestao: "Sugestão",
  denuncia: "Denúncia",
  elogio: "Elogio",
}

export function feedbackAnsweredTemplate(payload: FeedbackAnsweredPayload): {
  subject: string
  html: string
} {
  const tipoLabel = TIPO_LABELS[payload.tipo] ?? payload.tipo

  return {
    subject: `Sua ${tipoLabel} foi respondida — DA IFBA Irecê`,
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
              DA IFBA Irecê
            </p>
            <h1 style="margin:8px 0 0;font-size:22px;font-weight:700;color:#fff;">
              Sua ${tipoLabel} foi <span style="color:#a78bfa;">respondida ✓</span>
            </h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 20px;font-size:15px;color:#d4d4d4;line-height:1.6;">
              Olá, <strong>${escapeHtml(payload.nome)}</strong>!
            </p>
            <p style="margin:0 0 24px;font-size:15px;color:#a3a3a3;line-height:1.7;">
              A equipe do Diretório Acadêmico analisou sua <strong style="color:#e5e5e5;">${tipoLabel}</strong>
              e ela foi marcada como respondida.
            </p>

            ${payload.adminMessage
        ? `
            <!-- Resposta da equipe -->
            <div style="background:#1e1b4b;border:1px solid #3730a3;border-radius:10px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 8px;font-size:11px;color:#818cf8;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
                Resposta da equipe
              </p>
              <p style="margin:0;font-size:15px;color:#c7d2fe;line-height:1.7;white-space:pre-wrap;">${escapeHtml(payload.adminMessage)}</p>
            </div>`
        : ""
      }

            <!-- Mensagem original -->
            <div style="background:#111;border:1px solid #2a2a2a;border-radius:10px;padding:20px;margin-bottom:24px;">
              <p style="margin:0 0 6px;font-size:11px;color:#666;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;">
                Sua mensagem original
              </p>
              <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.65;white-space:pre-wrap;">${escapeHtml(payload.conteudo)}</p>
            </div>

            <p style="margin:0;font-size:14px;color:#555;line-height:1.6;">
              Obrigado por contribuir com a melhoria do nosso campus.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;border-top:1px solid #2a2a2a;background:#141414;">
            <p style="margin:0;font-size:12px;color:#444;">
              Diretório Acadêmico · IFBA Campus Irecê<br />
              Este é um e-mail automático, não responda diretamente a ele.
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
