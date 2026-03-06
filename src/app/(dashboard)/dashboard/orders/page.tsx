import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ChevronRight, CheckCircle2, Clock, XCircle, ArrowRight, ShoppingBag, BookOpen } from 'lucide-react';
import { getMyOrders } from '@/lib/actions/orders';
import { format } from 'date-fns';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import Image from 'next/image';
import { getTranslation } from '@/lib/i18n';

export default async function OrdersPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_language')
    .eq('id', user.id)
    .single();

  const { t } = getTranslation(profile?.preferred_language || 'en');
  const orders = await getMyOrders(user.id);

  return (
    <div className="-m-4 lg:-m-8">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-gray-900">{t('common.dashboard')}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900">{t('orders.title')}</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('orders.title')}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {orders.length === 0 ? t('orders.noOrders') : `${orders.length} order${orders.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="px-8 py-6">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package size={32} className="text-gray-200" />
            </div>
            <h2 className="text-gray-900 font-semibold text-lg">{t('orders.noOrders')}</h2>
            <p className="text-gray-400 text-sm mt-1 max-w-xs text-center">
              Your completed purchases will appear here.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <Link
                href="/courses"
                className="bg-black text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                {t('myCourses.browseCourses')}
              </Link>
              <Link
                href="/shop"
                className="bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Visit Shop
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} t={t} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderCard({ order, t }: { order: any; t: any }) {
  const shortId = order.id.slice(0, 8).toUpperCase();
  const date = format(new Date(order.created_at), 'MMM d, yyyy · h:mm a');
  const items = order.order_items || [];
  const displayItems = items.slice(0, 3);
  const remaining = items.length - 3;

  const statusConfig = {
    paid: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: CheckCircle2,
      label: 'Paid',
    },
    pending: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: Clock,
      label: 'Pending',
    },
    failed: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: XCircle,
      label: 'Failed',
    },
    refunded: {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-gray-200',
      icon: Clock,
      label: 'Refunded',
    },
  };

  const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
  const StatusIcon = status.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 transition-all">
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-[10px] uppercase tracking-wide font-semibold">{t('orders.orderId')}</span>
            <span className="text-gray-900 font-mono text-sm font-medium">#{shortId}</span>
          </div>
          <p className="text-gray-400 text-xs mt-0.5">{date}</p>
        </div>

        <div className="flex flex-col items-end">
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${status.bg} ${status.text} ${status.border}`}>
            <StatusIcon size={11} />
            {status.label}
          </div>
          <p className="text-gray-400 text-[10px] mt-1 uppercase tracking-wider">
            via {order.payment_method}
          </p>
        </div>
      </div>

      {/* Order Items */}
      <div className="px-5 py-2">
        {displayItems.map((item: any) => (
          <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-gray-50">
              {item.item_type === 'course' ? (
                <CourseThumbnail
                  thumbnailUrl={item.course?.thumbnail_url}
                  title={item.course?.title}
                  aspectRatio="square"
                />
              ) : (
                <div className="w-full h-full relative">
                  {item.product?.images?.[0] ? (
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ShoppingBag size={14} className="text-gray-300" />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-gray-900 text-sm font-medium line-clamp-1">
                  {item.item_type === 'course' ? item.course?.title : item.product?.name}
                </span>
                <span className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">
                  {item.item_type}
                </span>
              </div>
              {item.item_type === 'course' && (
                <div className="flex items-center gap-1 mt-0.5">
                   <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                   <span className="text-[10px] text-emerald-600 font-medium">{t('courses.enrolled')}</span>
                </div>
              )}
            </div>

            {/* Price */}
            <div className="text-right flex-shrink-0 ml-4">
              <div className="flex flex-col items-end">
                {item.item_type === 'product' && item.quantity > 1 && (
                  <span className="text-gray-400 text-[10px] leading-none mb-1">×{item.quantity}</span>
                )}
                <span className="text-gray-700 text-sm font-semibold">
                  ₹{item.total_price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        ))}

        {remaining > 0 && (
          <div className="py-2 text-center border-t border-gray-50">
            <span className="text-gray-400 text-xs">+{remaining} more item{remaining > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
        <span className="text-gray-500 text-sm">
          {items.length} item{items.length > 1 ? 's' : ''}
        </span>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <span className="text-gray-400 text-[10px] uppercase tracking-widest font-bold leading-none mb-1">{t('orders.total')}</span>
            <span className="text-gray-900 font-bold text-base leading-none">
              ₹{order.total_amount.toLocaleString('en-IN')}
            </span>
          </div>

          <Link
            href={`/dashboard/orders/${order.id}`}
            className="bg-black text-white rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-2 hover:bg-gray-800 transition-colors"
          >
            {t('orders.viewDetails')}
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
