
-- Criar política para permitir que todos possam inserir pedidos
CREATE POLICY "Allow all to insert orders" 
  ON public.orders 
  FOR INSERT 
  WITH CHECK (true);

-- Criar política para permitir que todos possam atualizar pedidos
CREATE POLICY "Allow all to update orders" 
  ON public.orders 
  FOR UPDATE 
  USING (true);

-- Criar política para permitir que todos possam deletar pedidos
CREATE POLICY "Allow all to delete orders" 
  ON public.orders 
  FOR DELETE 
  USING (true);
