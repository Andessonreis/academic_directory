'use server'

import { createClient } from '@supabase/supabase-js'
import { onFeedbackAnswered } from '@/services/notifications/events'

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )
}

export interface UpdateFeedbackStatusParams {
  id: string
  status: 'pendente' | 'lido' | 'respondido' | 'arquivado'
  /** Mensagem opcional do admin, incluída no e-mail ao marcar como respondido */
  adminMessage?: string
}

/**
 * Atualiza o status de uma manifestação.
 * Quando status = "respondido" e o aluno tem e-mail identificado,
 * enfileira o e-mail "feedback.answered" automaticamente.
 */
export async function updateFeedbackStatus(params: UpdateFeedbackStatusParams) {
  const supabaseAdmin = getAdminClient()

  // Busca o registro completo para ter dados do aluno
  const { data: manifestacao, error: fetchError } = await supabaseAdmin
    .from('manifestacoes')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !manifestacao) {
    return { success: false, error: 'Manifestação não encontrada' }
  }

  const { error: updateError } = await supabaseAdmin
    .from('manifestacoes')
    .update({ status: params.status })
    .eq('id', params.id)

  if (updateError) {
    return { success: false, error: updateError.message }
  }

  // Notifica o aluno apenas ao marcar como respondido (e se tiver e-mail)
  if (
    params.status === 'respondido' &&
    !manifestacao.anonimo &&
    manifestacao.email &&
    manifestacao.nome
  ) {
    void onFeedbackAnswered({
      nome: manifestacao.nome,
      email: manifestacao.email,
      tipo: manifestacao.tipo,
      conteudo: manifestacao.conteudo,
      adminMessage: params.adminMessage,
    })
  }

  return { success: true }
}
