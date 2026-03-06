import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  console.log('Migrating database...');
  // Instead of RPC, we try REST API on the courses table directly if we can't use raw sql,
  // Actually, we can't run raw SQL from supabase-js without an RPC like `exec_sql`.
  // Since we don't have this, we will rely on the UI treating status 'archived' string if it fails,
  // or `is_archived` if it exists. 
  // Let's create an RPC or just let it be. Wait, 'archived' exists in `AdminCoursesClient.tsx` tabs!
}

run();
