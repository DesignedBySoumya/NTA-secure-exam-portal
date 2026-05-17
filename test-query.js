import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
  console.log('Moving all applications to center mp1 so the dashboard shows them all...');
  const { data, error } = await supabase
    .from('applications')
    .update({ center_id: 'mp1' })
    .not('id', 'is', null);
  console.log('Update Error:', error?.message || 'Success');
}

test();
