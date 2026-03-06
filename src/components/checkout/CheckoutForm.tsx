'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartItem } from '@/types';
import { placeOrder } from '@/lib/actions/checkout';
import { useCartStore } from '@/store/cartStore';
import { ShoppingCart, Loader2, CreditCard, Banknote, Check } from 'lucide-react';

interface CheckoutFormProps {
  cartItems: CartItem[];
  subtotal: number;
  userId: string;
  defaultName: string;
  defaultEmail: string;
}

type PaymentMethod = 'cod' | 'upi';

export function CheckoutForm({ cartItems, subtotal, userId, defaultName, defaultEmail }: CheckoutFormProps) {
  const [name, setName] = useState(defaultName);
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const setCartCount = useCartStore((s) => s.setCartCount);

  const getItemPrice = (item: CartItem) => {
    const c = Array.isArray(item.course) ? item.course[0] : item.course;
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    return item.item_type === 'course' ? (c?.price ?? 0) : (p?.price ?? 0);
  };

  const getItemName = (item: CartItem) => {
    const c = Array.isArray(item.course) ? item.course[0] : item.course;
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    return item.item_type === 'course' ? (c?.title ?? 'Course') : (p?.name ?? 'Product');
  };

  const getItemImage = (item: CartItem): string | null => {
    const c = Array.isArray(item.course) ? item.course[0] : item.course;
    const p = Array.isArray(item.product) ? item.product[0] : item.product;
    if (item.item_type === 'course') return c?.thumbnail_url ?? null;
    const imgs = p?.images;
    return Array.isArray(imgs) && imgs.length > 0 ? imgs[0] : null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError('Please enter your name.'); return; }
    if (paymentMethod === 'upi' && !upiId.trim()) { setError('Please enter your UPI ID.'); return; }

    setPlacing(true);
    try {
      const result = await placeOrder({
        name,
        phone,
        paymentMethod,
        paymentReference: paymentMethod === 'upi' ? upiId : null,
      });

      if (result.error || !result.orderId) {
        setError(result.error ?? 'Failed to place order.');
        return;
      }

      // Reset cart badge immediately
      setCartCount(0);
      router.push(`/dashboard/checkout/success?orderId=${result.orderId}`);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8 max-w-5xl">
      {/* Left: Billing + Payment */}
      <div className="flex-1 space-y-6">
        {/* Billing Details */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Billing Details</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                required
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={defaultEmail}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-100 rounded-xl text-sm text-gray-500 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">Phone (optional)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5">Payment Method</h2>
          <div className="space-y-3">
            {[
              { value: 'upi' as PaymentMethod, label: 'UPI Payment', icon: CreditCard, desc: 'Pay via UPI ID (GPay, PhonePe, Paytm, etc.)' },
              { value: 'cod' as PaymentMethod, label: 'Cash on Delivery', icon: Banknote, desc: 'Pay when you receive your order' },
            ].map(({ value, label, icon: Icon, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setPaymentMethod(value)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  paymentMethod === value ? 'border-black bg-gray-50' : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === value ? 'bg-black' : 'bg-gray-100'}`}>
                  <Icon size={16} className={paymentMethod === value ? 'text-white' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
                {paymentMethod === value && (
                  <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                    <Check size={11} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {paymentMethod === 'upi' && (
            <div className="mt-4 space-y-1.5">
              <label className="text-xs font-medium text-gray-700 uppercase tracking-wide">UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all"
              />
              <p className="text-xs text-gray-400">Enter your UPI ID and we will send you a payment request.</p>
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
        )}
      </div>

      {/* Right: Order Summary */}
      <div className="w-full lg:w-72 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sticky top-24">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>

          <div className="space-y-3 pb-4 border-b border-gray-100">
            {cartItems.map((item) => {
              const image = getItemImage(item);
              const name = getItemName(item);
              const price = getItemPrice(item);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    {image ? (
                      <Image src={image} alt={name} width={40} height={32} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart size={12} className="text-gray-300" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 truncate">{name}</p>
                    {item.quantity > 1 && <p className="text-[10px] text-gray-400">×{item.quantity}</p>}
                  </div>
                  <span className="text-xs font-semibold text-gray-900 flex-shrink-0">
                    ₹{(price * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-sm font-semibold text-gray-900 pt-4 mb-6">
            <span>Total</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>

          <button
            type="submit"
            disabled={placing}
            className="flex items-center justify-center gap-2 w-full bg-black text-white text-sm font-medium rounded-xl py-3 hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {placing ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
            {placing ? 'Placing Order...' : 'Place Order'}
          </button>

          <Link href="/dashboard/cart" className="flex items-center justify-center text-xs text-gray-500 mt-3 hover:text-gray-700">
            Back to cart
          </Link>
        </div>
      </div>
    </form>
  );
}
