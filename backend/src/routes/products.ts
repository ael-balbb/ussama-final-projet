import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/products - Public: list all products
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, products: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des produits' });
  }
});

// GET /api/products/:id - Public: get single product
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', req.params.id)
      .single();

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

// POST /api/products - Admin: create product
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, brand, price, stock, description, images } = req.body;

    if (!name || !category || price === undefined) {
      res.status(400).json({ error: 'Nom, catégorie et prix sont requis' });
      return;
    }

    const { data, error } = await supabase
      .from('products')
      .insert([{
        name,
        category,
        brand: brand || '',
        price: Number(price),
        stock: Number(stock) || 0,
        description: description || '',
        images: images || []
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, product: data });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Erreur lors de la création du produit' });
  }
});

// PUT /api/products/:id - Admin: update product
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, category, brand, price, stock, description, images } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (brand !== undefined) updateData.brand = brand;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (description !== undefined) updateData.description = description;
    if (images !== undefined) updateData.images = images;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Produit non trouvé' });
      return;
    }

    res.json({ success: true, product: data });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du produit' });
  }
});

// DELETE /api/products/:id - Admin: delete product
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du produit' });
  }
});

export default router;
