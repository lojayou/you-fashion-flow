
-- Adicionar coluna de senha na tabela profiles
ALTER TABLE public.profiles ADD COLUMN password TEXT;

-- Criar índice para melhorar performance em consultas por email (usado no login)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Adicionar constraint para garantir que senhas não sejam vazias quando preenchidas
ALTER TABLE public.profiles ADD CONSTRAINT check_password_not_empty 
  CHECK (password IS NULL OR length(trim(password)) > 0);
