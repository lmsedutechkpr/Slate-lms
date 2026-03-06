'use client';

import { useState } from 'react';
import { Product } from '@/types';
import { getCategoryGradient, getCategoryIcon } from './shopUtils';
import Image from 'next/image';

interface ProductImageGalleryProps {
  product: Product;
}

export function ProductImageGallery({ product }: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasImages = Array.isArray(product.images) && product.images.length > 0;
  const categorySlug = (product.category as any)?.slug;
  const categoryIcon = (product.category as any)?.icon;
  const categoryGradient = getCategoryGradient(categorySlug);
  const CategoryIcon = getCategoryIcon(categoryIcon);

  return (
    <div className="w-full mb-8">
      
      {/* Main image area */}
      <div className={`relative w-full rounded-2xl overflow-hidden bg-gradient-to-br ${categoryGradient} aspect-square`}>
        
        {hasImages ? (
          <Image
            src={product.images[selectedIndex]}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <>
            {/* Gradient placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CategoryIcon className="w-20 h-20 text-white/50" />
            </div>
            
            {/* "Coming soon" strip */}
            <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white text-xs text-center py-2.5 backdrop-blur-sm">
              Product images coming soon
            </div>
          </>
        )}
      </div>
      
      {/* Thumbnail row — only if multiple images */}
      {hasImages && product.images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide">
          {product.images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all duration-150 ${
                selectedIndex === i
                  ? 'border-black'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image 
                src={img} 
                alt="" 
                fill 
                className="object-cover" 
              />
            </button>
          ))}
        </div>
      )}

    </div>
  );
}
