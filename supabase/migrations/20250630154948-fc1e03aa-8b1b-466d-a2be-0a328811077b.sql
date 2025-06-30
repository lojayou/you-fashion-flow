
-- Ajustar a tabela profiles para permitir inserção de novos usuários
-- Primeiro, verificar se o id é auto-gerado
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Habilitar RLS se não estiver habilitado
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver conflito
DROP POLICY IF EXISTS "Allow all to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all to update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all to delete profiles" ON public.profiles;

-- Criar políticas para permitir operações na tabela profiles
-- (considerando que este é um sistema administrativo)
CREATE POLICY "Allow all to view profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (true);

CREATE POLICY "Allow all to insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Allow all to update profiles" 
  ON public.profiles 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Allow all to delete profiles" 
  ON public.profiles 
  FOR DELETE 
  USING (true);
