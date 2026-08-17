import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import { cleanText } from '../utils/catalog';

const router = Router();

// POST /api/orders - Public: create new order
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const firstName = cleanText(req.body.firstName, 80);
    const lastName = cleanText(req.body.lastName, 80);
    const city = cleanText(req.body.city, 100);
    const address = cleanText(req.body.address, 300);
    const phoneNumber = cleanText(req.body.phoneNumber, 20).replace(/\s/g, '');
    const cartItems = req.body.cartItems;

    if (!firstName || !lastName || !city || !address || !/^(06|07)\d{8}$/.test(phoneNumber)) {
      res.status(400).json({ error: 'Tous les champs sont requis' });
      return;
    }

    if (!Array.isArray(cartItems) || cartItems.length < 1 || cartItems.length > 30) {
      res.status(400).json({ error: 'Le panier est invalide' });
      return;
    }

    const requestedItems = cartItems.map((item: unknown) => {
      const value = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      const id = cleanText(value.id, 80);
      const source = value.source === 'pack' ? 'pack' : 'product';
      const quantity = Math.floor(Number(value.quantity));
      const color = cleanText(value.color, 40);
      const storage = cleanText(value.storage, 20);
      if (!id || !Number.isFinite(quantity) || quantity < 1 || quantity > 20) {
        throw new Error('Un article du panier est invalide');
      }
      return { id, source, quantity, color, storage };
    });

    const { data, error } = await supabase.rpc('place_order', {
      p_first_name: firstName,
      p_last_name: lastName,
      p_city: city,
      p_address: address,
      p_phone_number: phoneNumber,
      p_cart_items: requestedItems,
    });
    if (error) throw new Error(error.message);
    const order = Array.isArray(data) ? data[0] : data;
    if (!order?.order_id) throw new Error('La commande n’a pas pu être créée');

    res.status(201).json({
      success: true,
      order: { id: order.order_id, total_amount: order.total_amount },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    const message = error instanceof Error ? error.message : 'Erreur lors de la création de la commande';
    const isCustomerError = /invalide|disponible|Stock insuffisant/.test(message);
    res.status(isCustomerError ? 400 : 500).json({
      error: isCustomerError ? message : 'Erreur lors de la création de la commande',
    });
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
