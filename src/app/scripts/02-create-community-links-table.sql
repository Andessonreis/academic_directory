-- Tabela para links da comunidade (WhatsApp, Discord, Clubes, etc)
CREATE TABLE IF NOT EXISTS community_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'discord', 'telegram', 'clube', 'outro')),
  category TEXT NOT NULL, -- Ex: "Turma ADS 2023", "Clube de Programação"
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_community_links_active ON community_links(is_active);
CREATE INDEX IF NOT EXISTS idx_community_links_type ON community_links(type);
CREATE INDEX IF NOT EXISTS idx_community_links_order ON community_links(display_order);

-- RLS (Row Level Security)
ALTER TABLE community_links ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer usuário pode ler links ativos
CREATE POLICY "Qualquer um pode ver links ativos"
  ON community_links FOR SELECT
  USING (is_active = true);

-- Política: Apenas admin pode inserir/atualizar/deletar
CREATE POLICY "Apenas admin pode modificar links"
  ON community_links FOR ALL
  USING (auth.uid() IN (
    SELECT user_id FROM admin_users WHERE is_active = true
  ));

-- Dados de exemplo
INSERT INTO community_links (title, description, url, type, category, display_order) VALUES
  ('Turma ADS 2023.1', 'Grupo oficial da turma de Análise e Desenvolvimento de Sistemas', 'https://chat.whatsapp.com/example1', 'whatsapp', 'Turmas', 1),
  ('Turma Mecânica 2024', 'Grupo da turma de Engenharia Mecânica', 'https://chat.whatsapp.com/example2', 'whatsapp', 'Turmas', 2),
  ('Discord IFBA Campus', 'Servidor oficial do campus no Discord', 'https://discord.gg/example', 'discord', 'Campus', 3),
  ('Clube de Programação', 'Encontros semanais para estudar e desenvolver projetos', 'https://chat.whatsapp.com/example3', 'whatsapp', 'Clubes de Estudo', 4),
  ('Clube de Robótica', 'Desenvolvimento de projetos de automação e robótica', 'https://t.me/example', 'telegram', 'Clubes de Estudo', 5);
