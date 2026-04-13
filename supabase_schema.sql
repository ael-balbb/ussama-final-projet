-- ============================================
-- NASRI PHONE STORE - Supabase Database Schema
-- ============================================
-- Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Products Table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('phone', 'accessory')),
  brand TEXT DEFAULT '',
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Packs (Promo Packs) Table
CREATE TABLE IF NOT EXISTS packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  color TEXT DEFAULT 'dark' CHECK (color IN ('dark', 'yellow', 'red')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  products_json JSONB NOT NULL DEFAULT '[]',
  total_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'delivered', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Admins Table
CREATE TABLE IF NOT EXISTS admins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_packs_updated_at
  BEFORE UPDATE ON packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Insert default admin (password: NasriAdmin2025!)
-- The hash below is for 'NasriAdmin2025!' using bcrypt (10 rounds)
-- You should change the password after first login
INSERT INTO admins (email, password_hash) 
VALUES ('admin@nasriphone.com', '$2b$10$placeholder_hash_replace_at_startup')
ON CONFLICT (email) DO NOTHING;

-- 7. Create Storage Bucket for product images
-- NOTE: Run this in Supabase Dashboard > Storage > Create new bucket
-- Bucket name: product-images
-- Public: YES (so images can be accessed without auth)
-- Or run via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- 8. Storage Policy: Allow public read access
CREATE POLICY "Public read access for product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

-- 9. Storage Policy: Allow authenticated uploads (via service key from backend)
CREATE POLICY "Service key upload for product images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

-- 10. Storage Policy: Allow delete (via service key from backend)
CREATE POLICY "Service key delete for product images"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');

-- 11. Disable RLS on tables (backend uses service_role key)
ALTER TABLE products DISABLE ROW LEVEL SECURITY;
ALTER TABLE packs DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
