
-- Remover a constraint de chave estrangeira que está causando o problema
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Alterar a coluna id para não referenciar auth.users
-- Garantir que o id seja gerado automaticamente
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Garantir que as políticas RLS estão corretas
DROP POLICY IF EXISTS "Allow all to view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all to insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all to update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all to delete profiles" ON public.profiles;

-- Recriar políticas mais permissivas para o sistema administrativo
CREATE POLICY "Allow all operations on profiles" 
  ON public.profiles 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
