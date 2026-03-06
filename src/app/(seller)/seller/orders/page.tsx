'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ShoppingBag } from 'lucide-react'

type OrderGroup = {
  order: any
  items: any[]
}

export default function SellerOrdersPage() {
  const supabase = createClient()
  const [orderGroups, setOrderGroups] = useState<Record<string, OrderGroup>>({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadOrders()

    // Real-time: new orders
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      const channel = supabase.channel('seller-orders')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'order_items',
          filter: `vendor_id=eq.${user.id}`
        }, () => {
          loadOrders()
          toast.info('🛍️ New order received!')
        })
        .subscribe()
      return () => supabase.removeChannel(channel)
    })
  }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: items, error } = await supabase
        .from('order_items')
        .select(`
          id, item_name, quantity, unit_price, total_price,
          product:products(id, name, images),
          order:orders!inner(
            id, order_number, status, payment_method,
            billing_details, shipping_address, created_at, updated_at,
            student_id
          )
        `)
        .eq('vendor_id', user.id)   // ← requires vendor_id column to be set on order_items
        .order('order(created_at)', { ascending: false })

      if (error) throw error
      
      const ordersData = items || [];
      const studentIds = Array.from(new Set(ordersData.map((item: any) => item.order?.student_id).filter(Boolean)));
      
      let profilesMap: Record<string, any> = {};
      if (studentIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', studentIds);
          
        if (profiles) {
           profilesMap = profiles.reduce((acc: any, p: any) => ({ ...acc, [p.id]: p }), {});
        }
      }

      // Group by order_id
      const groups: Record<string, OrderGroup> = {}
      for (const item of ordersData) {
        (item.order as any).student = profilesMap[(item.order as any)?.student_id as string] || null;
        const orderId = (item.order as any).id
        if (!groups[orderId]) {
          groups[orderId] = {
            order: item.order,
            items: []
          }
        }
        groups[orderId].items.push(item)
      }
      setOrderGroups(groups)
    } catch (err: any) {
      console.error('Failed to load orders:', err)
      toast.error('Failed to load orders')
    } finally {
      setLoading(false)
    }
  }

  const statusOrder = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']
  const allOrders = Object.values(orderGroups)
  const filtered = allOrders.filter(g => {
    if (activeTab !== 'all' && g.order.status !== activeTab) return false
    if (search && !g.order.order_number?.toLowerCase().includes(search.toLowerCase()) &&
        !g.order.student?.full_name?.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const tabs = [
    { key: 'all', label: 'All Orders' },
    ...statusOrder.map(s => ({ key: s, label: s.charAt(0).toUpperCase() + s.slice(1) }))
  ]

  const tabCounts = tabs.reduce((acc, t) => {
    acc[t.key] = t.key === 'all' ? allOrders.length : allOrders.filter(g => g.order.status === t.key).length
    return acc
  }, {} as Record<string, number>)

  async function updateStatus(orderId: string, newStatus: string, studentId: string, orderNumber: string) {
    // Optimistic
    setOrderGroups(prev => ({
      ...prev,
      [orderId]: { ...prev[orderId], order: { ...prev[orderId].order, status: newStatus } }
    }))

    const { error } = await supabase.from('orders')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', orderId)

    if (error) { loadOrders(); toast.error('Failed to update status'); return }

    await supabase.from('notifications').insert({
      user_id: studentId, type: 'system',
      title: `Order ${orderNumber} — ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      title_ta: `ஆர்டர் ${orderNumber} — ${newStatus}`,
      message: `Your order has been updated to: ${newStatus}`,
      message_ta: `உங்கள் ஆர்டர் நிலை மாற்றப்பட்டது: ${newStatus}`,
      link: '/dashboard/orders'
    })

    toast.success(`Order marked as ${newStatus}`)
  }

  const transitions: Record<string, string[]> = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped: ['delivered'],
    delivered: [], cancelled: [],
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Incoming Orders</h1>
        <p className="text-sm text-gray-500 mt-1">Manage processing, shipping, and fulfillment</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
              ${activeTab === tab.key ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
            {tab.label}
            {tabCounts[tab.key] > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
                ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
                {tabCounts[tab.key]}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto shrink-0">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search order ID or student..."
            className="px-3 py-2 text-sm border border-gray-200 rounded-xl w-56 focus:outline-none" />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <OrderCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <ShoppingBag className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {activeTab === 'all' ? 'No orders yet' : `No ${activeTab} orders`}
          </h3>
          <p className="text-sm text-gray-400 max-w-xs">Orders from students will appear here once they purchase your products.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(({ order, items }) => (
            <OrderCard key={order.id} order={order} items={items}
              transitions={transitions}
              onStatusUpdate={updateStatus}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function OrderCardSkeleton() {
  return (
    <div className="bg-white border text-left border-gray-100 rounded-2xl p-5 animate-pulse">
      <div className="h-6 bg-gray-100 rounded w-1/4 mb-4"></div>
      <div className="h-4 bg-gray-100 rounded w-1/3 mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-1/2"></div>
    </div>
  );
}

function OrderCard({ order, items, transitions, onStatusUpdate }: { order: any; items: any[]; transitions: any; onStatusUpdate: any }) {
  const allowed = transitions[order.status] || [];
  return (
    <div className="bg-white border text-left border-gray-100 rounded-2xl p-5 shadow-sm">
      <div className="flex justify-between items-start border-b border-gray-50 pb-4 mb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 border border-gray-200 inline-block px-2 py-0.5 rounded shadow-sm bg-gray-50 mb-2">
            Order {order.order_number}
          </h3>
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden shrink-0 mt-1">
                {order.student?.avatar_url ? (
                  <img src={order.student.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs font-bold text-gray-400">
                    {order.student?.full_name?.[0] || '?'}
                  </div>
                )}
             </div>
             <div>
                <p className="text-sm font-semibold text-gray-900">{order.student?.full_name || 'Anonymous Student'}</p>
                <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
             </div>
          </div>
        </div>
        <div className="text-right">
           <span className={`px-2 py-1 rounded text-xs font-bold uppercase
             ${order.status === 'pending' ? 'bg-gray-100 text-gray-600' :
               order.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
               order.status === 'shipped' ? 'bg-purple-50 text-purple-600' :
               order.status === 'delivered' ? 'bg-emerald-50 text-emerald-600' :
               'bg-red-50 text-red-600'
             }`}>
             {order.status}
           </span>
           <p className="text-xs text-gray-500 mt-2">Payment: <span className="font-semibold text-gray-700 capitalize">{order.payment_status} ({order.payment_method})</span></p>
        </div>
      </div>
      
      <div className="space-y-3">
        {items.map(item => {
           const image = Array.isArray(item.product?.images) && item.product.images.length > 0 ? item.product.images[0].url : null;
           return (
             <div key={item.id} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
               {image ? (
                 <img src={image} className="w-12 h-12 rounded-lg object-cover border border-gray-200 shrink-0" />
               ) : (
                 <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0 border border-gray-200">
                    <ShoppingBag className="w-4 h-4 text-gray-400" />
                 </div>
               )}
               <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.item_name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.unit_price?.toLocaleString('en-IN')}</p>
               </div>
               <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹{item.total_price?.toLocaleString('en-IN')}</p>
               </div>
             </div>
           )
        })}
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t pt-4 border-gray-50">
         {allowed.map((s: string) => (
           <button key={s}
             onClick={() => onStatusUpdate(order.id, s, order.student_id, order.order_number)}
             className="px-4 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 capitalize">
             Mark as {s}
           </button>
         ))}
      </div>
    </div>
  );
}
