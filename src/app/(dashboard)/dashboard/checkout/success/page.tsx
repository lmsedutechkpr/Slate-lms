import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight, BookOpen, ShoppingBag, Package, GraduationCap } from 'lucide-react';
import { CourseThumbnail } from '@/components/shared/CourseThumbnail';

interface Props {
  searchParams: Promise<{ orderId?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { orderId } = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let order = null;
  let orderItems: any[] = [];
  
  if (orderId) {
    const { data: orderData } = await supabase
      .from('orders')
      .select('id, total_amount, created_at, status')
      .eq('id', orderId)
      .eq('student_id', user.id)
      .single();
    
    if (orderData) {
      order = orderData;
      const { data: itemsData } = await supabase
        .from('order_items')
        .select(`
          *,
          course:courses(id, title, slug, thumbnail_url, category:categories(slug, name)),
          product:products(id, name, slug, images, price)
        `)
        .eq('order_id', orderId);
      orderItems = itemsData || [];
    }
  }

  const courses = orderItems.filter(item => item.item_type === 'course');
  const products = orderItems.filter(item => item.item_type === 'product');

  return (
    <div className="-m-4 lg:-m-8 min-h-screen flex items-center justify-center px-6 py-12 lg:py-20 bg-white">
      <div className="max-w-xl w-full text-center">
        <div className="relative inline-block mb-8">
          <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 flex items-center justify-center animate-pulse">
            <CheckCircle size={48} className="text-emerald-500" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-black rounded-xl flex items-center justify-center border-4 border-white">
             <Package size={18} className="text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">Success!</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed px-4">
          Thank you for your purchase. We&apos;ve sent a confirmation email and your order is being processed.
        </p>

        {/* Courses Section */}
        {courses.length > 0 && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-4 text-left">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap size={20} className="text-emerald-600" />
              <h2 className="text-emerald-700 font-semibold">Course Access Granted</h2>
            </div>
            <div className="space-y-1">
              {courses.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-3 border-b border-emerald-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      {item.course && <CourseThumbnail course={item.course} />}
                    </div>
                    <span className="text-gray-900 text-sm font-medium line-clamp-1">{item.item_name}</span>
                  </div>
                  <Link 
                    href={`/courses/${item.course?.slug}/learn`}
                    className="text-emerald-600 text-xs font-medium hover:text-emerald-700 transition-colors flex-shrink-0"
                  >
                    Start Learning →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Products Section */}
        {products.length > 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-left">
            <div className="flex items-center gap-2 mb-4">
              <Package size={20} className="text-gray-500" />
              <h2 className="text-gray-700 font-semibold">Products Ordered</h2>
            </div>
            <div className="space-y-3">
              {products.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-gray-900 font-medium line-clamp-1">{item.item_name}</p>
                    <p className="text-gray-400 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <span className="text-gray-900 font-semibold">₹{item.total_price.toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900">
                <span>Total</span>
                <span>₹{Number(order?.total_amount ?? 0).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {courses.length > 0 && (
            <Link
              href="/dashboard/my-courses"
              className="w-full flex items-center justify-center gap-2 bg-black text-white text-sm font-bold rounded-xl h-12 hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              <BookOpen size={18} />
              Start Learning
            </Link>
          )}

          {orderId && (
            <Link
              href={`/dashboard/orders/${orderId}`}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-xl h-12 hover:bg-gray-200 transition-all active:scale-[0.98]"
            >
              <Package size={18} />
              Track Order
            </Link>
          )}
          
          <Link
            href="/shop"
            className="w-full flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-800 transition-all"
          >
            <ShoppingBag size={14} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
