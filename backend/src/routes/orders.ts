import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// POST /api/orders - Public: create new order
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, city, address, phoneNumber, cartItems, totalAmount } = req.body;

    if (!firstName || !lastName || !city || !address || !phoneNumber || !cartItems) {
      res.status(400).json({ error: 'Tous les champs sont requis' });
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        first_name: firstName,
        last_name: lastName,
        city,
        address,
        phone_number: phoneNumber,
        products_json: cartItems,
        total_amount: Number(totalAmount) || 0,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, order: data });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la commande' });
  }
});

// GET /api/orders - Admin: list all orders
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string | undefined;
    
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, orders: data || [], count: data?.length || 0 });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Erreur lors du chargement des commandes' });
  }
});

// PUT /api/orders/:id/status - Admin: update order status
router.put('/:id/status', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'delivered', 'cancelled'];

    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ error: 'Statut invalide' });
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Commande non trouvée' });
      return;
    }

    res.json({ success: true, order: data });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du statut' });
  }
});

// DELETE /api/orders/:id - Admin: delete order
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Commande supprimée' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
  }
});

export default router;
