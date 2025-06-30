
-- Adicionar colunas de categoria e marca como texto na tabela products
ALTER TABLE public.products 
ADD COLUMN category TEXT,
ADD COLUMN brand TEXT;

-- Copiar dados das tabelas relacionadas para as novas colunas (se houver dados)
UPDATE public.products 
SET category = categories.name 
FROM public.categories 
WHERE products.category_id = categories.id;

UPDATE public.products 
SET brand = brands.name 
FROM public.brands 
WHERE products.brand_id = brands.id;

-- Remover as foreign key constraints
ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_category_id_fkey;

ALTER TABLE public.products 
DROP CONSTRAINT IF EXISTS products_brand_id_fkey;

-- Remover as colunas de chave estrangeira
ALTER TABLE public.products 
DROP COLUMN IF EXISTS category_id;

ALTER TABLE public.products 
DROP COLUMN IF EXISTS brand_id;

-- Opcionalmente, remover as tabelas categories e brands se não estiverem sendo usadas
DROP TABLE IF EXISTS public.categories;
DROP TABLE IF EXISTS public.brands;
