'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function SellerEarningsPage() {
  const supabase = createClient()
  const [earnings, setEarnings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('seller_earnings')
          .select(`
            id, gross_amount, net_amount, platform_fee, status, paid_at, created_at,
            product:products!product_id(id, name, images)
          `)
          .eq('vendor_id', user.id)   // ← vendor_id
          .order('created_at', { ascending: false })

        if (error) {
          // Table might not exist yet — show empty state gracefully
          console.error('seller_earnings error:', error)
          setEarnings([])
          return
        }
        setEarnings(data || [])
      } catch (err) {
        console.error(err)
        setEarnings([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // STATS
  const totalEarned = earnings.filter(e => e.status === 'paid').reduce((s, e) => s + e.net_amount, 0)
  const pendingPayout = earnings.filter(e => e.status === 'pending').reduce((s, e) => s + e.net_amount, 0)
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()
  const thisMonth = earnings.filter(e => e.created_at >= startOfMonth).reduce((s, e) => s + e.net_amount, 0)

  // Monthly chart data (last 6 months)
  const chartData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date()
    d.setMonth(d.getMonth() - (5 - i))
    const monthKey = d.toISOString().substring(0, 7) // "2026-03"
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short' })
    const monthEarnings = earnings.filter(e => e.created_at?.startsWith(monthKey))
    return {
      month: monthLabel,
      gross: monthEarnings.reduce((s, e) => s + e.gross_amount, 0),
      net: monthEarnings.reduce((s, e) => s + e.net_amount, 0),
    }
  })

  if (loading) return (
     <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-4 gap-4">
           {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse"></div>)}
        </div>
     </div>
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Earnings</h1>
        <p className="text-sm text-gray-500 mt-1">Track your revenue and payout history</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="💰" label="Total Earned" value={`₹${totalEarned.toLocaleString('en-IN')}`} sub="All time" color="emerald" />
        <StatCard icon="⏳" label="Pending Payout" value={`₹${pendingPayout.toLocaleString('en-IN')}`} sub="Processing" color="amber" />
        <StatCard icon="📅" label="This Month" value={`₹${thisMonth.toLocaleString('en-IN')}`} sub={new Date().toLocaleDateString('en-IN', { month: 'long' })} color="blue" />
        <StatCard icon="📦" label="Total Sales" value={earnings.length.toString()} sub="Transactions" color="gray" />
      </div>

      {/* Commission info card */}
      <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="text-2xl">💡</div>
        <div>
          <p className="text-sm font-semibold text-emerald-800">Your Earnings Split</p>
          <p className="text-xs text-emerald-600 mt-0.5">You earn <strong>70%</strong> of every sale. Platform keeps <strong>30%</strong>. Payouts processed monthly.</p>
        </div>
      </div>

      {earnings.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <span className="text-3xl">💸</span>
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">No earnings yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">When students purchase your products, your earnings will show here.</p>
          <Link href="/seller/products" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
            View My Products
          </Link>
        </div>
      ) : (
        <>
          {/* Revenue chart */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Monthly Revenue</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={v => `₹${v}`} />
                <Tooltip formatter={(v: number) => [`₹${v.toLocaleString('en-IN')}`, '']} />
                <Bar dataKey="gross" fill="#d1fae5" name="Gross" radius={[4, 4, 0, 0]} />
                <Bar dataKey="net" fill="#059669" name="Your Earnings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Transaction history */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-50">
              <h2 className="text-sm font-semibold text-gray-700">Transaction History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3 text-right">Gross</th>
                    <th className="px-4 py-3 text-right">Your 70%</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {earnings.map((e: any) => (
                    <tr key={e.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center gap-2">
                          {e.product?.images?.[0]?.url
                            ? <img src={e.product.images[0].url} className="w-8 h-8 rounded-lg object-cover" />
                            : <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                          }
                          <span className="text-sm font-medium text-gray-700 line-clamp-1">{e.product?.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-500">₹{e.gross_amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-700">₹{e.net_amount.toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold
                          ${e.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          {e.status === 'paid' ? '✓ Paid' : '⏳ Pending'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(e.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, sub, color }: any) {
  const c: any = {
     emerald: 'from-emerald-50 to-emerald-100/50 border-emerald-100 text-emerald-700',
     amber: 'from-amber-50 to-amber-100/50 border-amber-100 text-amber-700',
     blue: 'from-blue-50 to-blue-100/50 border-blue-100 text-blue-700',
     gray: 'from-gray-50 to-gray-100/50 border-gray-100 text-gray-700'
  }
  return (
    <div className={`rounded-2xl border p-5 bg-gradient-to-br ${c[color]}`}>
       <div className="text-2xl mb-2">{icon}</div>
       <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
       <div className="text-sm font-medium text-gray-700">{label}</div>
       <div className="text-xs mt-1 opacity-70">{sub}</div>
    </div>
  )
}
