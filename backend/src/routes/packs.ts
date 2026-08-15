import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import {
  cleanText,
  cleanImageUrl,
  nonNegativeInteger,
  nonNegativeNumber,
  optionalComparePrice,
} from '../utils/catalog';

const router = Router();

const orderedPacks = (includeInactive: boolean) => {
  let query = supabase.from('packs').select('*');
  if (!includeInactive) query = query.eq('is_active', true);
  return query.order('sort_order', { ascending: true }).order('created_at', { ascending: false });
};

router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await orderedPacks(false);
    if (error) throw error;
    res.json({ success: true, packs: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching packs:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des packs' });
  }
});

router.get('/admin', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const { data, error } = await orderedPacks(true);
    if (error) throw error;
    res.json({ success: true, packs: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching admin packs:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des packs' });
  }
});

router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const name = cleanText(req.body.name, 140);
    if (!name || req.body.price === undefined) {
      res.status(400).json({ error: 'Nom et prix valides sont requis' });
      return;
    }
    const price = nonNegativeNumber(req.body.price, 'Le prix');
    const color = cleanText(req.body.color, 20) || 'dark';
    if (!['dark', 'yellow', 'red'].includes(color)) throw new Error('Couleur de pack invalide');
    const { data, error } = await supabase.from('packs').insert([{
      name,
      price,
      compare_at_price: optionalComparePrice(req.body.compare_at_price, price),
      promo_label: cleanText(req.body.promo_label, 32),
      stock: nonNegativeInteger(req.body.stock ?? 0, 'Le stock'),
      description: cleanText(req.body.description, 3000),
      image: cleanImageUrl(req.body.image),
      color,
      is_active: req.body.is_active !== false,
      sort_order: nonNegativeInteger(req.body.sort_order ?? 0, "L'ordre"),
    }]).select().single();
    if (error) throw error;
    res.status(201).json({ success: true, pack: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la création du pack';
    console.error('Error creating pack:', error);
    const isValidationError = message.includes('invalide') || message.includes('doit');
    res.status(isValidationError ? 400 : 500).json({
      error: isValidationError ? message : 'Erreur lors de la création du pack',
    });
  }
});

router.put('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const currentResult = await supabase
      .from('packs')
      .select('price')
      .eq('id', req.params.id)
      .maybeSingle();
    if (currentResult.error) throw currentResult.error;
    if (!currentResult.data) {
      res.status(404).json({ error: 'Pack non trouvé' });
      return;
    }
    const updateData: Record<string, unknown> = {};
    const price = req.body.price === undefined
      ? Number(currentResult.data.price)
      : nonNegativeNumber(req.body.price, 'Le prix');
    if (req.body.name !== undefined) {
      const name = cleanText(req.body.name, 140);
      if (!name) throw new Error('Le nom est requis');
      updateData.name = name;
    }
    if (req.body.price !== undefined) updateData.price = price;
    if (req.body.compare_at_price !== undefined) {
      updateData.compare_at_price = optionalComparePrice(req.body.compare_at_price, price);
    }
    if (req.body.promo_label !== undefined) updateData.promo_label = cleanText(req.body.promo_label, 32);
    if (req.body.stock !== undefined) updateData.stock = nonNegativeInteger(req.body.stock, 'Le stock');
    if (req.body.description !== undefined) updateData.description = cleanText(req.body.description, 3000);
    if (req.body.image !== undefined) updateData.image = cleanImageUrl(req.body.image);
    if (req.body.color !== undefined) {
      const color = cleanText(req.body.color, 20);
      if (!['dark', 'yellow', 'red'].includes(color)) throw new Error('Couleur de pack invalide');
      updateData.color = color;
    }
    if (req.body.is_active !== undefined) updateData.is_active = req.body.is_active === true;
    if (req.body.sort_order !== undefined) {
      updateData.sort_order = nonNegativeInteger(req.body.sort_order, "L'ordre");
    }

    const { data, error } = await supabase
      .from('packs')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();
    if (error) throw error;
    res.json({ success: true, pack: data });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur lors de la mise à jour du pack';
    console.error('Error updating pack:', error);
    const isValidationError = message.includes('invalide') || message.includes('requis') || message.includes('doit');
    res.status(isValidationError ? 400 : 500).json({
      error: isValidationError ? message : 'Erreur lors de la mise à jour du pack',
    });
  }
});

router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase.from('packs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Pack supprimé' });
  } catch (error) {
    console.error('Error deleting pack:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du pack' });
  }
});

export default router;
