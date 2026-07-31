-- ========================================================
-- STOCKVIEW - CUBERTO WICKRET SUPABASE DATABASE MIGRATION
-- Table Prefix: stockview_
-- ========================================================

-- Drop existing triggers if present
DROP TRIGGER IF EXISTS trigger_stockview_sale_stock_update ON stockview_sale_items;
DROP TRIGGER IF EXISTS trigger_stockview_purchase_stock_update ON stockview_purchase_items;
DROP FUNCTION IF EXISTS stockview_process_sale_stock_update();
DROP FUNCTION IF EXISTS stockview_process_purchase_stock_update();

-- Drop existing tables safely
DROP TABLE IF EXISTS stockview_stock_movements CASCADE;
DROP TABLE IF EXISTS stockview_purchase_items CASCADE;
DROP TABLE IF EXISTS stockview_purchases CASCADE;
DROP TABLE IF EXISTS stockview_sale_items CASCADE;
DROP TABLE IF EXISTS stockview_sales CASCADE;
DROP TABLE IF EXISTS stockview_customers CASCADE;
DROP TABLE IF EXISTS stockview_suppliers CASCADE;
DROP TABLE IF EXISTS stockview_products CASCADE;
DROP TABLE IF EXISTS stockview_categories CASCADE;
DROP TABLE IF EXISTS stockview_profiles CASCADE;

-- Drop enums if exist
DROP TYPE IF EXISTS stockview_movement_type CASCADE;

-- CREATE ENUM
CREATE TYPE stockview_movement_type AS ENUM ('stock_in', 'stock_out', 'sale', 'purchase', 'adjustment', 'return');

-- 1. PROFILES TABLE
CREATE TABLE stockview_profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  avatar_url TEXT,
  password_hash TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE stockview_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color_code TEXT DEFAULT '#7C3AED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE stockview_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES stockview_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  barcode TEXT UNIQUE,
  description TEXT,
  cost_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
  current_stock INT NOT NULL DEFAULT 0,
  min_stock_level INT NOT NULL DEFAULT 5,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SUPPLIERS TABLE
CREATE TABLE stockview_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. CUSTOMERS TABLE
CREATE TABLE stockview_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  total_spent NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SALES & SALE ITEMS
CREATE TABLE stockview_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES stockview_customers(id) ON DELETE SET NULL,
  subtotal NUMERIC(12, 2) NOT NULL,
  tax NUMERIC(12, 2) DEFAULT 0,
  discount NUMERIC(12, 2) DEFAULT 0,
  total_amount NUMERIC(12, 2) NOT NULL,
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stockview_sale_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_id UUID REFERENCES stockview_sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES stockview_products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_price NUMERIC(12, 2) NOT NULL,
  total_price NUMERIC(12, 2) NOT NULL
);

-- 7. PURCHASES & PURCHASE ITEMS
CREATE TABLE stockview_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  supplier_id UUID REFERENCES stockview_suppliers(id) ON DELETE SET NULL,
  reference_no TEXT UNIQUE NOT NULL,
  total_cost NUMERIC(12, 2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stockview_purchase_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  purchase_id UUID REFERENCES stockview_purchases(id) ON DELETE CASCADE,
  product_id UUID REFERENCES stockview_products(id) ON DELETE RESTRICT,
  quantity INT NOT NULL,
  unit_cost NUMERIC(12, 2) NOT NULL
);

-- 8. STOCK MOVEMENTS LOG TABLE
CREATE TABLE stockview_stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES stockview_products(id) ON DELETE CASCADE,
  quantity_change INT NOT NULL,
  type stockview_movement_type NOT NULL,
  reference_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- AUTOMATED POSTGRESQL TRIGGERS FOR REALTIME STOCK UPDATES
-- ========================================================

-- Trigger 1: Automatic Stock Decrement on Sale Item Created
CREATE OR REPLACE FUNCTION stockview_process_sale_stock_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement Product Stock
  UPDATE stockview_products
  SET current_stock = current_stock - NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;

  -- Log Stock Movement
  INSERT INTO stockview_stock_movements (product_id, quantity_change, type, reference_id, notes)
  VALUES (NEW.product_id, -NEW.quantity, 'sale', NEW.sale_id::text, 'Automated stock drop from sale');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stockview_sale_stock_update
AFTER INSERT ON stockview_sale_items
FOR EACH ROW EXECUTE FUNCTION stockview_process_sale_stock_update();

-- Trigger 2: Automatic Stock Increment on Purchase Item Created
CREATE OR REPLACE FUNCTION stockview_process_purchase_stock_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment Product Stock
  UPDATE stockview_products
  SET current_stock = current_stock + NEW.quantity,
      updated_at = NOW()
  WHERE id = NEW.product_id;

  -- Log Stock Movement
  INSERT INTO stockview_stock_movements (product_id, quantity_change, type, reference_id, notes)
  VALUES (NEW.product_id, NEW.quantity, 'purchase', NEW.purchase_id::text, 'Automated stock gain from purchase order');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stockview_purchase_stock_update
AFTER INSERT ON stockview_purchase_items
FOR EACH ROW EXECUTE FUNCTION stockview_process_purchase_stock_update();

-- Enable Supabase Realtime Publication
ALTER PUBLICATION supabase_realtime ADD TABLE stockview_products;
ALTER PUBLICATION supabase_realtime ADD TABLE stockview_sales;
ALTER PUBLICATION supabase_realtime ADD TABLE stockview_stock_movements;

-- Seed Data
INSERT INTO stockview_categories (id, name, slug, color_code) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Electronics', 'electronics', '#7C3AED'),
  ('c2222222-2222-2222-2222-222222222222', 'Apparel', 'apparel', '#10B981'),
  ('c3333333-3333-3333-3333-333333333333', 'Office & Stationery', 'office-stationery', '#06B6D4'),
  ('c4444444-4444-4444-4444-444444444444', 'Beverages & Snacks', 'beverages-snacks', '#F59E0B');

INSERT INTO stockview_suppliers (id, company_name, contact_person, email, phone) VALUES
  ('s1111111-1111-1111-1111-111111111111', 'Apex Tech Distribution', 'Sarah Connor', 'sarah@apextech.com', '+1-800-555-0199'),
  ('s2222222-2222-2222-2222-222222222222', 'Vanguard Goods Co.', 'David Miller', 'david@vanguard.org', '+1-800-555-0288');

INSERT INTO stockview_customers (id, full_name, email, phone, total_spent) VALUES
  ('u1111111-1111-1111-1111-111111111111', 'Elena Rostova', 'elena@example.com', '+1-555-0123', 499.98),
  ('u2222222-2222-2222-2222-222222222222', 'Jonathan Wick', 'john@example.com', '+1-555-0199', 1249.50);

INSERT INTO stockview_products (id, category_id, name, sku, barcode, description, cost_price, selling_price, current_stock, min_stock_level, image_url) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Wireless Noise-Canceling Headphones', 'SKU-ELEC-001', '890123456701', 'Over-ear Bluetooth headphones with active noise cancellation', 120.00, 249.99, 18, 5, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'),
  ('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Mechanical Gaming Keyboard RGB', 'SKU-ELEC-002', '890123456702', 'Tactile mechanical switches with customizable per-key RGB backlighting', 65.00, 129.99, 3, 5, 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80'),
  ('e3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Ergonomic Vertical Wireless Mouse', 'SKU-ELEC-003', '890123456703', 'Reduces wrist strain with 4000 DPI precision sensor', 25.00, 59.99, 2, 4, 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=500&q=80'),
  ('e4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'Minimalist Black Cotton Hoodie', 'SKU-APP-001', '890123456704', 'Heavyweight 400 GSM organic cotton relaxed fit hoodie', 30.00, 79.99, 24, 8, 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500&q=80'),
  ('e5555555-5555-5555-5555-555555555555', 'c3333333-3333-3333-3333-333333333333', 'Leather Desk Mat & Organizer Pad', 'SKU-OFF-001', '890123456705', 'Microfiber vegan leather desk mat with magnetic cable holders', 15.00, 39.99, 15, 5, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80');

INSERT INTO stockview_profiles (id, email, full_name, role, avatar_url) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'admin@stockview.io', 'Alex Vance (Manager)', 'admin', 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24" fill="%230f172a" stroke="%2310b981" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/></svg>');
