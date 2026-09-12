import React from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'

export const SellerProductList = ({
  products = [],
  isLoading = false,
  error = null,
  onTogglePublish,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
}) => {
  const formatPrice = (amount, currency = 'INR') => {
    if (currency === 'INR') {
      return `₹${Number(amount || 0).toLocaleString('en-IN')}`
    }
    return `${currency} ${Number(amount || 0).toFixed(2)}`
  }

  if (isLoading) {
    return (
      <div className="py-16 text-center">
        <span className="inline-block animate-spin border-2 border-ink border-t-transparent rounded-full w-8 h-8" />
        <p className="text-xs uppercase tracking-eyebrow text-ink-muted mt-4">
          Loading seller inventory...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-ink">Catalog & Inventory</h2>
          <p className="text-xs text-ink-muted mt-1">
            Manage your store's clothing listings, stock levels, and publication status.
          </p>
        </div>
        <Link
          to="/seller/products/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Product
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-critical/10 border border-critical text-critical text-xs">
          {error}
        </div>
      )}

      {products.length === 0 ? (
        <div className="py-20 text-center border border-hairline bg-surface p-8">
          <p className="text-sm text-ink-muted mb-4">You have not created any products yet.</p>
          <Link
            to="/seller/products/new"
            className="inline-block px-6 py-2.5 bg-ink text-canvas text-xs uppercase tracking-eyebrow font-medium"
          >
            Create Your First Product
          </Link>
        </div>
      ) : (
        <div className="border border-hairline bg-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-canvas border-b border-hairline uppercase tracking-eyebrow text-ink-muted text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-medium">Product</th>
                  <th className="py-3.5 px-4 font-medium">Price</th>
                  <th className="py-3.5 px-4 font-medium">Stock by Size</th>
                  <th className="py-3.5 px-4 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline text-ink">
                {products.map((product) => {
                  const id = product._id || product.id
                  const mainImage = product.images?.[0]?.url
                  const totalStock = product.sizes?.reduce((acc, s) => acc + (s.stock || 0), 0) || 0

                  return (
                    <tr key={id} className="hover:bg-canvas/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-14 bg-canvas border border-hairline flex-shrink-0 overflow-hidden">
                            {mainImage ? (
                              <img
                                src={mainImage}
                                alt={product.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-ink-muted">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-sm text-ink block line-clamp-1">
                              {product.title}
                            </span>
                            <span className="text-[11px] text-ink-muted">
                              {product.categories?.join(', ')}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">
                        {formatPrice(product.price?.amount, product.price?.currency)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {product.sizes?.map((s) => (
                            <span
                              key={s.size}
                              className={`px-1.5 py-0.5 border text-[10px] ${
                                s.stock > 0
                                  ? 'border-hairline bg-canvas text-ink'
                                  : 'border-critical/30 bg-critical/5 text-critical'
                              }`}
                            >
                              {s.size}: {s.stock}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-ink-muted block mt-1">
                          Total stock: {totalStock}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-block px-2.5 py-1 text-[10px] uppercase tracking-eyebrow font-medium ${
                            product.isPublished
                              ? 'bg-positive/10 text-positive border border-positive/30'
                              : 'bg-sand/30 text-ink-muted border border-hairline'
                          }`}
                        >
                          {product.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onTogglePublish(id)}
                            title={product.isPublished ? 'Unpublish Product' : 'Publish Product'}
                            className="p-1.5 border border-hairline hover:border-ink text-ink-muted hover:text-ink transition-colors"
                          >
                            {product.isPublished ? (
                              <EyeOff className="w-4 h-4 text-ink-muted" />
                            ) : (
                              <Eye className="w-4 h-4 text-positive" />
                            )}
                          </button>
                          <Link
                            to={`/seller/products/edit/${id}`}
                            className="p-1.5 border border-hairline hover:border-ink text-ink-muted hover:text-ink transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-hairline px-4 py-3 bg-canvas flex items-center justify-between text-xs">
              <span className="text-ink-muted">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => onPageChange(currentPage - 1)}
                  className="px-3 py-1 border border-hairline bg-surface disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => onPageChange(currentPage + 1)}
                  className="px-3 py-1 border border-hairline bg-surface disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
