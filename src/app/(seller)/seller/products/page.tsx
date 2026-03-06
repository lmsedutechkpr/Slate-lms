'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Plus, Package, Search, MoreVertical, Eye, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'

type Product = {
  id: string
  name: string
  status: string
  price: number
  original_price: number | null
  stock_quantity: number
  rating: number
  rating_count: number
  images: { url: string; alt: string }[]
  created_at: string
  category: { name: string } | null
}

export default function SellerProductsPage() {
  const supabase = createClient()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select(`
          id, name, status, price, original_price, stock_quantity,
          rating, rating_count, images, created_at, sku, tags,
          category:product_categories(name)
        `)
        .eq('vendor_id', user.id)   // ← CORRECT: vendor_id not seller_id
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data as any || [])
    } catch (err) {
      console.error('Failed to load products:', err)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { key: 'all',       label: 'All Products' },
    { key: 'active',    label: 'Active' },
    { key: 'inactive',  label: 'Inactive' },
    { key: 'out_of_stock',  label: 'Out of Stock' },
  ]

  const filtered = products.filter(p => {
    if (activeTab !== 'all' && p.status !== activeTab) return false
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const tabCounts = tabs.reduce((acc, tab) => {
    acc[tab.key] = tab.key === 'all' ? products.length : products.filter(p => p.status === tab.key).length
    return acc
  }, {} as Record<string, number>)

  // Toggle product active/inactive
  async function toggleStatus(productId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus } : p))
    const { error } = await supabase.from('products')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (error) {
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: currentStatus } : p))
      toast.error('Failed to update status')
      return
    }
    toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
  }

  // Delete product
  async function deleteProduct(productId: string, productName: string) {
    if (!confirm(`Delete "${productName}"? This cannot be undone.`)) return
    setProducts(prev => prev.filter(p => p.id !== productId))
    const { error } = await supabase.from('products').delete().eq('id', productId)
    if (error) { loadProducts(); toast.error('Failed to delete'); return }
    toast.success('Product deleted')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your store inventory and digital products</p>
        </div>
        <Link href="/seller/products/add"
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors">
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-5 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${activeTab === tab.key ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'}`}>
              {tabCounts[tab.key]}
            </span>
          </button>
        ))}
        <div className="ml-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl w-56 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-base font-semibold text-gray-700 mb-1">
            {search ? 'No products match your search' : activeTab === 'all' ? 'No products yet' : `No ${activeTab} products`}
          </h3>
          <p className="text-sm text-gray-400 mb-6 max-w-xs">
            {activeTab === 'all' && !search && 'Add your first product to start selling on SLATE'}
          </p>
          {activeTab === 'all' && !search && (
            <Link href="/seller/products/add" className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
              Add First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onToggle={toggleStatus}
              onDelete={deleteProduct}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ProductCard({ product, onToggle, onDelete }: {
  product: Product
  onToggle: (id: string, status: string) => void
  onDelete: (id: string, name: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const imageUrl = Array.isArray(product.images) && product.images.length > 0
    ? product.images[0].url
    : null

  const statusColors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    inactive: 'bg-gray-100 text-gray-500',
    out_of_stock: 'bg-red-50 text-red-700',
  }

  const statusLabels: Record<string, string> = {
    active: '● Active', inactive: '○ Inactive',
    out_of_stock: '⚠ Out of Stock',
  }

  const discount = product.original_price && product.original_price > product.price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-md transition-all group">
      {/* Image */}
      <div className="relative h-44 bg-gray-50">
        {imageUrl
          ? <img src={imageUrl} alt={product.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-200" />
            </div>
        }
        <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[product.status] || 'bg-gray-100 text-gray-600'}`}>
          {statusLabels[product.status] || product.status}
        </span>
        {discount > 0 && (
          <span className="absolute top-2 right-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-gray-400 mb-1">{product.category?.name || 'Uncategorized'}</p>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {product.name}
        </h3>

        {/* Price row */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-bold text-gray-900">₹{product.price.toLocaleString('en-IN')}</span>
          {product.original_price && (
            <span className="text-xs text-gray-400 line-through">₹{product.original_price.toLocaleString('en-IN')}</span>
          )}
        </div>

        {/* Stock + Rating */}
        <div className="flex items-center justify-between mt-2">
          <span className={`text-xs font-medium ${
            product.stock_quantity === 0 ? 'text-red-500' :
            product.stock_quantity < 10 ? 'text-amber-500' : 'text-gray-400'
          }`}>
            {product.stock_quantity === 0 ? '⚠ Out of stock' :
             product.stock_quantity < 10 ? `⚠ Low: ${product.stock_quantity} left` :
             `${product.stock_quantity} in stock`}
          </span>
          {product.rating_count > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              ⭐ {product.rating.toFixed(1)} ({product.rating_count})
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <Link href={`/seller/products/${product.id}/edit`}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </Link>

          {(product.status === 'active' || product.status === 'inactive') && (
            <button onClick={() => onToggle(product.id, product.status)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium rounded-lg transition-colors
                ${product.status === 'active' ? 'bg-gray-50 hover:bg-gray-100 text-gray-600' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}>
              {product.status === 'active' ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
              {product.status === 'active' ? 'Deactivate' : 'Activate'}
            </button>
          )}

          <button onClick={() => onDelete(product.id, product.name)}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-4 bg-gray-100 rounded w-4/5" />
        <div className="h-4 bg-gray-100 rounded w-3/5" />
        <div className="h-5 bg-gray-100 rounded w-1/4" />
        <div className="h-8 bg-gray-100 rounded mt-2" />
      </div>
    </div>
  )
}
