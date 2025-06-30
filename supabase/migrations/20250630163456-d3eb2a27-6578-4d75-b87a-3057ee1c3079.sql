
-- Remover as políticas RLS existentes da tabela products
DROP POLICY IF EXISTS "Authenticated users can view products" ON public.products;

-- Desabilitar RLS na tabela products
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
