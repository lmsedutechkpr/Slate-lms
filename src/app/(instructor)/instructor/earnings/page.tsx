'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Clock,
  BarChart2,
  CreditCard,
  Download,
  Plus,
  HelpCircle,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface OrderItemRow {
  unit_price: number;
  course_id: string | null;
  order: {
    created_at: string;
    status: string;
  } | null;
  course: {
    id: string;
    title: string;
    price: number | null;
    thumbnail_url: string | null;
    category: { name: string } | null;
  } | null;
}

interface MonthEntry {
  key: string;
  label: string;
  gross: number;
  net: number;
  enrollments: number;
}

interface CourseRevenue {
  id: string;
  title: string;
  price: number | null;
  thumbnail_url: string | null;
  category: { name: string } | null;
  enrollmentCount: number;
  grossRevenue: number;
  netRevenue: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function buildMonthlyBreakdown(items: OrderItemRow[]): MonthEntry[] {
  if (!items.length) return [];

  const map = new Map<string, MonthEntry>();

  items.forEach((item) => {
    if (!item.order) return;
    const date = new Date(item.order.created_at);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const label = date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric',
    });

    if (!map.has(key)) {
      map.set(key, { key, label, gross: 0, net: 0, enrollments: 0 });
    }

    const entry = map.get(key)!;
    entry.gross += Number(item.unit_price) || 0;
    entry.net += (Number(item.unit_price) || 0) * 0.7;
    entry.enrollments += 1;
  });

  return Array.from(map.values()).sort((a, b) =>
    b.key.localeCompare(a.key)
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function InstructorEarningsPage() {
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Get all instructor courses
      const { data: courses } = await supabase
        .from('courses')
        .select('id')
        .eq('instructor_id', user.id);

      const courseIds = courses?.map((c) => c.id) ?? [];

      if (courseIds.length === 0) {
        setLoading(false);
        return;
      }

      // Get paid order items for those courses
      const { data: items } = await supabase
        .from('order_items')
        .select(
          `unit_price, course_id,
           order:orders(created_at, status),
           course:courses(id, title, price, thumbnail_url, category:categories(name))`
        )
        .in('course_id', courseIds)
        .eq('item_type', 'course')
        .eq('orders.status', 'paid');

      setOrderItems((items ?? []) as unknown as OrderItemRow[]);
      setLoading(false);
    }

    load();
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────

  const grossRevenue = useMemo(
    () => orderItems.reduce((acc, item) => acc + (Number(item.unit_price) || 0), 0),
    [orderItems]
  );

  const netRevenue = useMemo(() => grossRevenue * 0.7, [grossRevenue]);

  const monthlyData = useMemo(
    () => buildMonthlyBreakdown(orderItems),
    [orderItems]
  );

  const now = new Date();
  const thisMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now);
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonthKey = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;

  const thisMonthNet = monthlyData.find((m) => m.key === thisMonthKey)?.net ?? 0;
  const lastMonthNet = monthlyData.find((m) => m.key === lastMonthKey)?.net ?? 0;

  const percentChange =
    lastMonthNet > 0
      ? ((thisMonthNet - lastMonthNet) / lastMonthNet) * 100
      : null;

  // Per-course breakdown
  const courseRevenue = useMemo((): CourseRevenue[] => {
    const map = new Map<string, CourseRevenue>();

    orderItems.forEach((item) => {
      if (!item.course_id || !item.course) return;
      if (!map.has(item.course_id)) {
        map.set(item.course_id, {
          id: item.course.id,
          title: item.course.title,
          price: item.course.price,
          thumbnail_url: item.course.thumbnail_url,
          category: item.course.category,
          enrollmentCount: 0,
          grossRevenue: 0,
          netRevenue: 0,
        });
      }
      const entry = map.get(item.course_id)!;
      entry.enrollmentCount += 1;
      entry.grossRevenue += Number(item.unit_price) || 0;
      entry.netRevenue += (Number(item.unit_price) || 0) * 0.7;
    });

    return Array.from(map.values()).sort((a, b) => b.netRevenue - a.netRevenue);
  }, [orderItems]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-full bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* PAGE HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Earnings &amp; Payouts
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Track your revenue from course sales
            </p>
          </div>
          {netRevenue > 0 && (
            <button className="flex items-center gap-2 border border-gray-300 text-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Download Statement
            </button>
          )}
        </div>
      </div>

      <div className="px-8 py-6">
        <div className="grid grid-cols-3 gap-6 items-start">
          {/* ── LEFT COLUMN ───────────────────────────────────────────────── */}
          <div className="col-span-2 space-y-5">
            {/* STAT CARDS */}
            <div className="grid grid-cols-3 gap-4">
              {/* Total Net Earnings */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold rounded-full px-2 py-0.5">
                    70% SHARE
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{netRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">Total Net Earnings</p>
                <p className="text-gray-400 text-xs mt-1">After platform fees</p>
              </div>

              {/* This Month */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{thisMonthNet.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">This Month</p>
                {percentChange !== null ? (
                  <p
                    className={`text-xs mt-1 flex items-center gap-1 ${
                      percentChange >= 0 ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  >
                    {percentChange >= 0 ? (
                      <TrendingUp className="w-3 h-3" />
                    ) : (
                      <TrendingDown className="w-3 h-3" />
                    )}
                    {Math.abs(percentChange).toFixed(1)}% vs last month
                  </p>
                ) : (
                  <p className="text-gray-400 text-xs mt-1">
                    {thisMonthNet === 0
                      ? 'No sales this month'
                      : 'First month of sales'}
                  </p>
                )}
              </div>

              {/* Pending Payout */}
              <div className="bg-white border border-gray-200 rounded-2xl p-5">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{netRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
                <p className="text-gray-500 text-sm mt-0.5">Pending Payout</p>
                <p className="text-gray-400 text-xs mt-1">
                  {netRevenue < 5000
                    ? `₹${(5000 - netRevenue).toLocaleString('en-IN')} more needed`
                    : 'Eligible for payout'}
                </p>
              </div>
            </div>

            {/* MONTHLY BREAKDOWN */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gray-500" />
                  <h2 className="text-gray-900 font-semibold text-base">
                    Monthly Breakdown
                  </h2>
                </div>
              </div>

              {monthlyData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <BarChart2 className="w-8 h-8 text-gray-200 mb-3" />
                  <p className="text-gray-500 text-sm font-medium">
                    No earnings data yet
                  </p>
                  <p className="text-gray-400 text-xs mt-1 max-w-xs">
                    Revenue will appear here once students enroll in your paid
                    courses.
                  </p>
                </div>
              ) : (
                <>
                  {/* Table header */}
                  <div className="grid grid-cols-4 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wide">
                    <div>Month</div>
                    <div className="text-right">Enrollments</div>
                    <div className="text-right">Gross Revenue</div>
                    <div className="text-right">Your Net (70%)</div>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-gray-50">
                    {monthlyData.map((month, i) => (
                      <div
                        key={month.key}
                        className="grid grid-cols-4 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors items-center"
                      >
                        <div>
                          <p className="text-gray-900 text-sm font-medium">
                            {month.label}
                          </p>
                          {i === 0 && (
                            <span className="text-emerald-600 text-[11px] font-medium">
                              Current month
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-gray-700 text-sm">
                            {month.enrollments}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-700 text-sm">
                            ₹
                            {month.gross.toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-600 text-sm font-semibold">
                            ₹
                            {month.net.toLocaleString('en-IN', {
                              maximumFractionDigits: 0,
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="grid grid-cols-4 gap-4 px-6 py-4 border-t-2 border-gray-200 bg-gray-50">
                    <div>
                      <p className="text-gray-900 text-sm font-bold">Total</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 text-sm font-bold">
                        {orderItems.length}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-900 text-sm font-bold">
                        ₹
                        {grossRevenue.toLocaleString('en-IN', {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-600 text-sm font-bold">
                        ₹
                        {netRevenue.toLocaleString('en-IN', {
                          maximumFractionDigits: 0,
                        })}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PER-COURSE BREAKDOWN */}
            {courseRevenue.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h2 className="text-gray-900 font-semibold text-base">
                    Revenue by Course
                  </h2>
                </div>
                <div className="divide-y divide-gray-50">
                  {courseRevenue.map((course) => (
                    <div
                      key={course.id}
                      className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {course.thumbnail_url ? (
                          <img
                            src={course.thumbnail_url}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300" />
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">
                          {course.title}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {course.enrollmentCount} student
                          {course.enrollmentCount !== 1 ? 's' : ''} ·{' '}
                          {course.price != null
                            ? `₹${Number(course.price).toLocaleString('en-IN')} each`
                            : 'Free'}
                        </p>
                      </div>
                      {/* Revenue */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-emerald-600 text-sm font-bold">
                          ₹
                          {course.netRevenue.toLocaleString('en-IN', {
                            maximumFractionDigits: 0,
                          })}
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          your share
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN ──────────────────────────────────────────────── */}
          <div className="col-span-1 space-y-4 sticky top-6 self-start">
            {/* PAYOUT STATUS */}
            <div className="bg-gray-900 rounded-2xl p-5">
              <p className="text-gray-400 text-[11px] uppercase tracking-widest font-semibold mb-4">
                Payout Status
              </p>
              <div className="mb-4">
                <p className="text-gray-400 text-xs mb-1">Available Balance</p>
                <p className="text-white text-3xl font-bold">
                  ₹
                  {netRevenue.toLocaleString('en-IN', {
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>

              {/* Threshold bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400">Minimum for payout</span>
                  <span className="text-gray-300">₹5,000</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      netRevenue >= 5000 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${Math.min((netRevenue / 5000) * 100, 100)}%`,
                    }}
                  />
                </div>
                {netRevenue < 5000 && (
                  <p className="text-gray-500 text-xs mt-1.5">
                    ₹{(5000 - netRevenue).toLocaleString('en-IN')} more needed
                  </p>
                )}
              </div>

              <button
                disabled={netRevenue < 5000}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition-colors ${
                  netRevenue >= 5000
                    ? 'bg-white text-gray-900 hover:bg-gray-100'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                {netRevenue >= 5000 ? 'Request Payout' : 'Payout Unavailable'}
              </button>
            </div>

            {/* PAYOUT SCHEDULE */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
                Schedule
              </p>
              <div className="space-y-3">
                {[
                  { label: 'Payout cycle', value: 'Monthly' },
                  { label: 'Processing date', value: '1st of month' },
                  { label: 'Minimum', value: '₹5,000' },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-gray-500 text-sm">{row.label}</span>
                    <span className="text-gray-900 text-sm font-semibold">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PAYMENT METHOD — honest empty state, no fake data */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
                Payment Method
              </p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 text-sm font-medium">
                  No payment method
                </p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">
                  Add your bank account to receive payouts
                </p>
                <button className="mt-3 bg-black text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 mx-auto hover:bg-gray-800 transition-colors">
                  <Plus className="w-3.5 h-3.5" />
                  Add Bank Account
                </button>
              </div>
              <p className="text-gray-400 text-[11px] mt-3 text-center leading-relaxed">
                Bank account setup will be available soon. Contact support if
                you need assistance.
              </p>
            </div>

            {/* REVENUE SPLIT */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
                Revenue Split
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full"
                      style={{ width: '70%' }}
                    />
                  </div>
                  <span className="text-emerald-600 text-sm font-bold flex-shrink-0">
                    70%
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-600 font-medium">
                    Your earnings (70%)
                  </span>
                  <span className="text-gray-400">Platform (30%)</span>
                </div>
              </div>
              <p className="text-gray-400 text-[11px] mt-3 leading-relaxed">
                Slate takes 30% to cover hosting, payments, and platform
                maintenance.
              </p>
            </div>

            {/* SUPPORT */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
              <HelpCircle className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-blue-900 text-sm font-semibold mb-1">
                Need help with payouts?
              </p>
              <p className="text-blue-700 text-xs leading-relaxed mb-3">
                For payout requests or tax information (GST/PAN), contact
                instructor support.
              </p>
              <a href="mailto:support@slate.com">
                <button className="text-blue-600 text-xs font-semibold flex items-center gap-1 hover:text-blue-800 transition-colors">
                  Contact Support →
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
