'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, MoreVertical, Loader2 } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { createClient } from '@/lib/supabase/client';
import { approveProduct, rejectProduct, unpublishProduct, deleteProduct } from '@/lib/actions/admin';
import { toast } from 'sonner';

interface AdminProductsClientProps {
  initialProducts: any[];
}

export default function AdminProductsClient({ initialProducts }: AdminProductsClientProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpenId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const channel = supabase.channel('admin-products')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? { ...p, ...payload.new } : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const counts = {
    all: products.length,
    pending: products.filter((p) => p.status === 'pending_review').length,
    published: products.filter((p) => p.status === 'published').length,
    draft: products.filter((p) => p.status === 'draft').length,
    rejected: products.filter((p) => p.status === 'rejected').length,
    archived: products.filter((p) => p.status === 'archived').length,
  };

  const filteredProducts = products.filter((p) => {
    const matchesTab = activeTab === 'all' || p.status === activeTab;
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.seller?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const handleApprove = async (id: string, name: string) => {
    setLoadingAction(`approve-${id}`);
    const result = await approveProduct(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Product approved and published');
    } else {
      toast.error(result.error || 'Failed to approve');
    }
    setDropdownOpenId(null);
  };

  const submitReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    setLoadingAction(`reject-${rejectingId}`);
    const result = await rejectProduct(rejectingId, rejectionReason);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Product rejected');
    } else {
      toast.error(result.error || 'Failed to reject');
    }
    setRejectingId(null);
    setRejectionReason('');
  };

  const handleUnpublish = async (id: string) => {
    setLoadingAction(`unpublish-${id}`);
    const result = await unpublishProduct(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Product unpublished (archived)');
    } else {
      toast.error(result.error || 'Failed to unpublish');
    }
    setDropdownOpenId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"? This cannot be undone.`)) return;
    setLoadingAction(`delete-${id}`);
    const result = await deleteProduct(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Product deleted');
    } else {
      toast.error(result.error || 'Failed to delete');
    }
    setDropdownOpenId(null);
  };

  return (
    <div className="min-h-full bg-gray-50 relative">
      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 m-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Product</h3>
            <p className="text-gray-500 text-sm mb-4">Please provide a reason for rejecting this product. The seller will see this feedback.</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
              rows={4}
              placeholder="e.g. Please clarify licensing terms..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex gap-3 justify-end mt-4">
              <button 
                onClick={() => { setRejectingId(null); setRejectionReason(''); }}
                className="px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                disabled={!rejectionReason.trim() || !!loadingAction}
                onClick={submitReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {loadingAction === `reject-${rejectingId}` ? 'Rejecting...' : 'Reject Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="text-gray-400 text-sm mt-1">
              {counts.published} published ·{' '}
              {counts.pending > 0 ? (
                <span className="text-amber-600 font-medium">{counts.pending} pending review</span>
              ) : (
                '0 pending review'
              )}{' '}
              · {counts.all} total
            </p>
          </div>
        </div>

        {/* FILTER TABS */}
        <div className="flex items-center gap-1 mt-4 -mb-px overflow-x-auto">
          {[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'pending_review', label: 'Pending Review', count: counts.pending, urgent: true },
            { value: 'published', label: 'Published', count: counts.published },
            { value: 'draft', label: 'Draft', count: counts.draft },
            { value: 'rejected', label: 'Rejected', count: counts.rejected },
            { value: 'archived', label: 'Archived', count: counts.archived },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                activeTab === tab.value
                  ? 'border-black text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    tab.urgent && tab.count > 0
                       ? 'bg-amber-100 text-amber-700'
                      : activeTab === tab.value
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-8 py-6">
        {/* SEARCH */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or seller name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none bg-white"
            />
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-visible">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wide">
            <div className="col-span-4">Product</div>
            <div className="col-span-2 hidden md:block">Seller</div>
            <div className="col-span-2 hidden lg:block">Category</div>
            <div className="col-span-1 text-center hidden md:block">Price</div>
            <div className="col-span-1 text-center hidden xl:block">Sales</div>
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-3 md:col-span-1 text-right">Actions</div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingBag className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No products found</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <div className="divide-y divide-gray-50 bg-white" ref={dropdownRef}>
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors relative ${
                        product.status === 'pending_review'
                          ? 'bg-amber-50/60 hover:bg-amber-50 border-l-4 border-l-amber-400'
                          : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                      }`}
                    >
                      {/* Product title + thumbnail */}
                      <div className="col-span-6 md:col-span-4 flex items-center gap-3 min-w-0">
                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 hidden sm:block">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full bg-gradient-to-br ${product.category?.gradient ?? 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                              <ShoppingBag className="w-5 h-5 text-white/80" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-gray-900 text-sm font-semibold truncate" title={product.name}>{product.name}</p>
                          {product.status === 'pending_review' && (
                            <p className="text-amber-600 text-[11px] mt-0.5 truncate">Waiting {formatRelativeTime(product.submitted_at)}</p>
                          )}
                          {product.status === 'rejected' && (
                            <p className="text-red-500 text-[11px] mt-0.5 truncate" title={product.rejection_reason}>{product.rejection_reason}</p>
                          )}
                          {!['pending_review', 'rejected'].includes(product.status) && (
                            <p className="text-gray-500 text-[11px] mt-0.5 capitalize">{product.file_type || 'Digital'}</p>
                          )}
                        </div>
                      </div>

                      {/* REAL Seller name + avatar */}
                      <div className="col-span-2 hidden md:flex items-center gap-2 min-w-0">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {product.seller?.avatar_url ? (
                            <img src={product.seller.avatar_url} className="w-full h-full object-cover" alt="Seller" />
                          ) : (
                            <span className="text-gray-600 text-xs font-bold">{product.seller?.full_name?.[0]?.toUpperCase() ?? '?'}</span>
                          )}
                        </div>
                        <span className="text-gray-700 text-sm truncate" title={product.seller?.full_name}>{product.seller?.full_name ?? 'Unknown'}</span>
                      </div>

                      {/* Category */}
                      <div className="col-span-2 hidden lg:block">
                        <span className="text-gray-500 text-sm truncate" title={product.category?.name}>{product.category?.name ?? '—'}</span>
                      </div>

                      {/* Price */}
                      <div className="col-span-1 text-center hidden md:block">
                        <span className="text-gray-700 text-sm font-medium">
                          {product.price === 0 ? <span className="text-emerald-600">Free</span> : `₹${product.price?.toLocaleString('en-IN')}`}
                        </span>
                      </div>

                      {/* Sales */}
                      <div className="col-span-1 text-center hidden xl:block">
                        <span className="text-gray-700 text-sm">{product.salesCount ?? 0}</span>
                      </div>

                      {/* Status badge */}
                      <div className="col-span-1 flex justify-center text-center">
                        {product.status === 'published' && <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full px-2.5 py-1">Published</span>}
                        {product.status === 'pending_review' && <span className="bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full px-2.5 py-1">In Review</span>}
                        {product.status === 'draft' && <span className="bg-gray-100 text-gray-600 text-[11px] font-bold rounded-full px-2.5 py-1">Draft</span>}
                        {product.status === 'rejected' && <span className="bg-red-50 text-red-600 text-[11px] font-bold rounded-full px-2.5 py-1">Rejected</span>}
                        {product.status === 'archived' && <span className="bg-gray-200 text-gray-700 text-[11px] font-bold rounded-full px-2.5 py-1">Archived</span>}
                      </div>

                      {/* Actions Dropdown */}
                      <div className="col-span-3 md:col-span-1 flex items-center justify-end relative">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === product.id ? null : product.id); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {dropdownOpenId === product.id && (
                          <div className="absolute right-0 top-10 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-20 py-1 overflow-hidden">
                            {product.status === 'pending_review' && (
                              <>
                                <button onClick={() => handleApprove(product.id, product.name)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">Approve</button>
                                <button onClick={() => { setRejectingId(product.id); setDropdownOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">Reject</button>
                                <div className="h-px bg-gray-100 my-1"></div>
                              </>
                            )}
                            {product.status === 'published' && (
                              <>
                                <button onClick={() => handleUnpublish(product.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">Unpublish</button>
                                <div className="h-px bg-gray-100 my-1"></div>
                              </>
                            )}
                            <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">View</a>
                            <div className="h-px bg-gray-100 my-1"></div>
                            <button onClick={() => handleDelete(product.id, product.name)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium">Delete Product</button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-3 p-4 bg-gray-50">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex gap-4">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200">
                        {product.images?.[0] ? (
                          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className={`w-full h-full bg-gradient-to-br ${product.category?.gradient ?? 'from-gray-400 to-gray-600'} flex items-center justify-center`}>
                            <ShoppingBag className="w-6 h-6 text-white/80" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-2">{product.name}</h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              {product.status === 'published' && <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full px-2 py-0.5">Published</span>}
                              {product.status === 'pending_review' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full px-2 py-0.5">In Review</span>}
                              {product.status === 'draft' && <span className="bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full px-2 py-0.5">Draft</span>}
                              {product.status === 'rejected' && <span className="bg-red-50 text-red-600 text-[10px] font-bold rounded-full px-2 py-0.5">Rejected</span>}
                              <span className="text-xs font-semibold text-gray-900">
                                {product.price === 0 ? 'Free' : `₹${product.price?.toLocaleString('en-IN')}`}
                              </span>
                            </div>
                          </div>
                          
                          {/* Mobile Actions Dropdown */}
                          <div className="relative">
                            <button 
                              onClick={(e) => { e.stopPropagation(); setDropdownOpenId(dropdownOpenId === product.id ? null : product.id); }}
                              className="p-1 -mr-1 rounded-lg hover:bg-gray-100 text-gray-500"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            {dropdownOpenId === product.id && (
                              <div className="absolute right-0 top-8 w-48 bg-white border border-gray-200 shadow-xl rounded-xl z-20 py-1 overflow-hidden">
                                {product.status === 'pending_review' && (
                                  <>
                                    <button onClick={() => handleApprove(product.id, product.name)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Approve</button>
                                    <button onClick={() => { setRejectingId(product.id); setDropdownOpenId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Reject</button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                  </>
                                )}
                                {product.status === 'published' && (
                                  <>
                                    <button onClick={() => handleUnpublish(product.id)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Unpublish</button>
                                    <div className="h-px bg-gray-100 my-1"></div>
                                  </>
                                )}
                                <a href={`/products/${product.slug}`} target="_blank" rel="noreferrer" className="w-full block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">View Page</a>
                                <div className="h-px bg-gray-100 my-1"></div>
                                <button onClick={() => handleDelete(product.id, product.name)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium">Delete Product</button>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-1.5 truncate pr-2">
                            {product.seller?.avatar_url ? (
                              <img src={product.seller.avatar_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                            ) : (
                              <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                {product.seller?.full_name?.[0]?.toUpperCase() ?? '?'}
                              </div>
                            )}
                            <span className="truncate">{product.seller?.full_name ?? 'Unknown'}</span>
                          </div>
                          <span>{product.salesCount ?? 0} Sales</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
