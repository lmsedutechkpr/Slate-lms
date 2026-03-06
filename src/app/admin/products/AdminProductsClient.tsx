'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Package, Star, UserPlus, Eye, Pencil, UserCog, CheckCircle, XCircle, Rocket,
  EyeOff, RefreshCw, RotateCcw, ShoppingBag, Trash2, X, AlertCircle, Search, MoreVertical
} from 'lucide-react';

type Product = any;

interface DrawerProps { open: boolean; onClose: () => void; title: string; children: React.ReactNode; }
function SlideOverDrawer({ open, onClose, title, children }: DrawerProps) {
  return (
    <>
      {open && <div className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm" onClick={onClose} />}
      <div className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[500px] bg-white shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </>
  );
}

function EmptyState({ icon: Icon, title, message }: { icon: any, title: string, message: string }) {
  return (
    <div className="py-16 text-center">
      <Icon className="w-10 h-10 text-gray-200 mx-auto mb-3" />
      <p className="text-gray-900 font-semibold">{title}</p>
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'published' || status === 'active') return <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full px-2.5 py-1">Active</span>;
  if (status === 'in_review' || status === 'pending_review') return <span className="bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full px-2.5 py-1">In Review</span>;
  if (status === 'draft') return <span className="bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full px-2.5 py-1">Draft</span>;
  if (status === 'rejected') return <span className="bg-red-50 text-red-600 text-[11px] font-bold rounded-full px-2.5 py-1">Rejected</span>;
  if (status === 'inactive' || status === 'out_of_stock' || status === 'archived') return <span className="bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full px-2.5 py-1 capitalize">{status.replace('_', ' ')}</span>;
  return <span className="bg-gray-100 text-gray-500 text-[11px] font-bold rounded-full px-2.5 py-1 capitalize">{status || 'Unknown'}</span>;
}

export default function AdminProductsClient() {
  const supabase = createClient();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drawers
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerContent, setDrawerContent] = useState<{type: 'orders' | 'reviews', data: any[], productId?: string}>({ type: 'orders', data: [] });
  
  // Modals
  const [rejectModalOpen, setRejectModalOpen] = useState<{open: boolean, product: any | null}>({ open: false, product: null });
  const [rejectReason, setRejectReason] = useState('');

  const [assignModalOpen, setAssignModalOpen] = useState<{open: boolean, product: any | null}>({ open: false, product: null });
  const [sellerSearch, setSellerSearch] = useState('');
  const [sellers, setSellers] = useState<any[]>([]);

  const [stockModalOpen, setStockModalOpen] = useState<{open: boolean, product: any | null}>({ open: false, product: null });
  const [stockVal, setStockVal] = useState(0);

  const [deleteModalOpen, setDeleteModalOpen] = useState<{open: boolean, product: any | null}>({ open: false, product: null });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
    const channel = supabase.channel('admin-products-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => {
        loadProducts(); // refresh on change
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  async function loadProducts() {
    setLoading(true);
    // omitted product_number to prevent crash if not yet migrated
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name, name_ta, slug, status, price, original_price,
        stock_quantity, images, rating, rating_count, is_featured,
        created_at, updated_at, tags, sku,
        vendor:profiles!vendor_id(id, full_name, avatar_url, email, store_name, approval_status),
        category:product_categories(id, name, name_ta)
      `)
      .order('created_at', { ascending: false });

    if (!error) setProducts(data || []);
    setLoading(false);
  }

  const tabs = [
    { key: 'all',       label: 'All' },
    { key: 'active',    label: 'Active' },
    { key: 'pending_review', label: 'Pending Review' },
    { key: 'draft',     label: 'Draft' },
    { key: 'rejected',  label: 'Rejected' },
    { key: 'inactive',  label: 'Inactive' },
    { key: 'out_of_stock', label: 'Out of Stock' },
  ];

  const filtered = products.filter(p => {
    // Treat 'in_review' as 'pending_review' backwards compat
    const normalizedStatus = p.status === 'in_review' ? 'pending_review' : p.status;
    if (activeTab !== 'all' && normalizedStatus !== activeTab && p.status !== activeTab) return false;
    if (search) {
      const q = search.toLowerCase();
      return p.name?.toLowerCase().includes(q) ||
        p.vendor?.full_name?.toLowerCase().includes(q) ||
        p.vendor?.store_name?.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q);
    }
    return true;
  });

  const tabCounts = tabs.reduce((acc, t) => {
    if (t.key === 'all') acc[t.key] = products.length;
    else acc[t.key] = products.filter(p => p.status === t.key || (t.key === 'pending_review' && p.status === 'in_review')).length;
    return acc;
  }, {} as Record<string, number>);

  // ---------- ACTIONS -----------

  async function handleAssignSellerSearch(q: string) {
    setSellerSearch(q);
    if (!q) return setSellers([]);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .eq('role', 'vendor')
      .ilike('full_name', `%${q}%`)
      .limit(10);
    setSellers(data || []);
  }

  async function assignSeller(productId: string, sellerId: string, sellerName: string, productName: string) {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, vendor: { id: sellerId, full_name: sellerName } } : p));
    await supabase.from('products').update({ vendor_id: sellerId, updated_at: new Date().toISOString() }).eq('id', productId);
    await supabase.from('notifications').insert({
      user_id: sellerId, type: 'system', title: 'A product has been assigned to you',
      message: `Admin assigned "${productName}" to your store.`, link: '/seller/products'
    });
    toast.success(`Assigned to ${sellerName}`);
    setAssignModalOpen({open: false, product: null});
  }

  async function approveProduct(product: Product) {
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'active' } : p));
    await supabase.from('products').update({ status: 'active', updated_at: new Date().toISOString() }).eq('id', product.id);
    if (product.vendor?.id) {
      await supabase.from('notifications').insert({
        user_id: product.vendor.id, type: 'system', title: '✅ Product Approved!',
        message: `Your product "${product.name}" is now live.`, link: '/seller/products'
      });
    }
    toast.success(`"${product.name}" approved and live!`);
  }

  async function rejectProductAction() {
    const product = rejectModalOpen.product;
    if (!product || !rejectReason.trim()) return;
    
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: 'rejected' } : p));
    // For simplicity, we just change status here since rejection_reason column isn't guaranteed
    await supabase.from('products').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', product.id);
    if (product.vendor?.id) {
      await supabase.from('notifications').insert({
        user_id: product.vendor.id, type: 'system', title: 'Product Rejected',
        message: `Your product "${product.name}" was rejected. Reason: ${rejectReason}`, link: '/seller/products'
      });
    }
    toast.success('Product rejected');
    setRejectModalOpen({open: false, product: null});
    setRejectReason('');
  }

  async function toggleProductStatus(product: Product, newStatus: 'active' | 'inactive' | 'draft') {
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, status: newStatus } : p));
    await supabase.from('products').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', product.id);
    toast.success(`Product status moved to ${newStatus}`);
  }

  async function toggleFeatured(product: Product) {
    const newVal = !product.is_featured;
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_featured: newVal } : p));
    await supabase.from('products').update({ is_featured: newVal }).eq('id', product.id);
    toast.success(newVal ? '⭐ Product featured in shop!' : 'Removed from featured');
  }

  async function submitEditStock() {
    const product = stockModalOpen.product;
    if (!product || stockVal < 0) return toast.error('Invalid quantity');
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock_quantity: stockVal } : p));
    await supabase.from('products').update({ stock_quantity: stockVal, updated_at: new Date().toISOString() }).eq('id', product.id);
    toast.success('Stock updated');
    setStockModalOpen({open: false, product: null});
  }

  async function deleteProductAction() {
    const product = deleteModalOpen.product;
    if (!product || deleteConfirmText !== product.name) return toast.error('Product name must match exactly to confirm.');
    setProducts(prev => prev.filter(p => p.id !== product.id));
    await supabase.from('products').delete().eq('id', product.id);
    toast.success('Product deleted completely.');
    setDeleteModalOpen({open: false, product: null});
    setDeleteConfirmText('');
  }

  async function loadProductOrders(productId: string) {
    const { data } = await supabase.from('order_items').select(`
        id, quantity, unit_price, total_price, created_at,
        order:orders!inner(id, order_number, status, created_at, student:profiles!student_id(full_name, avatar_url, email))
      `).eq('product_id', productId).order('created_at', { ascending: false });
    setDrawerContent({ type: 'orders', data: data || [], productId });
    setDrawerOpen(true);
  }

  async function loadProductReviews(productId: string) {
    const { data } = await supabase.from('product_reviews').select(`
        id, rating, comment, seller_reply, created_at,
        student:profiles!student_id(full_name, avatar_url)
      `).eq('product_id', productId).order('created_at', { ascending: false });
    setDrawerContent({ type: 'reviews', data: data || [], productId });
    setDrawerOpen(true);
  }

  async function bulkApprove() {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: 'active' } : p));
    await supabase.from('products').update({ status: 'active', updated_at: new Date().toISOString() }).in('id', selectedIds);
    setSelectedIds([]); toast.success(`${selectedIds.length} products approved`);
  }
  async function bulkDeactivate() {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, status: 'inactive' } : p));
    await supabase.from('products').update({ status: 'inactive', updated_at: new Date().toISOString() }).in('id', selectedIds);
    setSelectedIds([]); toast.success(`${selectedIds.length} products deactivated`);
  }
  async function bulkFeature() {
    setProducts(prev => prev.map(p => selectedIds.includes(p.id) ? { ...p, is_featured: true } : p));
    await supabase.from('products').update({ is_featured: true }).in('id', selectedIds);
    setSelectedIds([]); toast.success(`${selectedIds.length} products featured`);
  }
  async function bulkDelete() {
    if (!confirm(`Delete ${selectedIds.length} products? This cannot be undone.`)) return;
    setProducts(prev => prev.filter(p => !selectedIds.includes(p.id)));
    await supabase.from('products').delete().in('id', selectedIds);
    setSelectedIds([]); toast.success(`${selectedIds.length} products deleted`);
  }

  // Generate actionable dropdown menu items
  function getProductActions(product: Product) {
    const actions: any[] = [];
    actions.push({ label: 'View in Store', icon: Eye, action: 'view' });
    actions.push({ label: 'Edit Product Info', icon: Pencil, action: 'edit' });
  
    if (!product.vendor_id || !product.vendor?.full_name) {
      actions.push({ label: 'Assign Seller', icon: UserPlus, action: 'assign_seller', color: 'blue' });
    } else {
      actions.push({ label: 'Reassign Seller', icon: UserCog, action: 'assign_seller' });
    }
  
    actions.push({ type: 'divider' });
  
    if (['in_review', 'pending_review'].includes(product.status)) {
      actions.push({ label: 'Approve & Activate', icon: CheckCircle, action: 'approve', color: 'emerald' });
      actions.push({ label: 'Reject', icon: XCircle, action: 'reject', color: 'red' });
    }
    if (product.status === 'draft') actions.push({ label: 'Force Activate', icon: Rocket, action: 'force_activate', color: 'emerald' });
    
    if (product.status === 'active' || product.status === 'published') {
      actions.push({ label: 'Deactivate', icon: EyeOff, action: 'deactivate', color: 'amber' });
      actions.push({ label: product.is_featured ? 'Remove Featured' : 'Feature Product', icon: Star, action: product.is_featured ? 'unfeature' : 'feature' });
    }
    
    if (['inactive', 'out_of_stock', 'rejected', 'archived'].includes(product.status)) {
      actions.push({ label: 'Reactivate', icon: RefreshCw, action: 'reactivate', color: 'emerald' });
    }
    if (product.status === 'rejected') actions.push({ label: 'Restore to Draft', icon: RotateCcw, action: 'restore_draft' });
  
    actions.push({ type: 'divider' });
    actions.push({ label: 'View Orders', icon: ShoppingBag, action: 'view_orders' });
    actions.push({ label: 'View Reviews', icon: Star, action: 'view_reviews' });
    actions.push({ label: 'Edit Stock', icon: Package, action: 'edit_stock' });
  
    actions.push({ type: 'divider' });
    actions.push({ label: 'Delete Product', icon: Trash2, action: 'delete', color: 'red' });
  
    return actions;
  }

  const handleActionClick = (actionName: string, product: any) => {
    setDropdownOpenId(null);
    if (actionName === 'view') window.open(`/shop/${product.slug}`, '_blank');
    if (actionName === 'edit') toast.error("Inline edit modal pending UI completion"); 
    if (actionName === 'assign_seller') setAssignModalOpen({open: true, product});
    if (actionName === 'approve') approveProduct(product);
    if (actionName === 'reject') setRejectModalOpen({open: true, product});
    if (actionName === 'force_activate' || actionName === 'reactivate') toggleProductStatus(product, 'active');
    if (actionName === 'deactivate') toggleProductStatus(product, 'inactive');
    if (actionName === 'restore_draft') toggleProductStatus(product, 'draft');
    if (actionName === 'feature' || actionName === 'unfeature') toggleFeatured(product);
    if (actionName === 'edit_stock') { setStockVal(product.stock_quantity); setStockModalOpen({open: true, product}); }
    if (actionName === 'view_orders') loadProductOrders(product.id);
    if (actionName === 'view_reviews') loadProductReviews(product.id);
    if (actionName === 'delete') setDeleteModalOpen({open: true, product});
  };

  return (
    <div className="min-h-full bg-gray-50 pb-20">
      
      {/* MODALS */}
      {rejectModalOpen.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Reject Product</h3>
            <textarea className="w-full border rounded-xl p-3 text-sm focus:ring-1 outline-none resize-none mb-4" rows={3} placeholder="Provide reason..." value={rejectReason} onChange={e=>setRejectReason(e.target.value)} />
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setRejectModalOpen({open:false, product:null})} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={rejectProductAction} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg">Reject</button>
            </div>
          </div>
        </div>
      )}

      {assignModalOpen.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl h-[400px] flex flex-col">
            <h3 className="font-bold text-gray-900 mb-2">Assign Seller to {assignModalOpen.product?.name}</h3>
            <input type="text" placeholder="Search sellers..." value={sellerSearch} onChange={e=>handleAssignSellerSearch(e.target.value)} className="w-full border border-gray-200 focus:border-emerald-500 outline-none rounded-xl px-4 py-2 text-sm mb-4" />
            <div className="flex-1 overflow-y-auto space-y-2">
              {sellers.map(s => (
                <button key={s.id} onClick={() => assignSeller(assignModalOpen.product.id, s.id, s.full_name, assignModalOpen.product.name)} className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl border border-transparent hover:border-gray-100 text-left">
                  <img src={s.avatar_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full" />
                  <div><p className="font-bold text-sm text-gray-900 leading-tight">{s.full_name}</p><p className="text-xs text-gray-500">{s.email}</p></div>
                </button>
              ))}
              {sellers.length === 0 && sellerSearch.length > 1 && <p className="text-sm text-gray-500 text-center py-4">No sellers found</p>}
            </div>
            <div className="pt-4 flex justify-end"><button onClick={()=>setAssignModalOpen({open:false, product:null})} className="px-4 py-2 font-medium bg-gray-100 rounded-lg">Close</button></div>
          </div>
        </div>
      )}

      {stockModalOpen.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-xl">
            <h3 className="font-bold text-gray-900 mb-4">Edit Stock Quantity</h3>
            <input type="number" min="0" value={stockVal} onChange={e=>setStockVal(parseInt(e.target.value, 10))} className="w-full border rounded-xl p-3 text-center text-xl font-bold mb-4 focus:ring-1 outline-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setStockModalOpen({open:false, product:null})} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={submitEditStock} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg w-full">Save Stock</button>
            </div>
          </div>
        </div>
      )}

      {deleteModalOpen.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4"><Trash2 className="w-6 h-6 text-red-600" /></div>
            <h3 className="font-bold text-gray-900 text-lg">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-4">Type <span className="font-bold text-gray-900">{deleteModalOpen.product?.name}</span> below to confirm deletion. This cannot be undone.</p>
            <input type="text" value={deleteConfirmText} onChange={e=>setDeleteConfirmText(e.target.value)} className="w-full border rounded-xl p-3 text-sm focus:border-red-500 outline-none mb-4" />
            <div className="flex gap-2 justify-end">
              <button onClick={()=>setDeleteModalOpen({open:false, product:null})} className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg w-full">Cancel</button>
              <button onClick={deleteProductAction} disabled={deleteConfirmText !== deleteModalOpen.product?.name} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg w-full disabled:opacity-50">Confirm Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* DRAWERS */}
      <SlideOverDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title={drawerContent.type === 'orders' ? 'Product Orders' : 'Product Reviews'}>
        {drawerContent.type === 'orders' && (
          drawerContent.data.length === 0
            ? <EmptyState icon={ShoppingBag} title="No orders yet" message="This product hasn't been ordered yet" />
            : <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">{drawerContent.data.length} order item(s)</p>
                {drawerContent.data.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-700">#{item.order.order_number}</span>
                      <StatusBadge status={item.order.status} />
                    </div>
                    <div className="flex items-center gap-2">
                      <img src={item.order.student?.avatar_url || 'https://via.placeholder.com/40'} className="w-6 h-6 rounded-full" />
                      <span className="text-sm text-gray-600">{item.order.student?.full_name}</span>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>Qty: {item.quantity} &times; ₹{item.unit_price}</span>
                      <span className="font-bold text-gray-900">₹{item.total_price}</span>
                    </div>
                  </div>
                ))}
              </div>
        )}
        {drawerContent.type === 'reviews' && (
          drawerContent.data.length === 0
            ? <EmptyState icon={Star} title="No reviews yet" message="No one has reviewed this product yet" />
            : <div className="space-y-4">
                <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4">
                  <span className="text-3xl font-bold text-amber-600">{(drawerContent.data.reduce((s, r) => s + r.rating, 0) / drawerContent.data.length).toFixed(1)}</span>
                  <div>
                    <div className="flex text-amber-400 text-sm">★★★★★</div>
                    <p className="text-xs text-amber-600">{drawerContent.data.length} reviews</p>
                  </div>
                </div>
                {drawerContent.data.map(review => (
                  <div key={review.id} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm font-bold text-gray-900 mb-1">{review.student?.full_name}</p>
                    <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                    <div className="flex text-amber-400 text-xs">{"★".repeat(Math.round(review.rating))}</div>
                  </div>
                ))}
            </div>
        )}
      </SlideOverDrawer>


      {/* PAGE CONTENT */}
      <div className="bg-white border-b border-gray-200 px-8 pt-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Products Master</h1>
        <p className="text-gray-500 text-sm mb-6">{tabCounts.active || 0} active &middot; {tabCounts.pending_review || 0} pending review &middot; {products.length} total</p>
        
        <div className="flex overflow-x-auto border-b border-gray-200 no-scrollbar gap-2">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors flex flex-col md:flex-row items-center gap-2 pt-2
                ${activeTab === tab.key ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}
              `}
            >
              <span>{tab.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab.key ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-500'}`}>
                {tabCounts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center gap-3 mb-6 relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search product, seller, category..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 grid border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none" />
        </div>

        {/* BULK ACTIONS */}
        {selectedIds.length > 0 && (
          <div className="flex flex-col md:flex-row md:items-center gap-3 px-5 py-3 bg-gray-900 text-white rounded-2xl mb-6 shadow-xl animate-in slide-in-from-top-2">
            <span className="text-sm font-medium">{selectedIds.length} products selected</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <button onClick={bulkApprove} className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 rounded-lg text-sm font-medium">✓ Approve</button>
              <button onClick={bulkDeactivate} className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm">Deactivate</button>
              <button onClick={bulkFeature} className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 rounded-lg text-sm">⭐ Feature</button>
              <button onClick={bulkDelete} className="px-3 py-1.5 bg-red-500 hover:bg-red-400 rounded-lg text-sm font-bold">🗑 Delete</button>
              <div className="w-px h-6 bg-gray-700 mx-1 hidden sm:block"></div>
              <button onClick={() => setSelectedIds([])} className="px-2 py-1.5 hover:bg-gray-800 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-4 py-3 w-10 text-center"><input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={e => setSelectedIds(e.target.checked ? filtered.map(p=>p.id) : [])} className="rounded border-gray-300 accent-gray-900 w-4 h-4" /></th>
                  <th className="px-4 py-4 min-w-[300px]">Product</th>
                  <th className="px-4 py-4 min-w-[200px]">Seller</th>
                  <th className="px-4 py-4">Category</th>
                  <th className="px-4 py-4 text-right">Price</th>
                  <th className="px-4 py-4 text-center">Stock</th>
                  <th className="px-4 py-4 text-center">Rating</th>
                  <th className="px-4 py-4 text-center w-32">Status</th>
                  <th className="px-4 py-4 text-center w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80">
                {filtered.map(product => {
                  const isChecked = selectedIds.includes(product.id);
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50/50 transition-colors ${isChecked ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-4 py-3 text-center"><input type="checkbox" checked={isChecked} onChange={e => setSelectedIds(prev => e.target.checked ? [...prev, product.id] : prev.filter(id => id !== product.id))} className="rounded border-gray-300 accent-gray-900 w-4 h-4" /></td>
                      
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {product.images?.[0] ? <img src={product.images[0].url || product.images[0]} alt="" className="w-12 h-12 rounded-xl object-cover border border-gray-200" /> : <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center"><Package className="w-5 h-5 text-gray-300" /></div>}
                            {product.is_featured && <span className="absolute -top-1.5 -right-1.5 text-amber-500 drop-shadow-sm text-sm" title="Featured">⭐</span>}
                          </div>
                          <div className="min-w-0 pr-4">
                            <p className="text-sm font-bold text-gray-900 truncate leading-tight mb-1" title={product.name}>{product.name}</p>
                            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                              {product.sku && <span className="text-[10px] uppercase font-bold text-gray-400 bg-gray-100 px-1.5 rounded">{product.sku}</span>}
                              {product.tags?.length > 0 && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-md font-medium">{product.tags[0]}{product.tags.length > 1 ? ` +${product.tags.length-1}` : ''}</span>}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        {product.vendor?.id ? (
                          <div className="flex items-center gap-3">
                            <img src={product.vendor.avatar_url || 'https://via.placeholder.com/40'} className="w-8 h-8 rounded-full border border-gray-200" />
                            <div className="min-w-0 leading-tight">
                              <p className="text-sm font-semibold text-gray-900 truncate" title={product.vendor.store_name || product.vendor.full_name}>{product.vendor.store_name || product.vendor.full_name}</p>
                              <p className="text-[11px] text-gray-500 truncate" title={product.vendor.email}>{product.vendor.email}</p>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => setAssignModalOpen({open: true, product})} className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md hover:bg-indigo-100 w-fit uppercase tracking-wider">
                            <UserPlus className="w-3.5 h-3.5" /> Assign Seller
                          </button>
                        )}
                      </td>

                      <td className="px-4 py-4"><span className="text-sm font-medium text-gray-600">{product.category?.name || '—'}</span></td>

                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                        {product.original_price && product.original_price > product.price && (
                          <div className="flex items-center justify-end gap-1 mt-0.5">
                            <span className="text-[10px] text-gray-400 line-through">₹{product.original_price}</span>
                            <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1 rounded">-{Math.round(((product.original_price-product.price)/product.original_price)*100)}%</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className={`text-sm font-bold ${product.stock_quantity === 0 ? 'text-red-500' : product.stock_quantity < 10 ? 'text-amber-500' : 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md'}`}>
                          {product.stock_quantity === 0 ? 'Out' : product.stock_quantity}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        {product.rating_count > 0 ? (
                          <div className="flex items-center justify-center gap-1"><span className="text-amber-400 text-xs">★</span><span className="text-sm font-bold text-gray-900">{product.rating?.toFixed(1)}</span><span className="text-[10px] text-gray-400">({product.rating_count})</span></div>
                        ) : <span className="text-xs text-gray-300">—</span>}
                      </td>

                      <td className="px-4 py-4 text-center relative">
                        <StatusBadge status={product.status} />
                      </td>

                      <td className="px-4 py-4 text-center relative">
                        <button onClick={() => setDropdownOpenId(dropdownOpenId === product.id ? null : product.id)} className="p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200">
                          <MoreVertical className="w-5 h-5 text-gray-600" />
                        </button>
                        {dropdownOpenId === product.id && (
                          <div className="absolute right-8 top-10 w-48 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 z-50 py-2 animate-in fade-in zoom-in-95 duration-100">
                            {getProductActions(product).map((action, i) => (
                              action.type === 'divider' ? <div key={i} className="h-px bg-gray-100 my-1"></div> :
                              <button key={i} onClick={() => handleActionClick(action.action, product)} className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center gap-2.5 transition-colors ${action.color === 'red' ? 'text-red-600 hover:bg-red-50' : action.color === 'emerald' ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-700 hover:bg-gray-50'}`}>
                                <action.icon className="w-4 h-4" /> {action.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="lg:hidden divide-y divide-gray-100">
            {filtered.map(product => (
              <div key={product.id} className="p-4 bg-white relative">
                <div className="absolute top-4 right-4 z-10">
                  <button onClick={() => setDropdownOpenId(dropdownOpenId === product.id ? null : product.id)} className="p-2 bg-gray-50 rounded-full border border-gray-100">
                    <MoreVertical className="w-4 h-4 text-gray-700" />
                  </button>
                  {dropdownOpenId === product.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl shadow-black/10 border border-gray-100 z-50 py-2">
                      {getProductActions(product).map((action, i) => (
                        action.type === 'divider' ? <div key={i} className="h-px bg-gray-100 my-1"></div> :
                        <button key={i} onClick={() => handleActionClick(action.action, product)} className={`w-full px-4 py-2.5 text-xs font-bold flex flex-row items-center gap-3 ${action.color === 'red' ? 'text-red-600' : 'text-gray-700'}`}>
                          <action.icon className="w-4 h-4" /> {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                    {product.images?.[0] ? <img src={product.images[0].url || product.images[0]} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-300" />}
                    {product.is_featured && <span className="absolute bottom-1 right-1 text-xs">⭐</span>}
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">{product.name}</h3>
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={product.status} />
                      <span className="text-xs font-bold text-gray-900">₹{product.price?.toLocaleString()}</span>
                    </div>
                    {product.vendor?.id ? (
                       <p className="text-xs text-gray-500 font-medium">By {product.vendor.store_name || product.vendor.full_name}</p>
                    ) : <span className="text-[10px] font-bold text-red-500 uppercase">Unassigned</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
