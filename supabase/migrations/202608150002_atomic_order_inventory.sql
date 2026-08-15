CREATE OR REPLACE FUNCTION public.place_order(
  p_first_name TEXT,
  p_last_name TEXT,
  p_city TEXT,
  p_address TEXT,
  p_phone_number TEXT,
  p_cart_items JSONB
)
RETURNS TABLE(order_id UUID, total_amount NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_item JSONB;
  v_source TEXT;
  v_id UUID;
  v_quantity INTEGER;
  v_color_name TEXT;
  v_product public.products%ROWTYPE;
  v_pack public.packs%ROWTYPE;
  v_color JSONB;
  v_color_index INTEGER;
  v_color_stock INTEGER;
  v_items JSONB := '[]'::JSONB;
  v_total NUMERIC := 0;
  v_order_id UUID;
  v_image TEXT;
BEGIN
  IF jsonb_typeof(p_cart_items) <> 'array'
    OR jsonb_array_length(p_cart_items) < 1
    OR jsonb_array_length(p_cart_items) > 30 THEN
    RAISE EXCEPTION 'Le panier est invalide';
  END IF;

  FOR v_item IN SELECT value FROM jsonb_array_elements(p_cart_items)
  LOOP
    BEGIN
      v_id := (v_item->>'id')::UUID;
      v_quantity := (v_item->>'quantity')::INTEGER;
    EXCEPTION WHEN OTHERS THEN
      RAISE EXCEPTION 'Un article du panier est invalide';
    END;
    v_source := CASE WHEN v_item->>'source' = 'pack' THEN 'pack' ELSE 'product' END;
    v_color_name := NULLIF(BTRIM(v_item->>'color'), '');

    IF v_quantity < 1 OR v_quantity > 20 THEN
      RAISE EXCEPTION 'Un article du panier est invalide';
    END IF;

    IF v_source = 'pack' THEN
      SELECT * INTO v_pack
      FROM public.packs
      WHERE id = v_id AND is_active = TRUE
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Un article n’est plus disponible';
      END IF;
      IF v_pack.stock < v_quantity THEN
        RAISE EXCEPTION 'Stock insuffisant pour %', v_pack.name;
      END IF;

      UPDATE public.packs
      SET stock = stock - v_quantity
      WHERE id = v_pack.id;

      v_image := COALESCE(v_pack.image, '');
      v_total := v_total + (v_pack.price * v_quantity);
      v_items := v_items || jsonb_build_array(jsonb_build_object(
        'id', v_pack.id,
        'source', 'pack',
        'name', v_pack.name,
        'price', v_pack.price,
        'quantity', v_quantity,
        'image', v_image
      ));
    ELSE
      SELECT * INTO v_product
      FROM public.products
      WHERE id = v_id AND is_active = TRUE
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Un article n’est plus disponible';
      END IF;
      IF v_product.stock < v_quantity THEN
        RAISE EXCEPTION 'Stock insuffisant pour %', v_product.name;
      END IF;

      v_image := COALESCE(v_product.images[1], '');
      IF jsonb_array_length(COALESCE(v_product.colors, '[]'::JSONB)) > 0 THEN
        SELECT entry.value, entry.ordinality::INTEGER - 1
        INTO v_color, v_color_index
        FROM jsonb_array_elements(v_product.colors) WITH ORDINALITY AS entry(value, ordinality)
        WHERE entry.value->>'name' = v_color_name
          AND COALESCE((entry.value->>'available')::BOOLEAN, TRUE)
        LIMIT 1;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Le coloris choisi n’est plus disponible';
        END IF;

        v_color_stock := COALESCE((v_color->>'stock')::INTEGER, v_product.stock);
        IF v_color_stock < v_quantity THEN
          RAISE EXCEPTION 'Stock insuffisant pour %', v_product.name;
        END IF;

        v_product.colors := jsonb_set(
          v_product.colors,
          ARRAY[v_color_index::TEXT, 'stock'],
          to_jsonb(v_color_stock - v_quantity),
          FALSE
        );
        IF v_color_stock - v_quantity = 0 THEN
          v_product.colors := jsonb_set(
            v_product.colors,
            ARRAY[v_color_index::TEXT, 'available'],
            'false'::JSONB,
            TRUE
          );
        END IF;
        v_image := COALESCE(NULLIF(v_color->>'image', ''), v_image);
      END IF;

      UPDATE public.products
      SET stock = stock - v_quantity,
          colors = v_product.colors
      WHERE id = v_product.id;

      v_total := v_total + (v_product.price * v_quantity);
      v_items := v_items || jsonb_build_array(
        jsonb_strip_nulls(jsonb_build_object(
          'id', v_product.id,
          'source', 'product',
          'name', v_product.name,
          'price', v_product.price,
          'quantity', v_quantity,
          'image', v_image,
          'color', v_color_name
        ))
      );
    END IF;
  END LOOP;

  INSERT INTO public.orders (
    first_name,
    last_name,
    city,
    address,
    phone_number,
    products_json,
    total_amount,
    status
  )
  VALUES (
    p_first_name,
    p_last_name,
    p_city,
    p_address,
    p_phone_number,
    v_items,
    v_total,
    'pending'
  )
  RETURNING id INTO v_order_id;

  RETURN QUERY SELECT v_order_id, v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.place_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_order(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB)
  TO service_role;
