import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  const defaultEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const defaultPassword = process.env.ADMIN_PASSWORD;
  if (!defaultEmail || !defaultPassword || defaultPassword.length < 12) {
    throw new Error('ADMIN_EMAIL and a 12+ character ADMIN_PASSWORD are required');
  }
  const passwordHash = await bcrypt.hash(defaultPassword, 10);

  const { error: adminError } = await supabase
    .from('admins')
    .upsert([{
      email: defaultEmail,
      password_hash: passwordHash
    }], { onConflict: 'email' });

  if (adminError) {
    console.error('❌ Error seeding admin:', adminError);
  } else {
    console.log(`✅ Admin created: ${defaultEmail}`);
  }

  console.log('🌱 Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
