'use client';

import { useState } from 'react';
import { IndianRupee, TrendingUp, Search, Download, CheckCircle, CreditCard, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface AdminEarningsClientProps {
  initialData: {
    overview: {
      grossTotal: number;
      platformTotal: number;
      payoutTotal: number;
    };
    payoutList: any[];
  };
}

export default function AdminEarningsClient({ initialData }: AdminEarningsClientProps) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filteredPayouts = initialData.payoutList.filter((p) => {
    if (activeTab !== 'all' && p.user.role !== activeTab) return false;
    if (search) {
      return (
        p.user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        p.user.email?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return true;
  });

  const handlePayout = async (id: string, name: string) => {
    setProcessingId(id);
    // Simulate API call for payout
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success(`Payout successfully initiated for ${name}`);
    setProcessingId(null);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* HEADER & OVERVIEW */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 pt-5 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Earnings & Payouts</h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage platform revenue and author payouts
              </p>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm">
              <Download size={16} />
              Export Report
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-5">
                <IndianRupee size={120} />
              </div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Total Gross Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                ₹{initialData.overview.grossTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-emerald-600">
                <TrendingUp size={120} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-emerald-800">Platform Revenue</p>
                <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded-md">30%</span>
              </div>
              <p className="text-3xl font-bold text-emerald-700">
                ₹{initialData.overview.platformTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute -right-4 -bottom-4 opacity-10 text-blue-600">
                <CreditCard size={120} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-blue-800">Author Payouts</p>
                <span className="text-[10px] font-bold bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded-md">70%</span>
              </div>
              <p className="text-3xl font-bold text-blue-700">
                ₹{initialData.overview.payoutTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </p>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-1 px-8 -mb-px overflow-x-auto border-t border-gray-100 pt-1">
          {[
            { value: 'all', label: 'All Authors' },
            { value: 'instructor', label: 'Instructors' },
            { value: 'seller', label: 'Sellers' },
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
              placeholder="Search by author name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-gray-900 outline-none bg-white"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {filteredPayouts.length === 0 ? (
            <div className="py-16 text-center">
              <IndianRupee className="w-8 h-8 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No earning records found</p>
            </div>
          ) : (
            <>
              {/* DESKTOP TABLE */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                      <th className="px-6 py-4">Author</th>
                      <th className="px-6 py-4 text-center">Total Sales</th>
                      <th className="px-6 py-4 text-right">Gross Sales</th>
                      <th className="px-6 py-4 text-right hidden xl:table-cell">Platform Fee (30%)</th>
                      <th className="px-6 py-4 text-right border-l-2 border-dashed border-gray-200 bg-blue-50/30 text-blue-800">Net Payout (70%)</th>
                      <th className="px-6 py-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-sm">
                    {filteredPayouts.map((row) => (
                      <tr key={row.user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 min-w-[220px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {row.user.avatar_url ? (
                                <img src={row.user.avatar_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-sm font-bold text-gray-500">
                                  {row.user.full_name?.[0]?.toUpperCase() ?? '?'}
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate" title={row.user.full_name}>
                                {row.user.full_name ?? 'Unknown'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <p className="text-xs text-gray-500 truncate" title={row.user.email}>
                                  {row.user.email}
                                </p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${row.user.role === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                                  {row.user.role}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-gray-700">
                          {row.totalSales}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="font-semibold text-gray-700">
                            ₹{row.grossRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right hidden xl:table-cell">
                          <span className="font-medium text-emerald-700">
                            ₹{row.platformFee.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right border-l-2 border-dashed border-gray-200 bg-blue-50/10">
                          <span className="font-bold text-blue-700 text-base">
                            ₹{row.payoutAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button 
                            onClick={() => handlePayout(row.user.id, row.user.full_name)}
                            disabled={processingId === row.user.id || row.payoutAmount === 0}
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gray-900 border border-transparent rounded-xl text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 disabled:border-gray-200 transition-all"
                          >
                            {processingId === row.user.id ? (
                              'Processing...'
                            ) : (
                              <>
                                Send Payout <ChevronRight size={14} className="opacity-70 -mr-1" />
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden space-y-3 p-4 bg-gray-50">
                {filteredPayouts.map((row) => (
                  <div key={row.user.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between mb-4 border-b border-gray-50 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {row.user.avatar_url ? (
                            <img src={row.user.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-sm font-bold text-gray-500">
                              {row.user.full_name?.[0]?.toUpperCase() ?? '?'}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{row.user.full_name ?? 'Unknown'}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide ${row.user.role === 'instructor' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>
                              {row.user.role}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Sales</p>
                        <p className="font-semibold text-gray-700">{row.totalSales}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-gray-50/80 rounded-lg p-2.5">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Gross Revenue</p>
                        <p className="font-semibold text-gray-700">₹{row.grossRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </div>
                      <div className="bg-blue-50/50 rounded-lg p-2.5 border border-blue-100/50">
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">Net Payout (70%)</p>
                        <p className="font-bold text-blue-700">₹{row.payoutAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handlePayout(row.user.id, row.user.full_name)}
                      disabled={processingId === row.user.id || row.payoutAmount === 0}
                      className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-gray-900 border border-transparent rounded-xl text-white text-xs font-semibold hover:bg-gray-800 disabled:opacity-50 disabled:bg-gray-200 disabled:text-gray-500 transition-all"
                    >
                      {processingId === row.user.id ? (
                        'Processing...'
                      ) : (
                        <>
                          Send Payout <ChevronRight size={14} className="opacity-70 -mr-1" />
                        </>
                      )}
                    </button>
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
