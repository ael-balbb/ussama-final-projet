import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import {
  cleanColors,
  cleanImages,
  cleanProductBrand,
  cleanStorageVariants,
  cleanText,
  nonNegativeInteger,
  nonNegativeNumber,
  optionalComparePrice,
} from '../utils/catalog';

const router = Router();

const orderedProducts = (includeInactive: boolean) => {
  let query = supabase.from('products').select('*');
  if (!includeInactive) query = query.eq('is_active', true);
  return query
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
};

// Public storefront: active products only.
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await orderedProducts(false);
    if (error) throw error;
    res.json({ success: true, products: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des produits' });
  }
});

// Admin catalog includes drafts and inactive products. Keep before /:id.
router.get('/admin', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await orderedProducts(true);
    if (error) throw error;
    res.json({ success: true, products: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des produits' });
  }
});

router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .eq('is_active', true)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }
    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Erreur lors du chargement du produit' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const name = cleanText(req.body.name, 140);
    const category = cleanText(req.body.category, 20);
    if (!name || !['phone', 'accessory'].includes(category) || req.body.price === undefined) {
      res.status(400).json({ error: 'Nom, catégorie et prix valides sont requis' });
      return;
    }
    const requestedPrice = nonNegativeNumber(req.body.price, 'Le prix');
    const stock = nonNegativeInteger(req.body.stock ?? 0, 'Le stock');
    const storageVariants = cleanStorageVariants(req.body.storage_variants, stock);
    const defaultStorage = storageVariants.find((variant) => variant.available) || storageVariants[0];
    const price = defaultStorage?.price ?? requestedPrice;
    const payload = {
      name,
      category,
      brand: cleanProductBrand(req.body.brand),
      price,
      compare_at_price: defaultStorage
        ? defaultStorage.compare_at_price
        : optionalComparePrice(req.body.compare_at_price, price),
      promo_label: cleanText(req.body.promo_label, 32),
      stock,
      description: cleanText(req.body.description, 3000),
      images: cleanImages(req.body.images),
      colors: cleanColors(req.body.colors, stock),
      storage_variants: storageVariants,
      is_featured: req.body.is_featured === true,
      is_new: req.body.is_new === true,
      is_active: req.body.is_active !== false,
      sort_order: nonNegativeInteger(req.body.sort_order ?? 0, "L'ordre"),
    };
    const { data, error } = await supabase.from('products').insert([payload]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, product: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création du produit';
    console.error('Error creating product:', error);
    const isValidationError = /doit|invalide|existe déjà|requis/.test(message);
    res.status(isValidationError ? 400 : 500).json({
      error: isValidationError ? message : 'Erreur lors de la création du produit',
    });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentResult = await supabase
      .from('products')
      .select('price, stock, storage_variants')
      .eq('id', req.params.id)
      .maybeSingle();
    if (currentResult.error) throw currentResult.error;
    if (!currentResult.data) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    const updateData: Record<string, unknown> = {};
    let price = req.body.price === undefined
      ? Number(currentResult.data.price)
      : nonNegativeNumber(req.body.price, 'Le prix');
    const stock = req.body.stock === undefined
      ? Number(currentResult.data.stock)
      : nonNegativeInteger(req.body.stock, 'Le stock');

    if (req.body.name !== undefined) {
      const name = cleanText(req.body.name, 140);
      if (!name) throw new Error('Le nom est requis');
      updateData.name = name;
    }
    if (req.body.category !== undefined) {
      const category = cleanText(req.body.category, 20);
      if (!['phone', 'accessory'].includes(category)) throw new Error('Catégorie invalide');
      updateData.category = category;
    }
    if (req.body.brand !== undefined) updateData.brand = cleanProductBrand(req.body.brand);
    if (req.body.price !== undefined) updateData.price = price;
    if (req.body.compare_at_price !== undefined) {
      updateData.compare_at_price = optionalComparePrice(req.body.compare_at_price, price);
    }
    if (req.body.promo_label !== undefined) updateData.promo_label = cleanText(req.body.promo_label, 32);
    if (req.body.stock !== undefined) updateData.stock = stock;
    if (req.body.description !== undefined) updateData.description = cleanText(req.body.description, 3000);
    if (req.body.images !== undefined) updateData.images = cleanImages(req.body.images);
    if (req.body.colors !== undefined) updateData.colors = cleanColors(req.body.colors, stock);
    if (req.body.storage_variants !== undefined) {
      const storageVariants = cleanStorageVariants(req.body.storage_variants, stock);
      const defaultStorage = storageVariants.find((variant) => variant.available) || storageVariants[0];
      updateData.storage_variants = storageVariants;
      if (defaultStorage) {
        price = defaultStorage.price;
        updateData.price = defaultStorage.price;
        updateData.compare_at_price = defaultStorage.compare_at_price;
      }
    }
    if (req.body.is_featured !== undefined) updateData.is_featured = req.body.is_featured === true;
    if (req.body.is_new !== undefined) updateData.is_new = req.body.is_new === true;
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active === true;
    if (req.body.sort_order !== undefined) {
      updateData.sort_order = nonNegativeInteger(req.body.sort_order, "L'ordre");
    }

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, product: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du produit';
    console.error('Error updating product:', error);
    const isValidationError = /invalide|requis|doit|existe déjà/.test(message);
    res.status(isValidationError ? 400 : 500).json({
      error: isValidationError ? message : 'Erreur lors de la mise à jour du produit',
    });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.from('products').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

export default router;
