import { createClient } from '@/lib/supabase/server';
import CourseBuilderForm from '@/components/instructor/CourseBuilderForm';

export default async function NewCoursePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('approval_status')
    .eq('id', user.id)
    .single();

    const { data: categories } = await supabase
      .from('categories')
      .select('id, name, slug')
      .order('name', { ascending: true });

    return (
      <div className="flex flex-col h-full bg-white">
        <CourseBuilderForm 
          instructorId={user.id} 
          categories={categories || []} 
          approvalStatus={profile?.approval_status || 'pending'}
        />
      </div>
    );
}
