BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC,
  ADD COLUMN IF NOT EXISTS promo_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_new BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.packs
  ADD COLUMN IF NOT EXISTS compare_at_price NUMERIC,
  ADD COLUMN IF NOT EXISTS promo_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_price_nonnegative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_price_nonnegative CHECK (price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_stock_nonnegative') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_stock_nonnegative CHECK (stock >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_compare_price_valid') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_compare_price_valid
      CHECK (compare_at_price IS NULL OR compare_at_price > price);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_colors_array') THEN
    ALTER TABLE public.products ADD CONSTRAINT products_colors_array
      CHECK (jsonb_typeof(colors) = 'array');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'packs_price_nonnegative') THEN
    ALTER TABLE public.packs ADD CONSTRAINT packs_price_nonnegative CHECK (price >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'packs_stock_nonnegative') THEN
    ALTER TABLE public.packs ADD CONSTRAINT packs_stock_nonnegative CHECK (stock >= 0);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'packs_compare_price_valid') THEN
    ALTER TABLE public.packs ADD CONSTRAINT packs_compare_price_valid
      CHECK (compare_at_price IS NULL OR compare_at_price > price);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'orders_total_nonnegative') THEN
    ALTER TABLE public.orders ADD CONSTRAINT orders_total_nonnegative CHECK (total_amount >= 0);
  END IF;
END $$;

ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.products FROM anon, authenticated;
REVOKE ALL ON TABLE public.packs FROM anon, authenticated;
REVOKE ALL ON TABLE public.orders FROM anon, authenticated;
REVOKE ALL ON TABLE public.admins FROM anon, authenticated;

GRANT ALL ON TABLE public.products TO service_role;
GRANT ALL ON TABLE public.packs TO service_role;
GRANT ALL ON TABLE public.orders TO service_role;
GRANT ALL ON TABLE public.admins TO service_role;

-- The backend uses the service role and bypasses RLS. Public-role upload/delete
-- policies would allow clients to mutate the bucket directly, so remove them.
DROP POLICY IF EXISTS "Service key upload for product images" ON storage.objects;
DROP POLICY IF EXISTS "Service key delete for product images" ON storage.objects;

COMMIT;
