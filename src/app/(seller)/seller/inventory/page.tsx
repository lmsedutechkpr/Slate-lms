'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import Link from 'next/link'
import { Package, Search, AlertTriangle, Pencil } from 'lucide-react'

export default function InventoryPage() {
  const supabase = createClient()
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, sku, price, stock_quantity, status, images,
            category:product_categories(name)
          `)
          .eq('vendor_id', user.id)   // ← vendor_id
          .order('stock_quantity', { ascending: true })  // Low stock first

        if (error) throw error
        setInventory(data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to load inventory')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filtered = inventory.filter(p =>
    !search ||
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.sku && p.sku.toLowerCase().includes(search.toLowerCase()))
  )

  const outOfStock = inventory.filter(p => p.stock_quantity === 0).length
  const lowStock = inventory.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length
  const inStock = inventory.filter(p => p.stock_quantity >= 10).length

  async function updateStock(productId: string, newQty: number) {
    if (newQty < 0) { toast.error('Stock cannot be negative'); return }
    setInventory(prev => prev.map(p => p.id === productId ? { ...p, stock_quantity: newQty } : p))
    setEditingId(null)
    const { error } = await supabase.from('products')
      .update({ stock_quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', productId)
    if (error) { toast.error('Failed to update stock'); return }
    toast.success('Stock updated')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-sm text-gray-500 mt-1">Track and update stock levels for your products.</p>
      </div>

      {/* Summary cards */}
      {!loading && (
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-emerald-600">{inStock}</p>
            <p className="text-xs text-gray-500 mt-1">In Stock</p>
          </div>
          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4 text-center">
            <p className="text-2xl font-bold text-amber-600">{lowStock}</p>
            <p className="text-xs text-amber-600 mt-1">Low Stock</p>
          </div>
          <div className="bg-red-50 rounded-2xl border border-red-100 p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{outOfStock}</p>
            <p className="text-xs text-red-600 mt-1">Out of Stock</p>
          </div>
        </div>
      )}

      {/* Low stock alert */}
      {lowStock > 0 && !loading && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3.5 mb-5">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-700">
            <strong>{lowStock} product{lowStock > 1 ? 's' : ''}</strong> running low. Restock soon to avoid missed sales.
          </p>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by product name or SKU..."
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none" />
      </div>

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <Package className="w-12 h-12 text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">{search ? 'No products found' : 'No products to manage'}</p>
          {!search && (
            <Link href="/seller/products/add" className="mt-4 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-right">Price</th>
                <th className="px-4 py-3 text-center">Stock</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(product => (
                <tr key={product.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url
                        ? <img src={product.images[0].url} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                        : <div className="w-10 h-10 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center">
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                      }
                      <div>
                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400">{product.category?.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{product.sku || '—'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-700 text-right">₹{product.price.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 text-center">
                    {editingId === product.id ? (
                      <div className="flex items-center justify-center gap-2">
                        <input type="number" min="0" // eslint-disable-line
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-20 px-2 py-1 text-sm border border-emerald-400 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                          autoFocus
                          onKeyDown={e => {
                            if (e.key === 'Enter') updateStock(product.id, parseInt(editValue))
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                        />
                        <button onClick={() => updateStock(product.id, parseInt(editValue))}
                          className="px-2 py-1 bg-emerald-600 text-white text-xs rounded-lg">✓</button>
                        <button onClick={() => setEditingId(null)} className="px-2 py-1 text-xs text-gray-400">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(product.id); setEditValue(String(product.stock_quantity)) }}
                        className="group inline-flex items-center gap-1.5 cursor-pointer hover:bg-gray-100 px-3 py-1.5 rounded-lg">
                        <span className={`text-sm font-semibold ${
                          product.stock_quantity === 0 ? 'text-red-600' :
                          product.stock_quantity < 10 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>{product.stock_quantity}</span>
                        <Pencil className="w-3 h-3 text-gray-300 group-hover:text-gray-500" />
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.stock_quantity === 0 ? 'bg-red-50 text-red-600' :
                      product.stock_quantity < 10 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {product.stock_quantity === 0 ? 'Out of Stock' :
                       product.stock_quantity < 10 ? '⚠ Low Stock' : 'In Stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
