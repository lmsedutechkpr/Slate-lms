import { createClient } from '@supabase/supabase-js';  
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);  
supabase.from('courses').select('id, title, instructor:profiles!instructor_id(id), category:categories(id)').then(res => console.log(JSON.stringify(res, null, 2))).catch(err => console.error(err));  
