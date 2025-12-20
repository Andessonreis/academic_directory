'use server'

import { createClient } from '@supabase/supabase-js'

export interface ManifestacaoData {
  tipo: 'reclamacao' | 'sugestao' | 'denuncia' | 'elogio'
  conteudo: string
  anonimo: boolean
  nome?: string
  email?: string
}

export async function enviarManifestacao(data: ManifestacaoData) {
  try {
    if (!data.tipo || !data.conteudo) {
      return {
        success: false,
        error: 'Tipo e conteúdo são obrigatórios',
      }
    }

    if (data.conteudo.length < 10) {
      return {
        success: false,
        error: 'A mensagem deve ter pelo menos 10 caracteres',
      }
    }

    if (data.conteudo.length > 2000) {
      return {
        success: false,
        error: 'A mensagem não pode ter mais de 2000 caracteres',
      }
    }

    if (!data.anonimo && !data.nome) {
      return {
        success: false,
        error: 'Nome é obrigatório quando não for anônimo',
      }
    }

    if (data.email && !isValidEmail(data.email)) {
      return {
        success: false,
        error: 'E-mail inválido',
      }
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const { data: manifestacao, error } = await supabaseAdmin
      .from('manifestacoes')
      .insert([
        {
          tipo: data.tipo,
          conteudo: data.conteudo.trim(),
          anonimo: data.anonimo,
          nome: data.anonimo ? null : data.nome?.trim() || null,
          email: data.email?.trim() || null,
          status: 'pendente',
        },
      ])
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: 'Erro ao enviar manifestação. Tente novamente mais tarde.',
      }
    }

    return {
      success: true,
      data: manifestacao,
    }
  } catch (error) {
    return {
      success: false,
      error: 'Erro ao processar sua solicitação. Tente novamente mais tarde.',
    }
  }
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
