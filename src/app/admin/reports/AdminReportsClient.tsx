'use client';

import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, TrendingUp, Users, ShoppingBag, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface AdminReportsClientProps {
  initialData: {
    salesOverTime: { date: string; revenue: number }[];
    topCourses: any[];
    topProducts: any[];
    demographics: { name: string; value: number }[];
  };
}

const COLORS = ['#3b82f6', '#a855f7', '#eab308', '#ef4444', '#10b981'];

export default function AdminReportsClient({ initialData }: AdminReportsClientProps) {
  const [timeRange, setTimeRange] = useState('30d');

  const totalRevenue = initialData.salesOverTime.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="min-h-full bg-gray-50 pb-12">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports overview</h1>
          <p className="text-gray-400 text-sm mt-1">Platform analytics and performance metrics</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-3 py-2 outline-none focus:border-gray-900"
        >
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last quarter</option>
          <option value="1y">Last year</option>
        </select>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* REVENUE CHART */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sales over time</h3>
              <p className="text-sm text-gray-500">Total volume spanning {timeRange}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-gray-500">Total Sales</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  <ArrowUpRight size={12} /> 12%
                </span>
              </div>
            </div>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={initialData.salesOverTime} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  dy={10}
                  minTickGap={30}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  tickFormatter={(val) => `₹${val>=1000 ? (val/1000).toFixed(0)+'k' : val}`}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DEMOGRAPHICS PIE CHART */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-1">Platform Growth</h3>
          <p className="text-sm text-gray-500 mb-6">User role distribution</p>
          
          <div className="flex-1 min-h-[200px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={initialData.demographics}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {initialData.demographics.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#1f2937', fontWeight: 600 }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-gray-900">
                {initialData.demographics.reduce((s, i) => s + i.value, 0)}
              </span>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Users</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100">
            {initialData.demographics.map((entry, idx) => (
              <div key={entry.name} className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                  <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider truncate">{entry.name}</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{entry.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-8 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* TOP COURSES */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen size={16} />
              </div>
              <h3 className="font-bold text-gray-900">Top Courses</h3>
            </div>
            <Link href="/admin/courses" className="text-sm font-medium text-blue-600 hover:text-blue-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {initialData.topCourses.map((course, idx) => (
              <div key={course.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="text-lg font-black text-gray-300 w-4 text-center">{idx + 1}</div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {course.thumbnail_url && <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate" title={course.title}>{course.title}</p>
                  <p className="text-xs text-gray-500 truncate">{course.instructor?.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{course.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP PRODUCTS */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <ShoppingBag size={16} />
              </div>
              <h3 className="font-bold text-gray-900">Top Products</h3>
            </div>
            <Link href="/admin/products" className="text-sm font-medium text-purple-600 hover:text-purple-700">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {initialData.topProducts.map((product, idx) => (
              <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="text-lg font-black text-gray-300 w-4 text-center">{idx + 1}</div>
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                  {product.images?.[0] && <img src={product.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate" title={product.name}>{product.name}</p>
                  <p className="text-xs text-gray-500 truncate">{product.seller?.full_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{product.sales} sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
