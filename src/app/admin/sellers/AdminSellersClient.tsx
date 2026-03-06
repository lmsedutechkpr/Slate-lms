'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Store, ShoppingBag, CheckCircle, Clock, XCircle, Search, Loader2 } from 'lucide-react';
import { approveSeller, rejectSeller } from '@/lib/actions/admin';
import { toast } from 'sonner';

const APPROVAL_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: any }
> = {
  approved: {
    label: 'Approved',
    color: 'text-emerald-700',
    bg: 'bg-emerald-100',
    icon: CheckCircle,
  },
  pending: {
    label: 'Pending',
    color: 'text-amber-700',
    bg: 'bg-amber-100',
    icon: Clock,
  },
  rejected: {
    label: 'Rejected',
    color: 'text-red-700',
    bg: 'bg-red-100',
    icon: XCircle,
  },
};

interface AdminSellersClientProps {
  initialSellers: any[];
}

export default function AdminSellersClient({ initialSellers }: AdminSellersClientProps) {
  const [sellers, setSellers] = useState(initialSellers);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const pendingCount = sellers.filter((i: any) => i.approval_status === 'pending').length;
  const approvedCount = sellers.filter((i: any) => i.approval_status === 'approved').length;
  const rejectedCount = sellers.filter((i: any) => i.approval_status === 'rejected').length;

  const filteredSellers = useMemo(() => {
    let result = filter === 'all' ? sellers : sellers.filter((i: any) => i.approval_status === filter);
    if (search) {
      result = result.filter((i: any) =>
        i.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        i.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [sellers, filter, search]);

  const filterTabs = [
    { key: 'all', label: 'All', count: sellers.length },
    { key: 'pending', label: 'Pending Approval', count: pendingCount, highlight: true },
    { key: 'approved', label: 'Approved', count: approvedCount },
    { key: 'rejected', label: 'Rejected', count: rejectedCount },
  ];

  const handleApprove = async (id: string) => {
    setLoadingAction(`approve-${id}`);
    const result = await approveSeller(id);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Seller approved!');
      setSellers(prev => prev.map(inst => inst.id === id ? { ...inst, approval_status: 'approved' } : inst));
    } else {
      toast.error(result.error || 'Failed to approve');
    }
  };

  const handleReject = async () => {
    if (!rejectingId || !rejectionReason.trim()) return;
    setLoadingAction(`reject-${rejectingId}`);
    const result = await rejectSeller(rejectingId, rejectionReason);
    setLoadingAction(null);
    if (result.success) {
      toast.success('Seller rejected');
      setSellers(prev => prev.map(inst => inst.id === rejectingId ? { ...inst, approval_status: 'rejected' } : inst));
      setRejectingId(null);
      setRejectionReason('');
    } else {
      toast.error(result.error || 'Failed to reject');
    }
  };

  return (
    <div className="min-h-full bg-gray-50 relative">
      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-hidden">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 m-4 shadow-xl">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Reject Seller</h3>
            <p className="text-gray-500 text-sm mb-4">Provide a reason for rejection. This will be sent to the user.</p>
            <textarea
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none resize-none"
              rows={4}
              placeholder="e.g. Please provide more detailed credentials..."
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
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg disabled:opacity-50"
              >
                {loadingAction === `reject-${rejectingId}` ? 'Rejecting...' : 'Reject Application'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <h1 className="text-2xl font-bold text-gray-900">Sellers</h1>
        <p className="text-gray-400 text-sm mt-1">
          {approvedCount} approved · {pendingCount} pending · {sellers.length} total
        </p>
      </div>

      <div className="px-8 py-6 space-y-4">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {filterTabs.map((tab) => {
            const isActive = filter === tab.key;
            const isPending = tab.key === 'pending' && tab.count > 0;
            return (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  isActive
                    ? isPending
                      ? 'bg-amber-600 text-white'
                      : 'bg-gray-900 text-white'
                    : isPending
                    ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span
                    className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPending
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-gray-900/20 focus:border-gray-400"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {filteredSellers.length === 0 ? (
            <div className="py-16 text-center">
              <Store size={32} className="mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No sellers found</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                        Seller
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                        Status
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                        Products
                      </th>
                      <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-4">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredSellers.map((seller: any) => {
                      const conf = APPROVAL_CONFIG[seller.approval_status] || APPROVAL_CONFIG.pending;
                      const StatusIcon = conf.icon;
                      const isPending = seller.approval_status === 'pending';
                      return (
                        <tr
                          key={seller.id}
                          className={`hover:bg-gray-50 transition-colors ${
                            isPending ? 'bg-amber-50/40 border-l-4 border-l-amber-400' : ''
                          }`}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 text-sm font-bold overflow-hidden">
                                {seller.avatar_url ? (
                                  <img src={seller.avatar_url} alt={seller.full_name} className="w-10 h-10 object-cover" />
                                ) : (
                                  seller.full_name?.[0]?.toUpperCase() || '?'
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold text-gray-900 truncate" title={seller.full_name}>
                                  {seller.full_name || 'Unknown'}
                                </p>
                                <p className="text-xs text-gray-500 truncate" title={seller.email}>{seller.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full w-fit ${conf.bg} ${conf.color}`}>
                              <StatusIcon size={11} />
                              {conf.label}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-1.5">
                              <ShoppingBag size={13} className="text-gray-400 flex-shrink-0" />
                              <span className="text-sm text-gray-700 whitespace-nowrap">
                                {seller.publishedProducts}/{seller.totalProducts}
                              </span>
                              <span className="text-xs text-gray-400">published/total</span>
                            </div>
                            {seller.pendingProducts > 0 && (
                              <p className="text-xs text-amber-600 mt-0.5">
                                {seller.pendingProducts} pending review
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-xs text-gray-500">
                              {new Date(seller.created_at).toLocaleDateString('en-IN')}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {isPending && (
                                <>
                                  <button
                                    onClick={() => handleApprove(seller.id)}
                                    disabled={loadingAction === `approve-${seller.id}`}
                                    className="flex items-center gap-1.5 bg-emerald-600 text-white rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                                  >
                                    {loadingAction === `approve-${seller.id}` ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <CheckCircle size={12} />
                                    )}
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => setRejectingId(seller.id)}
                                    className="flex items-center gap-1.5 bg-red-100 text-red-700 rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-red-200 transition-colors"
                                  >
                                    <XCircle size={12} />
                                    Reject
                                  </button>
                                </>
                              )}
                              <Link href={`/admin/sellers/${seller.id}`}>
                                <button className="border border-gray-300 text-gray-700 rounded-xl px-3 py-1.5 text-xs font-medium hover:bg-gray-50 transition-colors">
                                  View
                                </button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-3 p-4">
                {filteredSellers.map((seller: any) => {
                  const conf = APPROVAL_CONFIG[seller.approval_status] || APPROVAL_CONFIG.pending;
                  const StatusIcon = conf.icon;
                  const isPending = seller.approval_status === 'pending';
                  
                  return (
                    <div key={seller.id} className={`bg-white rounded-xl p-4 border ${isPending ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'}`}>
                      <div className="flex items-start justify-between mb-3 gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 text-gray-600 text-sm font-bold overflow-hidden">
                            {seller.avatar_url ? (
                              <img src={seller.avatar_url} alt={seller.full_name} className="w-10 h-10 object-cover" />
                            ) : (
                              seller.full_name?.[0]?.toUpperCase() || '?'
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">
                              {seller.full_name || 'Unknown'}
                            </p>
                            <span className={`inline-flex mt-1 items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${conf.bg} ${conf.color}`}>
                              <StatusIcon size={10} />
                              {conf.label}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                        <div className="text-gray-500">
                          <p className="mb-0.5">Products</p>
                          <p className="font-semibold text-gray-900">{seller.publishedProducts}/{seller.totalProducts}</p>
                        </div>
                        <div className="text-gray-500 text-right">
                          <p className="mb-0.5">Joined</p>
                          <p className="font-semibold text-gray-900">{new Date(seller.created_at).toLocaleDateString('en-IN')}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleApprove(seller.id)}
                              disabled={loadingAction === `approve-${seller.id}`}
                              className="flex flex-1 items-center justify-center gap-1.5 bg-emerald-600 text-white rounded-xl px-3 py-2 text-xs font-semibold hover:bg-emerald-700 disabled:opacity-60 transition-colors"
                            >
                              {loadingAction === `approve-${seller.id}` ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(seller.id)}
                              className="flex flex-1 items-center justify-center gap-1.5 bg-red-100 text-red-700 rounded-xl px-3 py-2 text-xs font-semibold hover:bg-red-200 transition-colors"
                            >
                              <XCircle size={12} />
                              Reject
                            </button>
                          </>
                        )}
                        <Link href={`/admin/sellers/${seller.id}`} className={isPending ? '' : 'w-full'}>
                          <button className={`w-full border border-gray-300 text-gray-700 rounded-xl px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors`}>
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
