'use client';

import { useState, useMemo } from 'react';
import { Search, ShoppingCart, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';

interface AdminOrdersClientProps {
  initialOrders: any[];
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  paid: { label: 'Paid', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-100' },
  failed: { label: 'Failed', color: 'text-red-700', bg: 'bg-red-100' },
  refunded: { label: 'Refunded', color: 'text-gray-700', bg: 'bg-gray-100' },
};

export default function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');

  const counts = {
    all: initialOrders.length,
    paid: initialOrders.filter((o) => o.status === 'paid').length,
    pending: initialOrders.filter((o) => o.status === 'pending').length,
    failed: initialOrders.filter((o) => o.status === 'failed').length,
    refunded: initialOrders.filter((o) => o.status === 'refunded').length,
  };

  const filteredOrders = useMemo(() => {
    let result = activeTab === 'all' ? initialOrders : initialOrders.filter((o) => o.status === activeTab);
    if (search) {
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(search.toLowerCase()) ||
          o.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          o.student?.email?.toLowerCase().includes(search.toLowerCase()) ||
          o.itemsSummary.toLowerCase().includes(search.toLowerCase())
      );
    }
    return result;
  }, [initialOrders, activeTab, search]);

  const totalRevenue = initialOrders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + (o.total_amount || 0), 0);

  return (
    <div className="min-h-full bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-gray-400 text-sm mt-1">
              {counts.all} total orders · ₹{totalRevenue.toLocaleString('en-IN')} total revenue
            </p>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 mt-4 -mb-px overflow-x-auto">
          {[
            { value: 'all', label: 'All', count: counts.all },
            { value: 'paid', label: 'Paid', count: counts.paid },
            { value: 'pending', label: 'Pending', count: counts.pending },
            { value: 'failed', label: 'Failed', count: counts.failed },
            { value: 'refunded', label: 'Refunded', count: counts.refunded },
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
                    activeTab === tab.value
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
        {/* STATS OVERVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Total Sales</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </span>
              <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                <ArrowUpRight className="w-4 h-4" /> 0% {/* Placeholder for growth */}
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Successful Orders</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{counts.paid}</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Average Order Value</h3>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">
                ₹{counts.paid > 0 ? Math.round(totalRevenue / counts.paid).toLocaleString('en-IN') : 0}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by order ID, customer, or items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none bg-white"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center">
              <ShoppingCart className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No orders found</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                      <th className="px-6 py-4">Order ID & Date</th>
                      <th className="px-6 py-4 truncate">Customer</th>
                      <th className="px-6 py-4">Items</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredOrders.map((order) => {
                      const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                      return (
                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-900 truncate w-32" title={order.id}>
                              #{order.id.split('-')[0]}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3" />
                              {new Date(order.created_at).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                {order.student?.avatar_url ? (
                                  <img src={order.student.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-gray-500">
                                    {order.student?.full_name?.[0]?.toUpperCase() ?? '?'}
                                  </span>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 truncate" title={order.student?.full_name}>
                                  {order.student?.full_name ?? 'Unknown Customer'}
                                </p>
                                <p className="text-xs text-gray-500 truncate" title={order.student?.email}>
                                  {order.student?.email}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-[250px]">
                            <p className="truncate text-gray-700" title={order.itemsSummary}>
                              {order.itemsSummary}
                            </p>
                            {order.totalItems > 1 && (
                              <p className="text-[11px] text-gray-400 mt-0.5">
                                {order.totalItems} items
                              </p>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="font-medium text-gray-900">
                              ₹{order.total_amount?.toLocaleString('en-IN')}
                            </span>
                            <p className="text-[11px] text-gray-400 mt-0.5 capitalize">
                              {order.payment_method?.replace('_', ' ')}
                            </p>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold ${conf.bg} ${conf.color}`}>
                              {conf.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-3 p-4 bg-gray-50">
                {filteredOrders.map((order) => {
                  const conf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                  return (
                    <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between mb-3 border-b border-gray-50 pb-3">
                        <div>
                          <p className="font-bold text-gray-900 tracking-tight text-sm">#{order.id.split('-')[0]}</p>
                          <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                            })}
                          </div>
                        </div>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${conf.bg} ${conf.color}`}>
                          {conf.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {order.student?.avatar_url ? (
                            <img src={order.student.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-500">
                              {order.student?.full_name?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{order.student?.full_name ?? 'Unknown Customer'}</p>
                          <p className="text-xs text-gray-500 truncate">{order.student?.email}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-xs mb-3 bg-gray-50 rounded-lg p-2.5">
                        <div className="text-gray-600">
                          <span className="block text-gray-400 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Amount</span>
                          <span className="font-bold text-gray-900">₹{order.total_amount?.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-gray-500 ml-1">({order.payment_method?.replace('_', ' ')})</span>
                        </div>
                        <div className="text-gray-600 text-right">
                          <span className="block text-gray-400 mb-0.5 text-[10px] uppercase font-bold tracking-wider">Items</span>
                          <span className="font-semibold text-gray-700">{order.totalItems} items</span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 italic leading-relaxed">
                        "{order.itemsSummary}"
                      </p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
