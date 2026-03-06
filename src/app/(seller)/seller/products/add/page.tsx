'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, X, Save, Send } from 'lucide-react';
import Link from 'next/link';

interface ProductForm {
  name: string;
  nameTa: string;
  shortDescription: string;
  description: string;
  descriptionTa: string;
  categoryId: string;
  price: string;
  originalPrice: string;
  stockQuantity: string;
  sku: string;
  tags: string;
  courseTags: string; // comma separated slugs for simple input
  newFiles: File[];
  existingImages: any[];
}

export default function AddProductPage() {
  const supabase = createClient();
  const router = useRouter();
  
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<ProductForm>({
    name: '', nameTa: '', shortDescription: '', description: '', descriptionTa: '',
    categoryId: '', price: '', originalPrice: '', stockQuantity: '1', sku: '',
    tags: '', courseTags: '', newFiles: [], existingImages: []
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setVendorId(user.id);
      
      const { data: profile } = await supabase.from('profiles').select('full_name, store_name').eq('id', user.id).single();
      if (profile) setVendorName(profile.store_name || profile.full_name || 'Seller');

      const { data: cats, error: catsError } = await supabase
        .from('product_categories')
        .select('id, name, name_ta, slug, icon')
        .order('name');
      
      if (catsError) {
        toast.error('Failed to load categories');
      } else {
        setCategories(cats || []);
      }
    }
    loadData();
  }, [supabase]);

  const discountPercent = form.originalPrice && form.price && Number(form.originalPrice) > Number(form.price)
    ? Math.round(((Number(form.originalPrice) - Number(form.price)) / Number(form.originalPrice)) * 100)
    : 0;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      if (form.newFiles.length + selected.length > 5) {
        toast.error('Maximum 5 images allowed');
        return;
      }
      setForm(prev => ({ ...prev, newFiles: [...prev.newFiles, ...selected] }));
    }
  };

  const removeFile = (index: number) => {
    setForm(prev => {
      const updated = [...prev.newFiles];
      updated.splice(index, 1);
      return { ...prev, newFiles: updated };
    });
  };

  async function uploadProductImages(files: File[]) {
    const uploaded = [];
    for (let i = 0; i < files.length; i++) {
      const fileExt = files[i].name.split('.').pop();
      const path = `products/${vendorId}/${Date.now()}-${i}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('product-images').upload(path, files[i], { upsert: false });
      if (uploadError) {
        toast.error(`Failed to upload image ${i+1}`);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      uploaded.push({ url: publicUrl, alt: form.name || `Product image ${i+1}` });
    }
    return uploaded;
  }

  async function handleSubmit(action: 'draft' | 'review') {
    if (!form.name || !form.categoryId || !form.price || !form.stockQuantity) {
      toast.error('Please fill all required fields (*)');
      return;
    }
    
    setIsSubmitting(true);
    let uploadedImages: { url: string; alt: string }[] = [...form.existingImages];
    for (let i = 0; i < form.newFiles.length; i++) {
      const file = form.newFiles[i];
      const path = `products/${vendorId}/${Date.now()}-${i}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: false });

      if (uploadError) {
        toast.error(`Image ${i + 1} failed to upload`);
        continue;
      }
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path);
      uploadedImages.push({ url: publicUrl, alt: form.name });
    }

    const slug = form.name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
      + '-' + Date.now();

    const tagArray = form.tags.split(',').map(t => t.trim()).filter(t => t);
    const courseTagArray = form.courseTags.split(',').map(t => t.trim()).filter(t => t);
    const newStatus = action === 'draft' ? 'inactive' : 'active'; // Temporarily active or inactive until schema is updated

    const { data: product, error } = await supabase.from('products').insert({
      vendor_id: vendorId,
      name: form.name.trim(),
      name_ta: form.nameTa?.trim() || null,
      slug: slug,
      description: form.description.trim(),
      description_ta: form.descriptionTa?.trim() || null,
      category_id: form.categoryId,
      price: Number(form.price),
      original_price: form.originalPrice ? Number(form.originalPrice) : null,
      stock_quantity: Number(form.stockQuantity),
      sku: form.sku?.trim() || null,
      tags: tagArray.length > 0 ? tagArray : [],
      course_tags: courseTagArray.length > 0 ? courseTagArray : [],
      images: uploadedImages.length > 0 ? uploadedImages : [],
      status: newStatus,
    }).select().single();

    if (error) {
      toast.error(error.message);
      setIsSubmitting(false);
      return;
    }

    if (action === 'review') {
      const { data: admins } = await supabase.from('profiles').select('id').eq('role', 'admin');
      if (admins) {
        const notifications = admins.map(a => ({
          user_id: a.id,
          type: 'system',
          title: 'New Product Pending Review',
          message: `"${form.name}" by ${vendorName} is waiting for approval.`,
          link: '/admin/products'
        }));
        await supabase.from('notifications').insert(notifications);
      }
      toast.success('Product submitted for review!');
    } else {
      toast.success(action === 'draft' ? 'Saved as draft' : 'Product successfully published!');
    }

    router.push('/seller/products');
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 pb-24">
      <div className="flex items-center gap-4">
        <Link href="/seller/products" className="p-2 border border-gray-200 rounded-lg hover:bg-white bg-gray-50 text-gray-500 transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details to list your item in the marketplace</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col - Product Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Product Name (EN) *</label>
                <input 
                  type="text" maxLength={100}
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="e.g. Advanced Calculus Study Guide"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Product Name (Tamil)</label>
                <input 
                  type="text" 
                  value={form.nameTa} onChange={e => setForm({...form, nameTa: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm font-tamil"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Category *</label>
              <select 
                value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none"
              >
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}{c.name_ta ? ` / ${c.name_ta}` : ''}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea 
                rows={5}
                value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm resize-y"
                placeholder="Describe your product thoroughly..."
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Search Tags</label>
              <input 
                type="text" 
                value={form.tags} onChange={e => setForm({...form, tags: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="Comma separated (e.g. math, guide, pdf)"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Target Students (Course Category Slugs)</label>
              <input 
                type="text" 
                value={form.courseTags} onChange={e => setForm({...form, courseTags: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                placeholder="Comma separated slugs (e.g. technology, design)"
              />
              <p className="text-[11px] text-gray-500 mt-1">This powers the Student Recommendation Engine. Match the course category slugs precisely.</p>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">SKU (Optional)</label>
              <input 
                type="text" 
                value={form.sku} onChange={e => setForm({...form, sku: e.target.value})}
                className="w-full md:w-1/2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white outline-none text-sm"
              />
            </div>

          </div>
        </div>

        {/* Right Col - Pricing & Media */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Pricing & Inventory</h3>
            
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Selling Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                <input 
                  type="number" min="0" step="1"
                  value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full pl-8 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none font-bold text-gray-900"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Original Price (₹)</label>
              <div className="relative border border-gray-200 rounded-lg overflow-hidden flex bg-gray-50 focus-within:ring-2 focus-within:ring-emerald-500">
                <span className="pl-3 py-2 text-gray-500 font-medium border-r border-gray-200 bg-gray-100 flex items-center justify-center">₹</span>
                <input 
                  type="number" min="0" step="1"
                  value={form.originalPrice} onChange={e => setForm({...form, originalPrice: e.target.value})}
                  className="flex-1 px-3 py-2 bg-transparent outline-none text-sm"
                />
                {discountPercent > 0 && (
                  <div className="px-3 py-2 bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center border-l border-emerald-100">
                    {discountPercent}% OFF
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Available Stock Quantity *</label>
              <input 
                type="number" min="0" step="1"
                value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})}
                className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-none text-sm"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
            <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3">Product Images</h3>
            
            <div className="grid grid-cols-3 gap-2">
              {form.newFiles.map((file, i) => (
                <div key={i} className="aspect-square rounded-lg border border-gray-200 relative overflow-hidden group">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button 
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {form.newFiles.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50 transition-colors cursor-pointer">
                  <UploadCloud className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-medium text-center px-2">Upload</span>
                  <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileSelect} />
                </label>
              )}
            </div>
            <p className="text-[11px] text-gray-500 leading-tight">First image will be the primary thumbnail. Up to 5 images allowed.</p>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20 flex justify-end gap-3 px-8">
        <button 
          onClick={() => router.push('/seller/products')}
          className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          onClick={() => handleSubmit('draft')}
          className="px-6 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-sm font-bold rounded-xl flex items-center gap-2 transition-colors"
          disabled={isSubmitting}
        >
          <Save className="w-4 h-4" /> Save Draft
        </button>
        <button 
          onClick={() => handleSubmit('review')}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-2 transition-transform active:scale-95"
          disabled={isSubmitting}
        >
          <Send className="w-4 h-4" /> {isSubmitting ? 'Submitting...' : 'Submit for Review'}
        </button>
      </div>

    </div>
  );
}
