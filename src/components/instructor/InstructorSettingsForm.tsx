'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  User, 
  Mail, 
  Globe, 
  Twitter, 
  Linkedin, 
  Youtube, 
  Save, 
  Plus, 
  Trash2, 
  Camera,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name is required'),
  headline: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  website: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  twitter: z.string().optional().or(z.literal('')),
  linkedin: z.string().optional().or(z.literal('')),
  youtube: z.string().optional().or(z.literal('')),
  expertise: z.array(z.string()).min(1, 'Add at least one expertise'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface InstructorSettingsFormProps {
  profile: any;
}

export default function InstructorSettingsForm({ profile }: InstructorSettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || '',
      headline: profile.headline || '',
      bio: profile.bio || '',
      website: profile.website || '',
      twitter: profile.twitter || '',
      linkedin: profile.linkedin || '',
      youtube: profile.youtube || '',
      expertise: profile.expertise && profile.expertise.length > 0 ? profile.expertise : [''],
    },
  });

  const { watch, setValue, register, formState: { errors } } = form;

  const expertise = watch('expertise');

  const addExpertise = () => setValue('expertise', [...expertise, '']);
  const removeExpertise = (index: number) => {
    if (expertise.length > 1) {
      const newExp = [...expertise];
      newExp.splice(index, 1);
      setValue('expertise', newExp);
    }
  };

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          expertise: data.expertise.filter(e => e.trim() !== ''),
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
      {/* Profile Header Card */}
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col md:flex-row items-center gap-8">
        <div className="relative group">
          <Avatar className="h-32 w-32 border-4 border-gray-50 ring-2 ring-white shadow-xl">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="bg-gray-100 text-gray-300 font-black text-3xl">
              {profile.full_name?.charAt(0) || 'I'}
            </AvatarFallback>
          </Avatar>
          <button type="button" className="absolute bottom-1 right-1 bg-black text-white h-10 w-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 active:scale-95 transition-all">
            <Camera size={16} />
          </button>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{profile.full_name}</h2>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] mt-1">Instructor Profile</p>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-6">
            <div className="text-center">
              <span className="text-lg font-black block leading-none">0</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Courses</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <span className="text-lg font-black block leading-none">0</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Students</span>
            </div>
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <span className="text-lg font-black block leading-none">0.0</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rating</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              General Info
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Full Name *</label>
                <Input 
                  {...register('full_name')} 
                  className="h-12 px-5 font-bold rounded-xl border-gray-100 focus:border-black"
                />
                {errors.full_name && <p className="text-red-500 text-xs font-bold">{errors.full_name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Public Headline</label>
                <Input 
                  {...register('headline')} 
                  placeholder="e.g. Senior Software Engineer & Teacher"
                  className="h-12 px-5 font-bold rounded-xl border-gray-100 focus:border-black"
                />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">A catchy one-liner about your profession</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Bio</label>
                <Textarea 
                  {...register('bio')} 
                  placeholder="Tell students about your experience and why they should learn from you..."
                  className="min-h-[200px] p-5 text-sm font-medium rounded-xl border-gray-100 focus:border-black resize-none"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-widest text-gray-400">Areas of Expertise</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {expertise.map((_, index) => (
                    <div key={index} className="flex gap-2">
                      <Input 
                        {...register(`expertise.${index}`)} 
                        placeholder="e.g. React.js"
                        className="h-11 rounded-xl border-gray-100 font-medium"
                      />
                      {expertise.length > 1 && (
                        <Button 
                          type="button" 
                          variant="ghost" 
                          onClick={() => removeExpertise(index)}
                          className="text-gray-300 hover:text-red-500 h-11 w-11 p-0"
                        >
                          <Trash2 size={18} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={addExpertise}
                  className="border-2 border-dashed border-gray-100 hover:border-black rounded-xl h-11 font-black text-xs uppercase tracking-widest"
                >
                  <Plus size={14} className="mr-2" />
                  Add Skill
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Links & Socials */}
        <div className="space-y-8">
          <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm space-y-8">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <Globe size={16} className="text-gray-400" />
              Links & Socials
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Globe size={12} />
                  Website
                </div>
                <Input 
                  {...register('website')} 
                  placeholder="https://example.com"
                  className="h-11 rounded-xl border-gray-100"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Twitter size={12} />
                  Twitter / X
                </div>
                <Input 
                  {...register('twitter')} 
                  placeholder="twitter.com/handle"
                  className="h-11 rounded-xl border-gray-100"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Linkedin size={12} />
                  LinkedIn
                </div>
                <Input 
                  {...register('linkedin')} 
                  placeholder="linkedin.com/in/handle"
                  className="h-11 rounded-xl border-gray-100"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <Youtube size={12} />
                  YouTube
                </div>
                <Input 
                  {...register('youtube')} 
                  placeholder="youtube.com/@channel"
                  className="h-11 rounded-xl border-gray-100"
                />
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full h-14 bg-black text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-black/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {isSubmitting ? 'Updating...' : 'Save Settings'}
            {!isSubmitting && <Save size={18} className="ml-3" />}
          </Button>

          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-gray-400">
                <Globe size={16} />
              </div>
              <h4 className="text-xs font-black uppercase tracking-widest">Public URL</h4>
            </div>
            <p className="text-[10px] font-bold text-gray-400 leading-relaxed mb-4">
              This is how students will see your profile when they click on your name.
            </p>
            <div className="bg-white border border-gray-100 p-3 rounded-xl flex items-center justify-between gap-4">
              <span className="text-[10px] font-black text-gray-300 truncate">slate.edu/instructor/{profile.id.split('-')[0]}</span>
              <Button variant="ghost" size="sm" className="h-7 px-3 text-[10px] font-black uppercase tracking-widest text-black hover:bg-gray-50">
                Copy
              </Button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
