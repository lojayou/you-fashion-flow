
-- Habilitar RLS na tabela customers se ainda não estiver habilitado
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Criar política para permitir que todos possam visualizar clientes
-- (considerando que este é um sistema de PDV onde vendedores precisam acessar dados de clientes)
CREATE POLICY "Allow all to view customers" 
  ON public.customers 
  FOR SELECT 
  USING (true);

-- Criar política para permitir que todos possam inserir clientes
CREATE POLICY "Allow all to insert customers" 
  ON public.customers 
  FOR INSERT 
  WITH CHECK (true);

-- Criar política para permitir que todos possam atualizar clientes
CREATE POLICY "Allow all to update customers" 
  ON public.customers 
  FOR UPDATE 
  USING (true);

-- Criar política para permitir que todos possam deletar clientes
CREATE POLICY "Allow all to delete customers" 
  ON public.customers 
  FOR DELETE 
  USING (true);
