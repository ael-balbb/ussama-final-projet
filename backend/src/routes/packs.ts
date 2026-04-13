import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/packs - Public: list all packs
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('packs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, packs: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des packs' });
  }
});

// POST /api/packs - Admin: create pack
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, stock, description, image, color } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ error: 'Nom et prix sont requis' });
      return;
    }

    const { data, error } = await supabase
      .from('packs')
      .insert([{
        name,
        price: Number(price),
        stock: Number(stock) || 0,
        description: description || '',
        image: image || '',
        color: color || 'dark'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, pack: data });
  } catch (error) {
    console.error('Error creating pack:', error);
    res.status(500).json({ error: 'Erreur lors de la création du pack' });
  }
});

// PUT /api/packs/:id - Admin: update pack
router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, price, stock, description, image, color } = req.body;

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (color !== undefined) updateData.color = color;

    const { data, error } = await supabase
      .from('packs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Pack non trouvé' });
      return;
    }

    res.json({ success: true, pack: data });
  } catch (error) {
    console.error('Error updating pack:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du pack' });
  }
});

// DELETE /api/packs/:id - Admin: delete pack
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('packs')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Pack supprimé' });
  } catch (error) {
    console.error('Error deleting pack:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du pack' });
  }
});

export default router;
