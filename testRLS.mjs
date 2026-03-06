import { createClient } from '@supabase/supabase-js';  
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);  
supabase.rpc('get_policies').then(res => console.log(JSON.stringify(res, null, 2))).catch(()=>null);  
supabase.from('courses').select('*').limit(1).then(res => console.log('anon query:', res.data?.length)).catch(err => console.error(err));  
