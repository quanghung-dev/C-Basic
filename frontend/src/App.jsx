import React, { useState, useEffect } from 'react'
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  AlertCircle,
  X,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { getProducts, createProduct, updateProduct, deleteProduct } from './services/api'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [toast, setToast] = useState(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    stock: ''
  })

  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = async (search = '') => {
    setLoading(true)
    setError(null)
    try {
      const data = await getProducts(search)
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setError('Could not load products. Please check if backend is running.')
      showToast('Error loading products', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProducts(searchQuery)
  }

  const handleOpenAddModal = () => {
    setEditingProduct(null)
    setFormData({ name: '', price: '', category: '', stock: '0' })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      price: product.price.toString(),
      category: product.category || '',
      stock: (product.stock ?? 0).toString()
    })
    setIsModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name || !formData.price) {
      showToast('Name and price are required', 'error')
      return
    }

    const price = parseFloat(formData.price)
    if (isNaN(price) || price < 0) {
      showToast('Price must be a valid positive number', 'error')
      return
    }

    const stock = parseInt(formData.stock)
    if (isNaN(stock) || stock < 0) {
      showToast('Stock must be a valid non-negative integer', 'error')
      return
    }

    const payload = {
      name: formData.name,
      price,
      category: formData.category || 'General',
      stock
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, payload)
      } else {
        await createProduct(payload)
      }

      showToast(
        editingProduct ? 'Product updated successfully!' : 'Product created successfully!',
        'success'
      )
      setIsModalOpen(false)
      fetchProducts(searchQuery)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Operation failed', 'error')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await deleteProduct(id)
      showToast('Product deleted successfully', 'success')
      fetchProducts(searchQuery)
    } catch (err) {
      console.error(err)
      showToast(err.message || 'Failed to delete product', 'error')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg shadow-lg border text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-rose-500" />}
          <span>{toast.message}</span>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-indigo-650" /> Product Manager
            </h1>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        <section className="mb-4">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-550 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </section>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex gap-2 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error: </span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
              <span className="text-sm text-slate-500">Loading products...</span>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No products found</p>
              <p className="text-xs text-slate-400 mt-0.5">Try a different search query or add a new product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-650 text-xs font-semibold uppercase tracking-wider">
                    <th className="px-6 py-3">Product Name</th>
                    <th className="px-6 py-3">Category</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Stock Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900">{product.name}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {product.category || 'General'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        ${parseFloat(product.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center text-xs font-medium ${(product.stock ?? 0) === 0 ? 'text-rose-600' : (product.stock ?? 0) <= 5 ? 'text-amber-600' : 'text-emerald-600'
                          }`}>
                          {(product.stock ?? 0) === 0 ? 'Out of stock' : `${product.stock} units`}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-indigo-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-rose-605 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-150 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                {editingProduct ? 'Edit Product Details' : 'Add New Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Mechanical Keyboard"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Price (USD) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      type="number"
                      name="price"
                      required
                      step="0.01"
                      min="0"
                      placeholder="99.99"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-6 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    min="0"
                    placeholder="25"
                    value={formData.stock}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  placeholder="e.g. Electronics, Books"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-150 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
