-- =====================================================
-- TABELA DE PERFIS (Autenticação e Autorização)
-- =====================================================

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'User',
  account_type text NOT NULL DEFAULT 'standard'
    CHECK (account_type IN ('standard', 'admin', 'service')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários autenticados podem ler perfis"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Usuários podem editar seu próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);


-- Função para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_name text;
BEGIN
  user_name := COALESCE(
    new.raw_user_meta_data->>'name',
    'User'
  );

  INSERT INTO public.profiles (id, name, account_type)
  VALUES (
    new.id,
    user_name,
    'standard'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Setar admin (ajuste o email conforme necessário)
UPDATE public.profiles
SET account_type = 'admin'
WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@da.com');


-- =====================================================
-- POLÍTICA DE STORAGE (Upload de arquivos)
-- =====================================================

CREATE POLICY "Allow authenticated users to upload files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (true);


-- =====================================================
-- TABELA DE EVENTOS
-- =====================================================

CREATE TABLE public.events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

    title text NOT NULL,
    description text,
    long_description text,

    event_type text NOT NULL DEFAULT 'workshop'
        CHECK (event_type IN ('workshop', 'palestra', 'festa', 'viagem', 'deadline', 'social')),
    category text NOT NULL
        CHECK (category IN ('workshop', 'palestra', 'festa', 'viagem', 'deadline', 'social')),

    event_date date NOT NULL,
    event_time time without time zone,
    end_date date,
    end_time time without time zone,

    location text,
    image_url text,
    is_featured boolean NOT NULL DEFAULT false,

    status text NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),

    created_at timestamp with time zone NOT NULL DEFAULT now(),

    CHECK (
        end_date IS NULL
        OR end_date >= event_date
    ),
    CHECK (
        (end_date IS NULL OR end_date > event_date)
        OR (
            end_date = event_date
            AND (
                end_time IS NULL
                OR event_time IS NULL
                OR end_time >= event_time
            )
        )
    )
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to events"
ON public.events
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND account_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND account_type = 'admin'
    )
);

CREATE POLICY "Public read published events"
ON public.events
FOR SELECT
USING (status = 'published');

CREATE INDEX idx_events_status ON public.events(status);
CREATE INDEX idx_events_date ON public.events(event_date DESC);


-- =====================================================
-- TABELA DE MEMBROS DO TIME
-- =====================================================

CREATE TABLE public.team_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    name text NOT NULL,
    role text NOT NULL,
    bio text,
    image_url text,
    linkedin_url text,
    github_url text,
    email text CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),

    is_active boolean NOT NULL DEFAULT true,
    display_order integer NOT NULL DEFAULT 0 CHECK (display_order >= 0),

    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to team"
ON public.team_members
FOR ALL
USING (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND account_type = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.profiles
        WHERE id = auth.uid()
        AND account_type = 'admin'
    )
);

CREATE POLICY "Public read active team members"
ON public.team_members
FOR SELECT
USING (is_active = true);

CREATE POLICY "Authenticated can upload team images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');

CREATE POLICY "Public read team images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

CREATE INDEX idx_team_members_active ON public.team_members(is_active);
CREATE INDEX idx_team_members_order ON public.team_members(display_order);


-- =====================================================
-- TABELA DE LINKS DA COMUNIDADE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.community_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('whatsapp', 'discord', 'telegram', 'clube', 'outro')),
  category TEXT NOT NULL
    CHECK (category IN ('Turmas', 'Campus', 'Clubes de Estudo')),
  icon TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_links_active ON public.community_links(is_active);
CREATE INDEX IF NOT EXISTS idx_community_links_type ON public.community_links(type);
CREATE INDEX IF NOT EXISTS idx_community_links_category ON public.community_links(category);
CREATE INDEX IF NOT EXISTS idx_community_links_order ON public.community_links(display_order);

ALTER TABLE public.community_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver links ativos"
  ON public.community_links FOR SELECT
  USING (is_active = true);

CREATE POLICY "Apenas admin pode modificar links"
  ON public.community_links FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND account_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = auth.uid()
      AND account_type = 'admin'
    )
  );

-- Dados de exemplo
INSERT INTO public.community_links (title, description, url, type, category, display_order) VALUES
  ('Turma ADS 2023.1', 'Grupo oficial da turma de Análise e Desenvolvimento de Sistemas', 'https://chat.whatsapp.com/example1', 'whatsapp', 'Turmas', 1),
  ('Turma Mecânica 2024', 'Grupo da turma de Engenharia Mecânica', 'https://chat.whatsapp.com/example2', 'whatsapp', 'Turmas', 2),
  ('Discord IFBA Campus', 'Servidor oficial do campus no Discord', 'https://discord.gg/example', 'discord', 'Campus', 3),
  ('Clube de Programação', 'Encontros semanais para estudar e desenvolver projetos', 'https://chat.whatsapp.com/example3', 'whatsapp', 'Clubes de Estudo', 4),
  ('Clube de Robótica', 'Desenvolvimento de projetos de automação e robótica', 'https://t.me/example', 'telegram', 'Clubes de Estudo', 5);
