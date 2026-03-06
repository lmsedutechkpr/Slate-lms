'use server';

import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function updateProfile(data: {
  full_name: string;
  bio: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    if (!data.full_name || data.full_name.trim().length < 2) {
      return { success: false, error: 'Name must be at least 2 characters' };
    }
    if (data.full_name.trim().length > 60) {
      return { success: false, error: 'Name must be under 60 characters' };
    }
    if (data.bio && data.bio.length > 200) {
      return { success: false, error: 'Bio must be under 200 characters' };
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: data.full_name.trim(),
        bio: data.bio?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('updateProfile error:', updateError);
      return { success: false, error: updateError.message };
    }

    revalidatePath('/dashboard');
    revalidatePath('/dashboard/profile');
    return { success: true };
  } catch (err: any) {
    console.error('updateProfile exception:', err);
    return { success: false, error: err?.message ?? 'Something went wrong' };
  }
}

export async function updatePreferences(data: {
  preferred_language: 'en' | 'ta';
  interests: string[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        preferred_language: data.preferred_language,
        interests: data.interests,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Something went wrong' };
  }
}

export async function updateNotificationPrefs(data: {
  email_updates: boolean;
  course_reminders: boolean;
  new_course_alerts: boolean;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ notification_prefs: data, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath('/dashboard/settings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message ?? 'Something went wrong' };
  }
}

export async function updateAvatar(
  formData: FormData
): Promise<{ success: boolean; avatarUrl?: string; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const file = formData.get('avatar') as File | null;
    if (!file) return { success: false, error: 'No file provided' };

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Use JPG, PNG or WebP.',
      };
    }

    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      return { success: false, error: 'File too large. Max 2MB.' };
    }

    const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
    const fileName = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      console.error('updateAvatar upload error:', uploadError);
      return { success: false, error: uploadError.message };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('avatars').getPublicUrl(fileName);

    // Bust cache with a timestamp
    const avatarUrl = `${publicUrl}?t=${Date.now()}`;

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (profileError) {
      console.error('updateAvatar profile update error:', profileError);
      return { success: false, error: profileError.message };
    }

    revalidatePath('/dashboard/profile');
    revalidatePath('/dashboard');
    return { success: true, avatarUrl };
  } catch (err: any) {
    console.error('updateAvatar exception:', err);
    return { success: false, error: err?.message ?? 'Upload failed' };
  }
}

export async function getProfileStats(studentId: string): Promise<{
  enrolledCount: number;
  completedCount: number;
  certificateCount: number;
}> {
  try {
    const supabase = await createClient();

    const [enrolledResult, completedResult, certResult] = await Promise.all([
      supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),

      supabase
        .from('enrollments')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .not('completed_at', 'is', null),

      supabase
        .from('certificates')
        .select('id', { count: 'exact', head: true })
        .eq('student_id', studentId),
    ]);

    return {
      enrolledCount: enrolledResult.count ?? 0,
      completedCount: completedResult.count ?? 0,
      certificateCount: certResult.count ?? 0,
    };
  } catch {
    return { enrolledCount: 0, completedCount: 0, certificateCount: 0 };
  }
}

export async function deleteAccount(): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false, error: 'Not authenticated' };

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await serviceClient.auth.admin.deleteUser(user.id);

    if (error) {
      console.error('deleteAccount error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error('deleteAccount exception:', err);
    return { success: false, error: err?.message ?? 'Failed to delete account' };
  }
}
