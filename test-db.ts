import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Products query...');
  const { data, error } = await supabase.from('products').select('*').limit(1);
  if (error) {
    console.error('PRODUCTS ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('PRODUCTS OK');
  }

  console.log('Testing Sellers query...');
  const { data: sData, error: sError } = await supabase.from('profiles').select('*').eq('role', 'seller').limit(1);
  if (sError) {
    console.error('SELLERS ERROR:', JSON.stringify(sError, null, 2));
  } else {
    console.log('SELLERS OK');
  }
}

test();
