'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Store, Camera, Mail, User, BookOpen, UploadCloud } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SellerProfilePage() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState('');
  
  const [form, setForm] = useState({
    full_name: '',
    store_name: '',
    store_description: '',
    avatar_url: ''
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setForm({
          full_name: data.full_name || '',
          store_name: data.store_name || '',
          store_description: data.store_description || '',
          avatar_url: data.avatar_url || ''
        });
      }
      setIsLoading(false);
    }
    loadProfile();
  }, [supabase]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    let newAvatarUrl = form.avatar_url;

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop();
      const path = `avatars/${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, avatarFile, { upsert: true });
      if (uploadError) {
        toast.error('Failed to upload avatar image');
        setIsSaving(false);
        return;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
      newAvatarUrl = publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        store_name: form.store_name,
        store_description: form.store_description,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    setIsSaving(false);

    if (error) {
      toast.error('Failed to save profile');
      return;
    }

    toast.success('Store profile updated');
    setForm(prev => ({ ...prev, avatar_url: newAvatarUrl }));
    setAvatarFile(null);

    // Refresh layout to update sidebar
    // A simple location reload or event could work, but Next.js router.refresh() is better if we had router
    // Here we can just notify user.
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 pb-24">
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Store Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your public store presence and brand identity.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Avatar */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col items-center text-center shadow-sm">
            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden relative group bg-gray-100 flex items-center justify-center mb-4">
              {avatarFile ? (
                <img src={URL.createObjectURL(avatarFile)} alt="" className="w-full h-full object-cover" />
              ) : form.avatar_url ? (
                <img src={form.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Store className="w-12 h-12 text-gray-400" />
              )}
              
              <label className="absolute inset-0 bg-black/50 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-xs font-medium">Change Logo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900">{form.store_name || form.full_name || 'Your Store Name'}</h3>
            <p className="text-sm text-gray-500 mt-1">SLATE Vendor</p>
          </div>
        </div>

        {/* Right Col - Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Public Details</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Store Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={form.store_name} onChange={e => setForm({...form, store_name: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                  placeholder="e.g. CodeMaster Resources"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Your Full Name (Owner)</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})}
                  className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                  placeholder="e.g. John Doe"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">About the Store</label>
              <div className="relative">
                <BookOpen className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea 
                  rows={5}
                  value={form.store_description} onChange={e => setForm({...form, store_description: e.target.value})}
                  className="w-full pl-9 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm resize-y"
                  placeholder="Tell students about what you sell, your expertise, and your brand mission..."
                />
              </div>
            </div>
          </div>
        </div>

      </div>

      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex justify-end px-8">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-transform active:scale-95 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
          ) : (
            <UploadCloud className="w-4 h-4" />
          )}
          {isSaving ? 'Saving Changes...' : 'Save Profile Details'}
        </button>
      </div>

    </div>
  );
}
