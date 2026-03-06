import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
  lang?: 'en' | 'ta';
  studentId?: string;
  relevantCategories?: Set<string>;
}

export function RelatedProducts({ products, lang = 'en', studentId, relevantCategories = new Set() }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h2 className="text-gray-900 font-bold text-xl mb-6">You might also like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            lang={lang}
            studentId={studentId}
            relevantCategories={relevantCategories}
          />
        ))}
      </div>
    </div>
  );
}
