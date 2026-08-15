-- Run once in Supabase SQL Editor to enable per-color product images
ALTER TABLE products
ADD COLUMN IF NOT EXISTS colors JSONB DEFAULT '[]'::jsonb;
