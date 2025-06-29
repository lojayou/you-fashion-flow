
-- Criar enum para status de usuário
CREATE TYPE user_status AS ENUM ('active', 'blocked');

-- Criar enum para perfis de usuário
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'seller', 'cashier');

-- Criar enum para status de pedidos
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled');

-- Criar enum para status de produtos
CREATE TYPE product_status AS ENUM ('active', 'inactive');

-- Criar enum para status de condicionais
CREATE TYPE conditional_status AS ENUM ('active', 'overdue', 'returned', 'sold');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  status user_status DEFAULT 'active',
  role user_role DEFAULT 'seller',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de categorias
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de marcas
CREATE TABLE public.brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT NOT NULL UNIQUE,
  description TEXT,
  category_id UUID REFERENCES public.categories(id),
  brand_id UUID REFERENCES public.brands(id),
  sale_price DECIMAL(10,2) NOT NULL,
  cost_price DECIMAL(10,2),
  stock INTEGER DEFAULT 0,
  min_stock INTEGER DEFAULT 5,
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  status product_status DEFAULT 'active',
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de clientes
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  cpf TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT,
  status order_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens do pedido
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  size TEXT,
  color TEXT
);

-- Tabela de condicionais
CREATE TABLE public.conditionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  total_value DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  status conditional_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de itens condicionais
CREATE TABLE public.conditional_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conditional_id UUID REFERENCES public.conditionals(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  size TEXT,
  color TEXT
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conditional_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS básicas (permitir acesso autenticado)
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view categories" ON public.categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view brands" ON public.brands FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view products" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view order_items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view conditionals" ON public.conditionals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can view conditional_items" ON public.conditional_items FOR SELECT TO authenticated USING (true);

-- Inserir dados de teste

-- Categorias
INSERT INTO public.categories (name, description) VALUES
('Blusas', 'Blusas femininas variadas'),
('Calças', 'Calças e leggings'),
('Vestidos', 'Vestidos para todas as ocasiões'),
('Saias', 'Saias longas e curtas'),
('Blazers', 'Blazers executivos e casuais');

-- Marcas
INSERT INTO public.brands (name) VALUES
('Fashion Style'),
('Denim Co'),
('Elegance'),
('Executive'),
('Casual Wear');

-- Produtos (corrigido para incluir todas as colunas necessárias)
INSERT INTO public.products (name, sku, description, category_id, brand_id, sale_price, cost_price, stock, min_stock, sizes, colors, featured) 
SELECT 
  'Blusa Elegante Social',
  'BLS001',
  'Blusa social elegante para uso profissional',
  c.id,
  b.id,
  89.90,
  45.00,
  3,
  5,
  ARRAY['P', 'M', 'G'],
  ARRAY['Branco', 'Azul', 'Preto'],
  true
FROM public.categories c, public.brands b 
WHERE c.name = 'Blusas' AND b.name = 'Fashion Style';

INSERT INTO public.products (name, sku, description, category_id, brand_id, sale_price, cost_price, stock, min_stock, sizes, colors, featured) 
SELECT 
  'Calça Jeans Skinny',
  'CJN002',
  'Calça jeans modelo skinny, corte moderno',
  c.id,
  b.id,
  129.90,
  65.00,
  8,
  5,
  ARRAY['36', '38', '40', '42'],
  ARRAY['Azul', 'Preto'],
  false
FROM public.categories c, public.brands b 
WHERE c.name = 'Calças' AND b.name = 'Denim Co';

INSERT INTO public.products (name, sku, description, category_id, brand_id, sale_price, cost_price, stock, min_stock, sizes, colors, featured) 
SELECT 
  'Vestido Festa Longo',
  'VFL003',
  'Vestido longo para festas e eventos especiais',
  c.id,
  b.id,
  199.90,
  95.00,
  2,
  3,
  ARRAY['P', 'M', 'G'],
  ARRAY['Vermelho', 'Azul Marinho', 'Preto'],
  true
FROM public.categories c, public.brands b 
WHERE c.name = 'Vestidos' AND b.name = 'Elegance';

INSERT INTO public.products (name, sku, description, category_id, brand_id, sale_price, cost_price, stock, min_stock, sizes, colors, featured) 
SELECT 
  'Saia Midi Plissada',
  'SMP004',
  'Saia midi com pregas, versatil para várias ocasiões',
  c.id,
  b.id,
  79.90,
  38.00,
  12,
  5,
  ARRAY['P', 'M', 'G', 'GG'],
  ARRAY['Bege', 'Preto', 'Marinho'],
  false
FROM public.categories c, public.brands b 
WHERE c.name = 'Saias' AND b.name = 'Fashion Style';

INSERT INTO public.products (name, sku, description, category_id, brand_id, sale_price, cost_price, stock, min_stock, sizes, colors, status, featured) 
SELECT 
  'Blazer Executivo',
  'BLZ005',
  'Blazer executivo para look profissional',
  c.id,
  b.id,
  159.90,
  78.00,
  0,
  3,
  ARRAY['P', 'M', 'G'],
  ARRAY['Preto', 'Cinza'],
  'inactive',
  false
FROM public.categories c, public.brands b 
WHERE c.name = 'Blazers' AND b.name = 'Executive';

-- Clientes
INSERT INTO public.customers (name, email, phone, cpf, address, city, state, zip_code) VALUES
('Maria Silva Santos', 'maria.silva@email.com', '(11) 99999-9999', '123.456.789-00', 'Rua das Flores, 123', 'São Paulo', 'SP', '01234-567'),
('Ana Costa Oliveira', 'ana.costa@email.com', '(11) 98888-8888', '987.654.321-00', 'Av. Paulista, 456', 'São Paulo', 'SP', '01310-100'),
('Julia Santos Lima', 'julia.santos@email.com', '(11) 97777-7777', '456.789.123-00', 'Rua Augusta, 789', 'São Paulo', 'SP', '01305-000'),
('Carla Ferreira', 'carla.ferreira@email.com', '(11) 96666-6666', '321.654.987-00', 'Rua Oscar Freire, 321', 'São Paulo', 'SP', '01426-001'),
('Beatriz Almeida', 'beatriz.almeida@email.com', '(11) 95555-5555', '654.321.987-00', 'Av. Faria Lima, 654', 'São Paulo', 'SP', '01452-000');

-- Pedidos
INSERT INTO public.orders (order_number, customer_id, customer_name, customer_phone, total_amount, payment_method, status, created_at) 
SELECT 
  'PED001',
  c.id,
  c.name,
  c.phone,
  219.80,
  'Cartão de Crédito',
  'delivered',
  NOW() - INTERVAL '2 days'
FROM public.customers c WHERE c.name = 'Maria Silva Santos';

INSERT INTO public.orders (order_number, customer_id, customer_name, customer_phone, total_amount, payment_method, status, created_at) 
SELECT 
  'PED002',
  c.id,
  c.name,
  c.phone,
  129.90,
  'PIX',
  'shipped',
  NOW() - INTERVAL '1 day'
FROM public.customers c WHERE c.name = 'Ana Costa Oliveira';

INSERT INTO public.orders (order_number, customer_id, customer_name, customer_phone, total_amount, payment_method, status, created_at) 
SELECT 
  'PED003',
  c.id,
  c.name,
  c.phone,
  399.80,
  'Dinheiro',
  'confirmed',
  NOW() - INTERVAL '3 hours'
FROM public.customers c WHERE c.name = 'Julia Santos Lima';

-- Itens dos pedidos
INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, total_price, size, color)
SELECT 
  o.id,
  p.id,
  p.name,
  2,
  p.sale_price,
  p.sale_price * 2,
  'M',
  'Branco'
FROM public.orders o, public.products p 
WHERE o.order_number = 'PED001' AND p.sku = 'BLS001';

INSERT INTO public.order_items (order_id, product_id, product_name, quantity, unit_price, total_price, size, color)
SELECT 
  o.id,
  p.id,
  p.name,
  1,
  p.sale_price,
  p.sale_price,
  'P',
  'Bege'
FROM public.orders o, public.products p 
WHERE o.order_number = 'PED001' AND p.sku = 'SMP004';

-- Condicionais
INSERT INTO public.conditionals (customer_id, customer_name, customer_phone, total_value, due_date, status, created_at)
SELECT 
  c.id,
  c.name,
  c.phone,
  450.00,
  CURRENT_DATE + INTERVAL '7 days',
  'active',
  NOW() - INTERVAL '2 days'
FROM public.customers c WHERE c.name = 'Maria Silva Santos';

INSERT INTO public.conditionals (customer_id, customer_name, customer_phone, total_value, due_date, status, created_at)
SELECT 
  c.id,
  c.name,
  c.phone,
  320.00,
  CURRENT_DATE - INTERVAL '1 day',
  'overdue',
  NOW() - INTERVAL '5 days'
FROM public.customers c WHERE c.name = 'Ana Costa Oliveira';

INSERT INTO public.conditionals (customer_id, customer_name, customer_phone, total_value, due_date, status, created_at)
SELECT 
  c.id,
  c.name,
  c.phone,
  680.00,
  CURRENT_DATE + INTERVAL '10 days',
  'active',
  NOW() - INTERVAL '1 day'
FROM public.customers c WHERE c.name = 'Julia Santos Lima';

-- Itens condicionais
INSERT INTO public.conditional_items (conditional_id, product_id, product_name, quantity, unit_price, size, color)
SELECT 
  con.id,
  p.id,
  p.name,
  3,
  p.sale_price,
  'M',
  'Azul'
FROM public.conditionals con, public.products p, public.customers c
WHERE con.customer_id = c.id AND c.name = 'Maria Silva Santos' AND p.sku = 'BLS001';

INSERT INTO public.conditional_items (conditional_id, product_id, product_name, quantity, unit_price, size, color)
SELECT 
  con.id,
  p.id,
  p.name,
  2,
  p.sale_price,
  'P',
  'Vermelho'
FROM public.conditionals con, public.products p, public.customers c
WHERE con.customer_id = c.id AND c.name = 'Ana Costa Oliveira' AND p.sku = 'VFL003';

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conditionals_updated_at BEFORE UPDATE ON public.conditionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
