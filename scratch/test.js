import { supabase } from '../src/lib/supabase.js';

async function test() {
  const { data, error } = await supabase.from('payments').select('*').limit(1);
  console.log('Data:', data);
  console.log('Error:', error);
}

test();
