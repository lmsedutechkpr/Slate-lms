import { createClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, CheckCircle2, Clock, XCircle, ArrowLeft, ShoppingBag, BookOpen, CreditCard, Banknote, HelpCircle, Package, ArrowRight } from 'lucide-react';
import { getOrderById } from '@/lib/actions/orders';
import { format } from 'date-fns';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';
import Image from 'next/image';

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const order = await getOrderById(id, user.id);
  if (!order) notFound();

  const shortId = order.id.slice(0, 8).toUpperCase();
  const items = order.order_items || [];
  const date = format(new Date(order.created_at), 'MMMM d, yyyy');

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

  const hasCourse = items.some(i => i.item_type === 'course');

  return (
    <div className="-m-4 lg:-m-8">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
          <ChevronRight size={14} />
          <Link href="/dashboard/orders" className="hover:text-gray-900">Orders</Link>
          <ChevronRight size={14} />
          <span className="text-gray-900 font-mono">#{shortId}</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${status.bg} ${status.text} ${status.border}`}>
            <StatusIcon size={11} />
            {status.label}
          </div>
        </div>
      </div>

      <div className="px-8 py-8 flex flex-col lg:flex-row gap-8 items-start">
        {/* Left: Items + Timeline */}
        <div className="flex-1 space-y-6 w-full">
          {/* Order Items */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
             <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
                <h2 className="text-gray-900 font-semibold text-base">Items Ordered</h2>
                <span className="bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  {items.length}
                </span>
             </div>
             <div className="divide-y divide-gray-100">
                {items.map((item: any) => (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6">
                    {/* Thumbnail */}
                    <div className="w-full sm:w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-50">
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
                              <ShoppingBag size={24} className="text-gray-300" />
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                          {item.item_type}
                        </span>
                        <h3 className="text-gray-900 font-bold text-lg line-clamp-1 leading-tight">
                          {item.item_type === 'course' ? item.course?.title : item.product?.name}
                        </h3>
                      </div>

                      {item.item_type === 'course' ? (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                           <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200 text-[10px] font-bold">
                              <CheckCircle2 size={10} />
                              Enrolled
                           </div>
                           <Link
                              href={`/courses/${item.course?.slug}/learn`}
                              className="text-gray-900 text-xs font-bold underline flex items-center gap-1 hover:text-black transition-colors"
                           >
                              Start Learning
                              <ArrowRight size={12} />
                           </Link>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-col gap-1">
                          <span className="text-gray-500 text-xs font-medium">
                            {item.product?.category?.name || 'Category'}
                          </span>
                          <span className="text-gray-400 text-[11px] font-medium">
                            Quantity: {item.quantity}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex flex-col items-start sm:items-end justify-center pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100 sm:ml-4 flex-shrink-0">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-gray-400 text-xs font-medium leading-none mb-1">
                           ₹{item.unit_price.toLocaleString('en-IN')} × {item.quantity}
                        </span>
                        <span className="text-gray-900 font-bold text-xl leading-none">
                          ₹{item.total_price.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
             <h2 className="text-gray-900 font-semibold text-lg mb-6">Order Timeline</h2>
             
             <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
                {/* 1. Order Placed */}
                <TimelineItem
                   label="Order Placed"
                   time={format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
                   desc="Your order was placed successfully"
                   isCompleted={true}
                />

                {/* 2. Payment Confirmed */}
                <TimelineItem
                   label={order.status === 'failed' ? "Payment Failed" : "Payment Confirmed"}
                   time={format(new Date(order.created_at), 'MMM d, yyyy · h:mm a')}
                   desc={`₹${order.total_amount.toLocaleString('en-IN')} via ${order.payment_method.toUpperCase()}`}
                   isCompleted={order.status === 'paid'}
                   isFailed={order.status === 'failed'}
                />

                {/* 3. Processing */}
                <TimelineItem
                   label="Order Processing"
                   time={order.status === 'paid' ? format(new Date(order.created_at), 'MMM d, yyyy · h:mm a') : 'Pending'}
                   desc="We are processing your order"
                   isCompleted={order.status === 'paid'}
                />

                {/* 4. Delivery/Access */}
                {hasCourse ? (
                  <TimelineItem
                    label="Course Access Granted"
                    time={order.status === 'paid' ? format(new Date(order.created_at), 'MMM d, yyyy · h:mm a') : 'Pending'}
                    desc="You can now access your course(s) from your dashboard"
                    isCompleted={order.status === 'paid'}
                  />
                ) : (
                  <>
                    <TimelineItem
                      label="Preparing Shipment"
                      time={order.status === 'paid' ? "Awaiting updates" : "Pending"}
                      desc="Your items are being packed and checked"
                      isCompleted={order.status === 'paid'}
                    />
                    <TimelineItem
                      label="Out for Delivery"
                      time="Upcoming"
                      desc="Estimated: 3-5 business days"
                      isCompleted={false}
                    />
                  </>
                )}
             </div>
          </div>
        </div>

        {/* Right: Summary Card */}
        <div className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-24 space-y-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <h2 className="text-gray-900 font-bold text-base mb-5">Order Summary</h2>
            
            <div className="space-y-4">
               <SummaryRow label="Order ID" value={`#${shortId}`} valueClass="font-mono" />
               <SummaryRow label="Date" value={date} />
               <SummaryRow label="Payment Method" value={order.payment_method.toUpperCase()} />
               <SummaryRow label="Status" value={status.label} valueClass={status.text} />
            </div>

            <div className="my-5 border-t border-gray-100" />

            <div className="space-y-2 mb-5">
               {items.slice(0, 4).map((item: any) => (
                 <div key={item.id} className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 truncate mr-3">{item.item_type === 'course' ? item.course?.title : item.product?.name}</span>
                    <span className="text-gray-900 font-semibold flex-shrink-0">₹{item.total_price.toLocaleString('en-IN')}</span>
                 </div>
               ))}
               {items.length > 4 && (
                 <p className="text-gray-400 text-[10px] text-right">+{items.length - 4} more items</p>
               )}
            </div>

            <div className="my-5 border-t border-gray-100" />

            <div className="flex justify-between items-end mb-6">
               <span className="text-gray-900 font-bold text-sm">Total Amount</span>
               <span className="text-gray-900 font-bold text-2xl leading-none tracking-tight">
                  ₹{order.total_amount.toLocaleString('en-IN')}
               </span>
            </div>

            <div className="space-y-2">
               {hasCourse && (
                 <Link
                   href="/dashboard/my-courses"
                   className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
                 >
                   <BookOpen size={14} />
                   Go to My Courses
                 </Link>
               )}
               <Link
                 href="/dashboard/orders"
                 className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 rounded-lg py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
               >
                 <ArrowLeft size={14} />
                 Back to Orders
               </Link>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 flex gap-3">
             <HelpCircle size={18} className="text-gray-400 flex-shrink-0 mt-0.5" />
             <div>
                <p className="text-gray-900 text-sm font-semibold">Need help?</p>
                <p className="text-gray-500 text-[11px] mt-1 leading-relaxed">
                   For demo purposes, all orders are final. In production, contact support at slate@demo.com
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, valueClass = "text-gray-900" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}

function TimelineItem({ label, time, desc, isCompleted, isFailed = false }: { label: string; time: string; desc: string; isCompleted: boolean; isFailed?: boolean }) {
  return (
    <div className="relative flex items-start gap-4">
      {/* Indicator Dot */}
      <div className={`absolute -left-[20px] w-3 h-3 rounded-full mt-1.5 z-10 shadow-sm ${
        isFailed ? 'bg-red-500' : isCompleted ? 'bg-black' : 'bg-gray-200 border-2 border-white'
      }`} />
      
      <div className="flex-1">
         <div className="flex items-center justify-between mb-1">
            <h4 className={`text-sm font-bold ${isFailed ? 'text-red-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
               {label}
            </h4>
            <span className="text-gray-400 text-[10px] font-medium">{time}</span>
         </div>
         <p className="text-gray-500 text-xs leading-relaxed max-w-sm">
            {desc}
         </p>
      </div>
    </div>
  );
}
