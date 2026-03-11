-- ============================================================
-- Email Jobs Queue
-- Executa este script no Supabase SQL Editor (uma única vez)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.email_jobs (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  type         TEXT         NOT NULL,
  payload      JSONB        NOT NULL,
  status       TEXT         NOT NULL DEFAULT 'pending'
                             CHECK (status IN ('pending', 'processing', 'sent', 'failed')),
  retries      INT          NOT NULL DEFAULT 0,
  max_retries  INT          NOT NULL DEFAULT 3,
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at      TIMESTAMPTZ,
  error        TEXT
);

-- Índice para o worker buscar jobs pendentes de forma eficiente
CREATE INDEX IF NOT EXISTS email_jobs_pending_idx
  ON public.email_jobs (status, scheduled_at)
  WHERE status = 'pending';

-- Política RLS: somente service_role pode ler/escrever
ALTER TABLE public.email_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role only" ON public.email_jobs
  USING (auth.role() = 'service_role');

-- ============================================================
-- Tipos de jobs usados atualmente:
--   feedback.new-admin     → notifica a equipe DA sobre nova manifestação
--   feedback.received      → confirma ao aluno que a mensagem foi recebida
--   feedback.answered      → notifica o aluno que sua manifestação foi respondida
-- ============================================================
