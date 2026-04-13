import { Router, Request, Response } from 'express';
import multer from 'multer';
import { supabase } from '../config/supabase';
import { authMiddleware } from '../middleware/auth';
import path from 'path';
import crypto from 'crypto';

const router = Router();

// Configure multer for memory storage (we'll upload to Supabase Storage)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 3 // Max 3 files at once
  },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Type de fichier non supporté. Utilisez JPG, PNG ou WebP.'));
    }
  }
});

// POST /api/upload - Admin: upload images to Supabase Storage
router.post('/', authMiddleware, upload.array('images', 3), async (req: Request, res: Response): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      res.status(400).json({ error: 'Aucun fichier fourni' });
      return;
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      // Generate unique filename
      const uniqueId = crypto.randomUUID();
      const ext = path.extname(file.originalname) || '.jpg';
      const fileName = `${uniqueId}${ext}`;
      const filePath = `products/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      uploadedUrls.push(urlData.publicUrl);
    }

    res.json({ 
      success: true, 
      urls: uploadedUrls,
      count: uploadedUrls.length 
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ error: 'Erreur lors du téléchargement des images' });
  }
});

// DELETE /api/upload - Admin: delete image from Supabase Storage
router.delete('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { url } = req.body;
    
    if (!url) {
      res.status(400).json({ error: 'URL de l\'image requise' });
      return;
    }

    // Extract file path from URL
    const urlParts = url.split('/product-images/');
    if (urlParts.length < 2) {
      res.status(400).json({ error: 'URL invalide' });
      return;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('product-images')
      .remove([filePath]);

    if (error) throw error;

    res.json({ success: true, message: 'Image supprimée' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
  }
});

export default router;
