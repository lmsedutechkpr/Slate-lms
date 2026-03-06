import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function RecommendedProducts({ products }: { products: any[] }) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
            <Package className="w-6 h-6 text-emerald-500" /> Study Materials
          </h2>
          <p className="text-gray-500 text-sm mt-1">Products recommended based on your courses</p>
        </div>
        <Link 
          href="/store"
          className="group flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          Visit Store
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {products.map(product => {
          const imgUrl = Array.isArray(product.images) && product.images.length > 0 
            ? product.images[0].url : '/placeholder.png';
            
          return (
            <Link 
              key={product.id}
              href={`/store/products/${product.id}`}
              className="flex gap-4 p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group"
            >
              <img 
                src={imgUrl} 
                alt="" 
                className="w-20 h-20 rounded-xl object-cover bg-gray-100 flex-shrink-0"
              />
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-tight">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2 mt-2 font-mono">
                  <span className="text-sm font-bold text-gray-900">₹{product.price?.toLocaleString('en-IN')}</span>
                  {product.original_price && product.original_price > product.price && (
                    <span className="text-xs text-gray-400 line-through">₹{product.original_price?.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
