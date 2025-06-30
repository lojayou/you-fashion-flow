
-- Remove as colunas de arrays e adiciona campos de texto simples
ALTER TABLE products DROP COLUMN IF EXISTS colors;
ALTER TABLE products DROP COLUMN IF EXISTS sizes;
ALTER TABLE products ADD COLUMN IF NOT EXISTS color text;
ALTER TABLE products ADD COLUMN IF NOT EXISTS size text;
