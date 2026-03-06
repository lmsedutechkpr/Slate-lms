'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, ShoppingBag, DollarSign, Star, TrendingUp, AlertTriangle } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils/format';
import { toast } from 'sonner';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function SellerDashboard() {
  const supabase = createClient();
  const [stats, setStats] = useState({ totalProducts: 0, activeOrders: 0, totalRevenue: 0, thisMonthRevenue: 0, avgRating: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [userName, setUserName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('store_name, full_name').eq('id', user.id).single();
      if (profile) setUserName(profile.store_name || profile.full_name || 'Seller');

      // Products
      const { data: products } = await supabase
        .from('products')
        .select('id, name, status, price, images, rating, rating_count, stock_quantity')
        .eq('vendor_id', user.id)
        .order('rating_count', { ascending: false });

      const totalProducts = products?.length || 0;
      const avgRating = products?.length
        ? (products.reduce((s, p) => s + (p.rating || 0), 0) / products.length).toFixed(1)
        : 0;

      const topProductsList = (products || [])
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);

      // Earnings
      const { data: earnings } = await supabase
        .from('seller_earnings')
        .select('gross_amount, net_amount, platform_fee, status, created_at')
        .eq('vendor_id', user.id);

      const totalRevenue = earnings?.reduce((s, e) => s + (e.net_amount || 0), 0) || 0;
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const thisMonthRevenue = earnings?.filter(e => e.created_at >= startOfMonth).reduce((s, e) => s + (e.net_amount || 0), 0) || 0;

      // Active orders
      const { data: pendingOrderItems } = await supabase
        .from('order_items')
        .select('order_id, order:orders!inner(status)')
        .eq('vendor_id', user.id)
        .in('order.status', ['pending', 'confirmed']);

      const uniquePendingOrders = new Set(pendingOrderItems?.map(i => i.order_id)).size;

      setStats({
        totalProducts, 
        activeOrders: uniquePendingOrders,
        totalRevenue, 
        thisMonthRevenue, 
        avgRating: parseFloat(avgRating as string)
      });
      setTopProducts(topProductsList);

      // Recent orders
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          id, item_name, quantity, unit_price, total_price,
          product:products(id, name, images),
          order:orders!inner(
            id, order_number, status, payment_method, created_at,
            student:profiles!student_id(full_name, avatar_url, email)
          )
        `)
        .eq('vendor_id', user.id)
        .order('order(created_at)', { ascending: false })
        .limit(6);

      setRecentOrders(orderItems || []);

      // Chart data (last 6 months)
      const months: any[] = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ 
          name: d.toLocaleString('default', { month: 'short' }), 
          yearMonth: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
          revenue: 0 
        });
      }

      earnings?.forEach(e => {
        const d = new Date(e.created_at);
        const ym = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const m = months.find(x => x.yearMonth === ym);
        if (m) m.revenue += (e.net_amount || 0);
      });

      setMonthlyData(months);
      setIsLoading(false);
    }

    load();

    // Real-time: new order
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      supabase.channel('seller-new-orders')
        .on('postgres_changes', {
          event: 'INSERT', schema: 'public', table: 'order_items',
          filter: `vendor_id=eq.${user.id}`
        }, () => {
          load();
          toast.info('🛍️ New order received!');
        })
        .subscribe();
    });
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[500px]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 1. Greeting */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            {getGreeting()}, {userName}! 🛍️
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here's what's happening with your store today.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/seller/products/add" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm">
            Add Product
          </Link>
          <Link href="/seller/orders" className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
            View Orders
          </Link>
        </div>
      </div>

      {/* 2. Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalProducts}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Active Orders</h3>
          </div>
          <div className="flex items-end gap-2 text-2xl font-bold text-gray-900">
            {stats.activeOrders}
            {stats.activeOrders > 0 && <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full relative -top-1 animate-pulse">Needs attention</span>}
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Total Net Revenue</h3>
          </div>
          <div className="flex items-end gap-3 text-2xl font-bold text-gray-900">
            ₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            <span className="text-sm font-medium text-gray-500 mb-1">
              (This Month: ₹{stats.thisMonthRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })})
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Star className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-500">Global Rating</h3>
          </div>
          <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            {stats.avgRating} <Star className="w-5 h-5 fill-purple-500 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Chart & Top Products */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 5. Monthly Revenue Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Revenue (Last 6 Months)
              </h3>
            </div>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    cursor={{ fill: '#f9fafb' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                    formatter={(value: number) => [`₹${value.toLocaleString('en-IN')}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 4. Top Products */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-base font-bold text-gray-900">Highest Rated Products</h3>
              <Link href="/seller/products" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">View All</Link>
            </div>
            <div className="divide-y divide-gray-50">
              {topProducts.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-500">No products yet.</div>
              ) : topProducts.map(product => {
                const img = Array.isArray(product.images) && product.images.length > 0 ? product.images[0].url : '/placeholder.png';
                return (
                  <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                    <img src={img} alt={product.name} className="w-12 h-12 rounded-lg object-cover border border-gray-100" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{product.name}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs">
                        <span className="text-gray-500">₹{product.price?.toLocaleString('en-IN')}</span>
                        <div className="flex items-center gap-1 text-amber-500 font-medium">
                          <Star className="w-3.5 h-3.5 fill-current" /> {product.rating || '0'} ({product.rating_count || 0})
                        </div>
                      </div>
                    </div>
                    {product.stock_quantity < 10 && (
                      <div className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded text-xs font-medium">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Col: Recent Orders */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[700px]">
          <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
            <Link href="/seller/orders" className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">Manage</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No orders received yet.<br/>Your items will appear here when purchased.
              </div>
            ) : recentOrders.map(item => {
              const order = item.order;
              return (
                <div key={item.id} className="p-4 border border-gray-100 rounded-xl hover:border-emerald-200 transition-colors bg-white shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden">
                        {order?.student?.avatar_url ? (
                          <img src={order.student.avatar_url} className="w-full h-full object-cover" alt="" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xs">{order?.student?.full_name?.[0] || '?'}</div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{order?.student?.full_name || 'Student'}</p>
                        <p className="text-[10px] text-gray-400">{formatRelativeTime(order?.created_at)}</p>
                      </div>
                    </div>
                    {order?.status === 'pending' && <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Pending</span>}
                    {order?.status === 'confirmed' && <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Confirmed</span>}
                    {order?.status === 'shipped' && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Shipped</span>}
                    {order?.status === 'delivered' && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Delivered</span>}
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3 text-sm flex justify-between items-center group">
                    <div className="min-w-0 pr-4">
                      <p className="font-semibold text-gray-900 truncate" title={item.item_name}>{item.item_name}</p>
                      <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900 shrink-0">
                      ₹{item.total_price?.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
