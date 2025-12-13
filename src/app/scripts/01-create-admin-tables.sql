-- Tabela de Eventos
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT NOT NULL,
  category TEXT NOT NULL,
  category_color TEXT NOT NULL CHECK (category_color IN ('purple', 'pink', 'blue', 'green', 'orange')),
  image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending', 'active')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Membros do Time
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  image TEXT,
  linkedin TEXT,
  github TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Eventos do Calendário Acadêmico
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  weekday TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('deadline', 'event')),
  description TEXT NOT NULL,
  time TEXT,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_display_order ON team_members(display_order);
CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON calendar_events(date);

-- RLS (Row Level Security)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Políticas: todos podem ler, apenas autenticados podem modificar
CREATE POLICY "Todos podem ler eventos" ON events FOR SELECT USING (true);
CREATE POLICY "Apenas autenticados podem inserir eventos" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Apenas autenticados podem atualizar eventos" ON events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Apenas autenticados podem deletar eventos" ON events FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Todos podem ler membros do time" ON team_members FOR SELECT USING (true);
CREATE POLICY "Apenas autenticados podem inserir membros" ON team_members FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Apenas autenticados podem atualizar membros" ON team_members FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Apenas autenticados podem deletar membros" ON team_members FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Todos podem ler eventos do calendário" ON calendar_events FOR SELECT USING (true);
CREATE POLICY "Apenas autenticados podem inserir eventos do calendário" ON calendar_events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Apenas autenticados podem atualizar eventos do calendário" ON calendar_events FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Apenas autenticados podem deletar eventos do calendário" ON calendar_events FOR DELETE USING (auth.role() = 'authenticated');
