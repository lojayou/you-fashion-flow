
-- Adicionar coluna product_code na tabela products
ALTER TABLE public.products 
ADD COLUMN product_code TEXT;

-- Criar índice para melhorar performance de busca por código do produto
CREATE INDEX idx_products_product_code ON public.products(product_code);
