import React, { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useProducts } from '../features/products/hooks/useProducts'
import { ProductFilter } from '../features/products/ui/ProductFilter'
import { ProductGrid } from '../features/products/ui/ProductGrid'

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'All'
  const searchParam = searchParams.get('search') || ''
  const pageParam = parseInt(searchParams.get('page') || '1')

  const {
    products,
    isLoading,
    error,
    totalPages,
    currentPage,
    allCategories,
    selectedCategory,
    sortBy,
    loadProducts,
    changeCategory,
    changeSearchQuery,
    changeSortBy,
  } = useProducts(true, pageParam)

  // Sync category and search param with Redux
  useEffect(() => {
    changeCategory(categoryParam)
  }, [categoryParam, changeCategory])

  useEffect(() => {
    changeSearchQuery(searchParam)
  }, [searchParam, changeSearchQuery])

  const handleSelectCategory = (cat) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (cat === 'All') {
        next.delete('category')
      } else {
        next.set('category', cat)
      }
      return next
    })
  }

  const handlePageChange = (newPage) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', newPage)
      return next
    })
    loadProducts(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
      {/* Header */}
      <div className="mb-8">
        <span className="text-xs uppercase tracking-eyebrow text-ink-muted">Catalog</span>
        <h1 className="font-serif text-3xl md:text-5xl text-ink font-normal mt-1">
          {searchParam
            ? `Results for "${searchParam}"`
            : categoryParam !== 'All'
            ? categoryParam
            : 'All Menswear'}
        </h1>
        <p className="text-xs text-ink-muted mt-2">
          Precision-cut silhouettes, tactile textures, and effortless essentials.
        </p>
      </div>

      {/* Filter Bar */}
      <ProductFilter
        categories={allCategories}
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        sortBy={sortBy}
        onSelectSortBy={changeSortBy}
        totalResults={products.length}
      />

      {/* Products Grid */}
      <ProductGrid products={products} isLoading={isLoading} error={error} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 pt-8 border-t border-hairline flex items-center justify-between text-xs">
          <span className="text-ink-muted uppercase tracking-eyebrow">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="px-4 py-2 border border-hairline bg-surface text-ink uppercase tracking-eyebrow disabled:opacity-40 hover:border-ink transition-colors"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="px-4 py-2 border border-hairline bg-surface text-ink uppercase tracking-eyebrow disabled:opacity-40 hover:border-ink transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
