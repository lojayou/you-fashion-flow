
-- Desabilitar temporariamente o Row Level Security na tabela orders
-- para permitir que os pedidos sejam salvos sem autenticação
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;

-- Também desabilitar nas tabelas relacionadas para consistência
ALTER TABLE public.order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditionals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditional_items DISABLE ROW LEVEL SECURITY;
