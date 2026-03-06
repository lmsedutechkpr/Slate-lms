import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkColumns() {
  const { data, error } = await supabase.from('courses').select('id').limit(1);
  if (error) {
    console.error('Error selecting courses:', error);
  } else {
    console.log('Courses table exists and query succeeded.');
  }

  // To reload schema cache, we could also call an rpc function, or just run a direct query if possible.
  // Wait, the client can't run RAW sql. 
}

checkColumns();
