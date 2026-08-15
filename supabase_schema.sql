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
  compare_at_price NUMERIC CHECK (compare_at_price IS NULL OR compare_at_price > price),
  promo_label TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  images TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]'::jsonb,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  is_new BOOLEAN NOT NULL DEFAULT FALSE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration for existing DBs (safe to re-run):
-- ALTER TABLE products ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;

-- 2. Packs (Promo Packs) Table
CREATE TABLE IF NOT EXISTS packs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  compare_at_price NUMERIC CHECK (compare_at_price IS NULL OR compare_at_price > price),
  promo_label TEXT NOT NULL DEFAULT '',
  stock INTEGER NOT NULL DEFAULT 0,
  description TEXT DEFAULT '',
  image TEXT DEFAULT '',
  color TEXT DEFAULT 'dark' CHECK (color IN ('dark', 'yellow', 'red')),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
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
$$ LANGUAGE plpgsql
SET search_path = '';

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_packs_updated_at ON packs;
CREATE TRIGGER update_packs_updated_at
  BEFORE UPDATE ON packs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Create administrators through the protected server bootstrap flow.
-- Never commit a default password or production password hash.

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

-- 9. The backend uses service_role for all writes. Do not add public-role
-- INSERT, UPDATE, or DELETE policies for this bucket.

-- 10. Lock Data API access. The Railway backend uses service_role, which
-- bypasses RLS; browser clients never receive that credential.
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE products, packs, orders, admins FROM anon, authenticated;
GRANT ALL ON TABLE products, packs, orders, admins TO service_role;
