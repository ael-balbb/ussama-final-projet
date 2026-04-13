import bcrypt from 'bcryptjs';
import { supabase } from './config/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function seed() {
  console.log('🌱 Seeding database...');

  // Create default admin
  const defaultEmail = 'admin@nasriphone.com';
  const defaultPassword = 'NasriAdmin2025!';
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
    console.log(`✅ Admin created: ${defaultEmail} / ${defaultPassword}`);
  }

  console.log('🌱 Seeding complete!');
  process.exit(0);
}

seed().catch(console.error);
